import { useState, useEffect, useMemo, useRef } from "react";
import {
  Home,
  Building2,
  User,
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import {
  SERVICES,
  ADDONS,
  THERAPISTS,
  PRICING,
  fmt,
  getPrice,
  durList,
  LOCATION_LABEL,
} from "../config/services";
import DateStrip from "./DateStrip";
import SlotGrid from "./SlotGrid";
import { useAvailability } from "../hooks/useAvailability";

const STEPS = ["Service", "Add-ons", "Therapist", "Date", "Confirm"];
const WA_NUMBER = "2347040723894";
const PAYSTACK_KEY = "pk_live_915663b76742c16f999c99e6251596ee7c5c9584";

export default function BookingWizard() {
  const [step, setStep] = useState(0);

  // ── Draft ──
  const [svcType, setSvcType] = useState("studio");
  const [service, setService] = useState("");
  const [duration, setDuration] = useState("");
  const [addons, setAddons] = useState([]);
  const [therapist, setTherapist] = useState("any");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // ── Customer ──
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [email, setEmail] = useState("");
  const [payOpt, setPayOpt] = useState("full");

  // ── UI ──
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(null);

  // ── Scroll anchor (fixes "next step opens mid-page") ──
  const topRef = useRef(null);
  useEffect(() => {
    if (!topRef.current) return;
    const headerOffset = window.innerWidth < 768 ? 64 : 88;
    const y =
      topRef.current.getBoundingClientRect().top +
      window.pageYOffset -
      headerOffset;
    window.scrollTo({ top: Math.max(y, 0), behavior: "smooth" });
  }, [step]);

  const totalDuration = useMemo(() => {
    if (!duration) return 0;
    return (
      Number(duration) +
      addons.reduce(
        (a, id) => a + (ADDONS.find((x) => x.id === id)?.minutes || 0),
        0,
      )
    );
  }, [duration, addons]);

  const basePrice = service ? getPrice(svcType, service, duration) : 0;
  const addonsTotal = addons.reduce(
    (a, id) => a + (ADDONS.find((x) => x.id === id)?.price || 0),
    0,
  );
  const total = basePrice + addonsTotal;

  const { available, loading: slotsLoading } = useAvailability({
    date,
    serviceType: svcType,
    minutes: totalDuration || 60,
  });

  const customerValid = !!(
    name &&
    phone.replace(/\D/g, "").length >= 11 &&
    email
  );
  const stepValid = [
    !!(svcType && service && duration),
    true,
    !!therapist,
    !!(date && time),
    customerValid,
  ];

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  useEffect(() => {
    if (!service) return;
    const opts = durList(service);
    if (!opts.includes(Number(duration))) setDuration(opts[0]);
  }, [service, duration]);

  useEffect(() => {
    setTime("");
  }, [date, svcType, totalDuration]);

  const submitBooking = async () => {
    if (!customerValid) return;
    setLoading(true);
    try {
      const svcObj = SERVICES.find((s) => s.id === service);

      if (svcType === "mobile") {
        await finalizeBooking("PAY-AFTER", svcObj);
        return;
      }

      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          email,
          serviceType: svcType,
          date,
          time,
          service: svcObj?.name,
          duration,
          addons: addons.map(
            (id) => ADDONS.find((x) => x.id === id)?.name || id,
          ),
          therapist,
          subtotal: total,
          totalAmount: total,
          paymentAmount: payOpt === "full" ? total : Math.round(total * 0.5),
          paymentType: payOpt === "full" ? "Full" : "Deposit",
        }),
      });
      const { ref } = await res.json();

      if (!window.PaystackPop) {
        setLoading(false);
        return alert(
          "Payment system is still loading. Please try again in a moment.",
        );
      }

      const amount = payOpt === "full" ? total : Math.round(total * 0.5);
      window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: email || "customer@vivifymassageandspa.online",
        amount: amount * 100,
        currency: "NGN",
        ref,
        metadata: {
          custom_fields: [
            {
              display_name: "Customer",
              variable_name: "customer",
              value: name,
            },
          ],
        },
        callback: async (r) => {
          await finalizeBooking(r.reference, svcObj, ref);
        },
        onClose: () => {
          setLoading(false);
          alert("Payment cancelled. You can try again.");
        },
      }).openIframe();
    } catch (e) {
      console.error(e);
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  const finalizeBooking = async (
    paymentRef = "PAY-AFTER",
    svcObj,
    existingRef,
  ) => {
    const ref =
      existingRef ||
      `VMS-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}-${Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase()}`;

    try {
      await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking_multi",
          data: {
            ref,
            customerName: name,
            customerPhone: phone,
            email,
            items: [
              {
                serviceName: svcObj?.name,
                service,
                svcType,
                duration,
                addons: addons.map(
                  (id) => ADDONS.find((x) => x.id === id)?.name || id,
                ),
                therapist,
                date,
                time,
              },
            ],
            subtotal: total,
            paymentRef,
            paymentType:
              svcType === "mobile"
                ? "Pay After Session"
                : payOpt === "full"
                  ? "Full"
                  : "Deposit",
          },
        }),
      });
    } catch (err) {
      console.error("Email failed:", err);
    }

    setBooking({
      ref,
      customerName: name,
      serviceName: svcObj?.name,
      duration,
      total,
      svcType,
    });
    setLoading(false);
    setSuccess(true);
  };

  const reset = () => {
    setSuccess(false);
    setBooking(null);
    setStep(0);
    setService("");
    setDuration("");
    setAddons([]);
    setTherapist("any");
    setDate("");
    setTime("");
    setName("");
    setPhone("");
    setEmail("");
    setPhoneErr("");
    setPayOpt("full");
  };

  const sendWA = () => {
    if (!booking) return;
    const msg =
      `Hello Vivify! 🌟\n\nRef: ${booking.ref}\n` +
      `👤 ${booking.customerName}\n` +
      `💆 ${booking.serviceName} (${booking.duration} min)\n` +
      `💰 ${fmt(booking.total)}\n\n` +
      `Please confirm my appointment.`;
    window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
      msg,
    )}`;
  };

  const ctaLabel = (() => {
    if (svcType === "mobile") return "Book Appointment";
    if (payOpt === "full") return `Pay ${fmt(total)}`;
    return `Pay 50% — ${fmt(Math.round(total * 0.5))}`;
  })();

  return (
    <div ref={topRef} className="max-w-2xl mx-auto pb-32 md:pb-16">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex items-center gap-2">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background:
                    step > i
                      ? "#10b981"
                      : step === i
                        ? "linear-gradient(135deg,#0891b2,#06b6d4)"
                        : "rgba(255,255,255,0.15)",
                  color: step >= i ? "white" : "rgba(255,255,255,0.5)",
                  boxShadow:
                    step === i ? "0 4px 12px rgba(6,182,212,0.4)" : "none",
                }}
              >
                {step > i ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-0.5 rounded-full transition-all"
                  style={{
                    background: step > i ? "#10b981" : "rgba(255,255,255,0.15)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-cyan-200">
          Step {step + 1} of 5 · {STEPS[step]}
        </p>
      </div>

      <div
        className="bg-white rounded-3xl overflow-hidden shadow-2xl"
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* Card header */}
        <div
          className="px-6 py-5"
          style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)" }}
        >
          <p
            className="font-bold text-white leading-tight"
            style={{ fontFamily: "Cormorant Garamond", fontSize: "1.4rem" }}
          >
            {step === 0 && "Choose your massage"}
            {step === 1 && "Add something special?"}
            {step === 2 && "Pick your therapist"}
            {step === 3 && "When works best?"}
            {step === 4 && "Almost done"}
          </p>
          <p className="text-xs text-cyan-50 mt-1">
            {step === 0 && "Pick location, massage and duration"}
            {step === 1 && "Optional — skip if you prefer"}
            {step === 2 && "Male, female, or let us choose"}
            {step === 3 && "Live slots — booked times are hidden"}
            {step === 4 && "Enter your details and confirm"}
          </p>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-7">
          {/* ── STEP 0 ── */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <Label>Location</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      id: "studio",
                      label: LOCATION_LABEL.studio,
                      sub: "Pay online",
                      Icon: Building2,
                    },
                    {
                      id: "mobile",
                      label: LOCATION_LABEL.mobile,
                      sub: "Pay after session",
                      Icon: Home,
                    },
                  ].map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSvcType(o.id)}
                      className="p-4 rounded-2xl border-2 transition-all text-left"
                      style={{
                        borderColor: svcType === o.id ? "#06b6d4" : "#e5e7eb",
                        background: svcType === o.id ? "#f0f9ff" : "white",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <o.Icon
                          className="w-5 h-5"
                          style={{
                            color: svcType === o.id ? "#0891b2" : "#9ca3af",
                          }}
                        />
                        {svcType === o.id && <CheckMark />}
                      </div>
                      <p className="font-bold text-gray-900 text-sm">
                        {o.label}
                      </p>
                      <p
                        className="text-xs mt-0.5 font-semibold"
                        style={{ color: "#0891b2" }}
                      >
                        {o.sub}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Massage</Label>
                <div className="space-y-3">
                  {SERVICES.map((svc) => {
                    const sel = service === svc.id;
                    return (
                      <button
                        key={svc.id}
                        onClick={() => setService(svc.id)}
                        className="w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3"
                        style={{
                          borderColor: sel ? "#06b6d4" : "#e5e7eb",
                          background: sel ? "#f0f9ff" : "white",
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                          style={{ background: sel ? "#e0f2fe" : "#f3f4f6" }}
                        >
                          {svc.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm">
                              {svc.name}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${svc.bc}`}
                            >
                              {svc.badge}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {svc.benefit}
                          </p>
                          <p
                            className="text-xs mt-2 font-bold"
                            style={{ color: "#0891b2" }}
                          >
                            From {fmt(getPrice(svcType, svc.id, 60))}
                          </p>
                        </div>
                        {sel && <CheckMark />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {service && (
                <div>
                  <Label>Duration</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {durList(service).map((m) => {
                      const p = getPrice(svcType, service, m);
                      const sel = Number(duration) === m;
                      return (
                        <button
                          key={m}
                          onClick={() => setDuration(m)}
                          className="p-4 rounded-2xl border-2 text-center transition-all"
                          style={{
                            borderColor: sel ? "#06b6d4" : "#e5e7eb",
                            background: sel ? "#f0f9ff" : "white",
                          }}
                        >
                          <p
                            className="text-2xl font-bold text-gray-900"
                            style={{ fontFamily: "Cormorant Garamond" }}
                          >
                            {m}
                          </p>
                          <p className="text-xs text-gray-400 mb-1">MIN</p>
                          <p
                            className="text-sm font-bold"
                            style={{ color: "#0891b2" }}
                          >
                            {fmt(p)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="space-y-3">
              {ADDONS.map((a) => {
                const on = addons.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() =>
                      setAddons(
                        on
                          ? addons.filter((x) => x !== a.id)
                          : [...addons, a.id],
                      )
                    }
                    className="w-full p-4 rounded-2xl border-2 flex items-center gap-3 text-left transition-all"
                    style={{
                      borderColor: on ? "#06b6d4" : "#e5e7eb",
                      background: on ? "#f0f9ff" : "white",
                    }}
                  >
                    <div className="text-3xl flex-shrink-0">{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">
                        {a.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="text-sm font-bold"
                        style={{ color: "#0891b2" }}
                      >
                        +{fmt(a.price)}
                      </p>
                      {on && (
                        <p className="text-xs text-emerald-600 font-bold mt-1">
                          ✓ Added
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="space-y-3">
              {THERAPISTS.map((t) => {
                const sel = therapist === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTherapist(t.id)}
                    className="w-full p-4 rounded-2xl border-2 flex items-center gap-3 text-left transition-all"
                    style={{
                      borderColor: sel ? "#06b6d4" : "#e5e7eb",
                      background: sel ? "#f0f9ff" : "white",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: sel ? "#0891b2" : "#f1f5f9" }}
                    >
                      <User
                        className="w-5 h-5"
                        style={{ color: sel ? "white" : "#94a3b8" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.role}</p>
                    </div>
                    {sel && <CheckMark />}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label>Date</Label>
                <DateStrip value={date} onChange={setDate} />
              </div>

              {date && (
                <div>
                  <Label>
                    Time{" "}
                    <span className="text-gray-400 font-normal">
                      · {totalDuration} min
                    </span>
                  </Label>
                  {svcType === "mobile" && (
                    <p className="text-xs text-gray-500 mb-3">
                      Mobile service runs 7 AM – 12 AM, 7 days a week
                    </p>
                  )}
                  <SlotGrid
                    available={available}
                    loading={slotsLoading}
                    selected={time}
                    onSelect={setTime}
                    serviceType={svcType}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <Label>Your Details</Label>
                <div className="space-y-4">
                  <Field
                    label="Full Name"
                    value={name}
                    onChange={setName}
                    placeholder="Adeola Ogunlesi"
                  />
                  <PhoneField
                    label="Phone Number"
                    value={phone}
                    error={phoneErr}
                    onChange={(v) => {
                      setPhone(v);
                      const d = v.replace(/\D/g, "");
                      setPhoneErr(
                        d.length > 0 && d.length < 11
                          ? "Must be 11 digits"
                          : "",
                      );
                    }}
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              {svcType === "studio" && (
                <div>
                  <Label>Payment Option</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        id: "full",
                        l: "Pay in full",
                        s: "Complete payment now",
                        a: total,
                      },
                      {
                        id: "deposit",
                        l: "50% Deposit",
                        s: "Balance at the studio",
                        a: Math.round(total * 0.5),
                      },
                    ].map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setPayOpt(o.id)}
                        className="p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3"
                        style={{
                          borderColor: payOpt === o.id ? "#06b6d4" : "#e5e7eb",
                          background: payOpt === o.id ? "#f0f9ff" : "white",
                        }}
                      >
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {o.l}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{o.s}</p>
                        </div>
                        <p
                          className="text-lg font-bold"
                          style={{ color: "#0891b2" }}
                        >
                          {fmt(o.a)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="rounded-2xl p-4"
                style={{
                  background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
                  border: "2px solid #bae6fd",
                }}
              >
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-700 mb-3">
                  Your Booking
                </p>
                <SummaryRow
                  icon="💆"
                  label="Massage"
                  value={SERVICES.find((s) => s.id === service)?.name}
                />
                <SummaryRow
                  icon={svcType === "studio" ? "🏢" : "🏠"}
                  label="Location"
                  value={
                    svcType === "studio"
                      ? LOCATION_LABEL.studio
                      : LOCATION_LABEL.mobile
                  }
                />
                <SummaryRow
                  icon="⏱"
                  label="Duration"
                  value={`${totalDuration} min`}
                />
                <SummaryRow
                  icon="👤"
                  label="Therapist"
                  value={
                    therapist === "male"
                      ? "Male"
                      : therapist === "female"
                        ? "Female"
                        : "Any"
                  }
                />
                {addons.length > 0 && (
                  <SummaryRow
                    icon="✨"
                    label="Add-ons"
                    value={addons
                      .map((id) => ADDONS.find((x) => x.id === id)?.name)
                      .join(", ")}
                  />
                )}
                <SummaryRow
                  icon="📅"
                  label="Date"
                  value={`${date} · ${time}`}
                />
                <div
                  className="flex justify-between items-center pt-3 mt-3"
                  style={{ borderTop: "1px solid #bae6fd" }}
                >
                  <span className="text-sm font-bold text-gray-700">Total</span>
                  <span
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: "Cormorant Garamond",
                      color: "#0891b2",
                    }}
                  >
                    {fmt(total)}
                  </span>
                </div>
              </div>

              {svcType === "mobile" && (
                <InfoBar icon={<Wallet className="w-4 h-4" />}>
                  <b>Pay after session</b> — cash or transfer to your therapist
                  when done.
                </InfoBar>
              )}
              {svcType === "studio" && (
                <InfoBar icon={<ShieldCheck className="w-4 h-4" />}>
                  <b>Secure payment</b> — encrypted via Paystack. 256-bit SSL.
                </InfoBar>
              )}
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="p-5 sm:p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={back}
                className="px-5 py-4 rounded-2xl font-bold text-sm border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-100 transition-all"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" />
                Back
              </button>
            )}

            {step < 4 ? (
              <>
                {step === 1 && (
                  <button
                    onClick={next}
                    className="px-5 py-4 rounded-2xl font-bold text-sm border-2 border-gray-200 bg-white text-gray-500 hover:bg-gray-100 transition-all"
                  >
                    Skip
                  </button>
                )}
                <button
                  onClick={next}
                  disabled={!stepValid[step]}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2"
                  style={{
                    background: stepValid[step]
                      ? "linear-gradient(135deg,#0891b2,#06b6d4)"
                      : "#d1d5db",
                    cursor: stepValid[step] ? "pointer" : "not-allowed",
                    boxShadow: stepValid[step]
                      ? "0 6px 20px rgba(6,182,212,0.35)"
                      : "none",
                  }}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={submitBooking}
                disabled={!customerValid}
                className="flex-1 py-4 rounded-2xl font-bold text-sm text-white transition-all"
                style={{
                  background: customerValid
                    ? svcType === "mobile"
                      ? "linear-gradient(135deg,#059669,#10b981)"
                      : "linear-gradient(135deg,#0891b2,#06b6d4)"
                    : "#d1d5db",
                  cursor: customerValid ? "pointer" : "not-allowed",
                  boxShadow: customerValid
                    ? "0 6px 20px rgba(6,182,212,0.35)"
                    : "none",
                }}
              >
                {ctaLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl mx-4">
            <div
              className="w-14 h-14 rounded-full mx-auto mb-4 animate-spin"
              style={{
                border: "3px solid #e5e7eb",
                borderTopColor: "#06b6d4",
              }}
            />
            <p
              className="font-bold text-gray-900"
              style={{ fontFamily: "Cormorant Garamond", fontSize: 20 }}
            >
              {svcType === "mobile"
                ? "Booking your appointment…"
                : "Opening payment…"}
            </p>
          </div>
        </div>
      )}

      {success && booking && (
        <Modal onClose={reset}>
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto flex items-center justify-center mb-3">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h3
              className="text-2xl font-bold text-gray-900 mb-1"
              style={{ fontFamily: "Cormorant Garamond" }}
            >
              {booking.svcType === "mobile"
                ? "Appointment Booked!"
                : "Payment Confirmed!"}
            </h3>
            <p className="text-sm text-gray-500">
              Ref: <span className="font-mono">{booking.ref}</span>
            </p>
          </div>

          <div className="rounded-2xl p-4 mb-4 bg-cyan-50 border border-cyan-100">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Massage</span>
              <span className="font-semibold text-gray-900">
                {booking.serviceName}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Duration</span>
              <span className="font-semibold">{booking.duration} min</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">
                {booking.svcType === "mobile" ? "Total" : "Paid"}
              </span>
              <span
                className="text-lg font-bold"
                style={{
                  fontFamily: "Cormorant Garamond",
                  color: "#0891b2",
                }}
              >
                {fmt(booking.total)}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-4 text-xs text-amber-800 leading-relaxed">
            <b>What's next?</b> Our team will reach out on WhatsApp to confirm
            your therapist and time slot.
          </div>

          <button
            onClick={sendWA}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white mb-2"
            style={{ background: "#25D366" }}
          >
            💬 Send Details via WhatsApp
          </button>
          <button
            onClick={reset}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700"
          >
            Done
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── Micro components ──
const Label = ({ children }) => (
  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
    {children}
  </p>
);

const CheckMark = () => (
  <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
    <Check className="w-3.5 h-3.5 text-white" />
  </div>
);

const Field = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
      {label} *
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl text-sm border-2 transition-all"
      style={{
        borderColor: value ? "#06b6d4" : "#e5e7eb",
        background: value ? "#f0f9ff" : "white",
      }}
    />
  </div>
);

const PhoneField = ({ label, value, error, onChange }) => {
  const digits = value.replace(/\D/g, "");
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
        {label} *
      </label>
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="08012345678"
        maxLength={14}
        className="w-full px-4 py-3 rounded-xl text-sm border-2 transition-all"
        style={{
          borderColor: error
            ? "#ef4444"
            : digits.length === 11
              ? "#06b6d4"
              : "#e5e7eb",
          background: digits.length === 11 ? "#f0f9ff" : "white",
        }}
      />
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
      {!error && digits.length > 0 && (
        <p
          className="text-xs mt-1.5"
          style={{ color: digits.length === 11 ? "#059669" : "#6b7280" }}
        >
          {digits.length}/11 digits {digits.length === 11 && "✓"}
        </p>
      )}
    </div>
  );
};

const SummaryRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between text-sm mb-2">
    <span className="text-gray-500 flex items-center gap-2">
      <span>{icon}</span>
      {label}
    </span>
    <span className="font-semibold text-gray-900 text-right max-w-[60%] truncate">
      {value}
    </span>
  </div>
);

const InfoBar = ({ icon, children }) => (
  <div className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 leading-relaxed">
    <span className="flex-shrink-0 mt-0.5 text-cyan-600">{icon}</span>
    <span>{children}</span>
  </div>
);

const Modal = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-3"
    style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    onClick={onClose}
  >
    <div
      className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);
