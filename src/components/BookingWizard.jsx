import { useState, useEffect, useMemo } from "react";
import {
  Home,
  Building2,
  User,
  Plus,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";
import {
  SERVICES,
  ADDONS,
  THERAPISTS,
  PRICING,
  fmt,
  getPrice,
  durList,
  cartSubtotal,
  cartMinutes,
} from "../config/services";
import { TF, PF, SC, Tick, IB, Btn, Modal, SuccessIcon } from "./ui";
import CartSidebar from "./CartSidebar";
import DateStrip from "./DateStrip";
import SlotGrid from "./SlotGrid";
import { useAvailability } from "../hooks/useAvailability";

const STEPS = ["Service", "Add-ons", "Therapist", "Date & Time", "Details"];
const WA_NUMBER = "2347040723894";
const PAYSTACK_KEY = "pk_live_915663b76742c16f999c99e6251596ee7c5c9584";

export default function BookingWizard() {
  const [step, setStep] = useState(0);
  const [slideDir, setSlideDir] = useState("fwd");

  // ── Draft ──
  const [svcType, setSvcType] = useState("studio");
  const [service, setService] = useState("");
  const [duration, setDuration] = useState("");
  const [addons, setAddons] = useState([]);
  const [therapist, setTherapist] = useState("any");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // ── Cart ──
  const [items, setItems] = useState([]);

  // ── Customer ──
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [email, setEmail] = useState("");
  const [payOpt, setPayOpt] = useState("full");

  // ── UI ──
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(null);
  const [toast, setToast] = useState(null);

  const draftDuration = useMemo(() => {
    if (!duration) return 0;
    return (
      Number(duration) +
      addons.reduce(
        (a, id) => a + (ADDONS.find((x) => x.id === id)?.minutes || 0),
        0,
      )
    );
  }, [duration, addons]);

  const { available, loading: slotsLoading } = useAvailability({
    date,
    serviceType: svcType,
    minutes: draftDuration || 60,
  });

  const subtotal = cartSubtotal(items);

  // ── Validation ──
  const step0Valid = !!(svcType && service && duration);
  const step1Valid = true;
  const step2Valid = !!therapist;
  const step3Valid = !!(date && time);
  const customerValid = !!(
    name &&
    phone.replace(/\D/g, "").length >= 11 &&
    email
  );
  const step4Valid = step0Valid && step2Valid && step3Valid && customerValid;
  const stepValids = [
    step0Valid,
    step1Valid,
    step2Valid,
    step3Valid,
    step4Valid,
  ];

  const canPay = items.length > 0 && customerValid;

  const goNext = () => {
    setSlideDir("fwd");
    setStep((s) => Math.min(s + 1, 4));
  };
  const goBack = () => {
    setSlideDir("bck");
    setStep((s) => Math.max(s - 1, 0));
  };

  useEffect(() => {
    if (!service) return;
    const opts = durList(service);
    if (!opts.includes(Number(duration))) setDuration(opts[0]);
  }, [service, duration]);

  useEffect(() => {
    setTime("");
  }, [date, svcType, draftDuration]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const resetDraft = () => {
    setService("");
    setDuration("");
    setAddons([]);
    setTherapist("any");
    setDate("");
    setTime("");
  };

  const addToSession = () => {
    if (!step4Valid) return;

    if (items.length > 0 && items[0].svcType !== svcType) {
      alert(
        `Your session is currently for ${
          items[0].svcType === "studio" ? "Home Studio" : "Mobile Service"
        }. ` +
          `Please complete this booking first, or remove the existing items to switch.`,
      );
      return;
    }

    const svcObj = SERVICES.find((s) => s.id === service);
    const item = {
      svcType,
      service,
      serviceName: svcObj?.name,
      duration,
      addons: [...addons],
      therapist,
      date,
      time,
    };

    setItems((prev) => [...prev, item]);
    resetDraft();
    setSlideDir("bck");
    setStep(0);
    setToast({
      type: "success",
      msg: `${svcObj?.name} · ${duration} min added to your session`,
    });
  };

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const handlePay = async () => {
    if (!canPay) return;
    setLoading(true);
    try {
      const first = items[0];
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          email,
          serviceType: first.svcType,
          date: first.date,
          time: first.time,
          items,
          subtotal,
          duration: cartMinutes(items),
          paymentType:
            first.svcType === "studio"
              ? payOpt === "full"
                ? "Full"
                : "Deposit"
              : "Pay After Session",
          paymentAmount:
            first.svcType === "studio"
              ? payOpt === "full"
                ? subtotal
                : Math.round(subtotal * 0.5)
              : subtotal,
        }),
      });
      const { ref } = await res.json();

      const finalize = async (paymentRef = "—") => {
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
              items,
              subtotal,
              paymentRef,
              paymentType: payOpt,
            },
          }),
        });
        setBooking({ ref, customerName: name, items, subtotal, paymentRef });
        setLoading(false);
        setSuccess(true);
      };

      // Mobile → no upfront payment
      if (first.svcType === "mobile") return finalize("PAY-AFTER");

      if (!window.PaystackPop) {
        setLoading(false);
        return alert(
          "Payment system is still loading. Please try again in a moment.",
        );
      }

      const amount = payOpt === "full" ? subtotal : Math.round(subtotal * 0.5);
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
        callback: (r) => finalize(r.reference),
        onClose: () => {
          setLoading(false);
          alert("Payment cancelled. You can retry from the cart.");
        },
      }).openIframe();
    } catch (e) {
      console.error(e);
      setLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  const sendWA = () => {
    if (!booking) return;
    const lines = booking.items
      .map(
        (it, i) =>
          `${i + 1}. ${it.serviceName} (${it.duration} min${
            it.addons?.length ? " + " + it.addons.length + " add-on(s)" : ""
          })`,
      )
      .join("\n");
    const msg =
      `Hello Vivify Massage & Spa! 🌟\n\n` +
      `Booking Ref: ${booking.ref}\n` +
      `👤 ${booking.customerName}\n\n` +
      `${lines}\n\n` +
      `💰 Subtotal: ${fmt(booking.subtotal)}\n\n` +
      `Please confirm my appointment.`;
    window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
      msg,
    )}`;
  };

  const closeSuccess = () => {
    setSuccess(false);
    setBooking(null);
    setItems([]);
    resetDraft();
    setName("");
    setPhone("");
    setEmail("");
    setPhoneErr("");
    setPayOpt("full");
    setStep(0);
  };

  // Draft subtotal for the "This Service" panel
  const draftSubtotal = service
    ? getPrice(svcType, service, duration) +
      addons.reduce(
        (a, id) => a + (ADDONS.find((x) => x.id === id)?.price || 0),
        0,
      )
    : 0;

  return (
    <div className="flex gap-6 max-w-6xl mx-auto">
      <div className="flex-1 min-w-0">
        {/* Progress */}
        <div className="mb-5 px-1">
          <div className="flex gap-1.5 mb-2">
            {STEPS.map((_, n) => (
              <div
                key={n}
                className="flex-1 rounded-full"
                style={{
                  height: 3,
                  background:
                    step > n
                      ? "#0891b2"
                      : step === n
                        ? "rgba(255,255,255,0.95)"
                        : "rgba(255,255,255,0.2)",
                  transition: "background 0.35s ease",
                }}
              />
            ))}
          </div>
          <div className="flex">
            {STEPS.map((label, i) => (
              <div key={i} className="flex-1 text-center px-0.5">
                <span
                  style={{
                    fontSize: "0.58rem",
                    display: "block",
                    lineHeight: 1.3,
                    letterSpacing: "0.01em",
                    fontWeight: step === i ? 700 : 400,
                    color:
                      step > i
                        ? "rgba(255,255,255,0.55)"
                        : step === i
                          ? "white"
                          : "rgba(255,255,255,0.28)",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <div
            className="px-5 sm:px-6 py-4"
            style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="font-bold text-white"
                  style={{
                    fontFamily: "Cormorant Garamond",
                    fontSize: "1.15rem",
                  }}
                >
                  {step === 0 && "Choose Your Massage"}
                  {step === 1 && "Enhance Your Session"}
                  {step === 2 && "Therapist Preference"}
                  {step === 3 && "Date & Time"}
                  {step === 4 && "Your Details & Review"}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {step === 0 && "Pick a location, then a massage"}
                  {step === 1 && "Optional add-ons to elevate your experience"}
                  {step === 2 && "Male or female therapist — your choice"}
                  {step === 3 && "Live availability — we hide booked slots"}
                  {step === 4 && "Add to your session, then complete below"}
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  Step
                </p>
                <p
                  className="font-bold text-white leading-none"
                  style={{
                    fontFamily: "Cormorant Garamond",
                    fontSize: "1.6rem",
                  }}
                >
                  {step + 1}
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 400,
                      opacity: 0.55,
                    }}
                  >
                    /5
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {toast && (
              <div
                className="flex items-center gap-2 rounded-xl p-3 mb-4 text-xs font-semibold"
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#065f46",
                }}
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {toast.msg}
              </div>
            )}

            <div key={step} className={slideDir === "fwd" ? "sfwd" : "sbck"}>
              {/* ───── STEP 0 — Location + Service ───── */}
              {step === 0 && (
                <div className="space-y-6">
                  {/* Location */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Service Location
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          id: "studio",
                          label: "Home Studio",
                          sub: "Our private studio",
                          note: "💳 Pay online",
                          Icon: Building2,
                        },
                        {
                          id: "mobile",
                          label: "Mobile Service",
                          sub: "Home or hotel",
                          note: "💰 Pay after session",
                          Icon: Home,
                        },
                      ].map((o) => (
                        <div
                          key={o.id}
                          onClick={() => setSvcType(o.id)}
                          className="p-4 rounded-xl cursor-pointer ch border-2"
                          style={{
                            borderColor:
                              svcType === o.id ? "#06b6d4" : "#e5e7eb",
                            background: svcType === o.id ? "#f0f9ff" : "white",
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <o.Icon
                              className="w-5 h-5"
                              style={{
                                color:
                                  svcType === o.id ? "#0891b2" : "#9ca3af",
                              }}
                            />
                            {svcType === o.id && <Tick />}
                          </div>
                          <p className="font-bold text-gray-900 text-sm">
                            {o.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {o.sub}
                          </p>
                          <p
                            className="text-xs font-semibold mt-2"
                            style={{ color: "#0891b2" }}
                          >
                            {o.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flat service list */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Choose Massage
                    </p>
                    <div className="space-y-2">
                      {SERVICES.map((svc) => (
                        <div
                          key={svc.id}
                          onClick={() => setService(svc.id)}
                          className="p-3 rounded-xl cursor-pointer ch border-2 flex items-start gap-3"
                          style={{
                            borderColor:
                              service === svc.id ? "#06b6d4" : "#e5e7eb",
                            background:
                              service === svc.id ? "#f0f9ff" : "white",
                          }}
                        >
                          <img
                            src={svc.image}
                            alt=""
                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span>{svc.icon}</span>
                              <span className="font-bold text-gray-900 text-sm">
                                {svc.name}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${svc.bc}`}
                              >
                                {svc.badge}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              {svc.desc}
                            </p>
                            {svc.benefit && (
                              <p
                                className="text-xs mt-1 leading-relaxed"
                                style={{ color: "#0891b2" }}
                              >
                                <b>Benefits:</b> {svc.benefit}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {Object.entries(PRICING[svcType][svc.id]).map(
                                ([m, p]) => (
                                  <span
                                    key={m}
                                    className="text-xs px-1.5 py-0.5 rounded font-medium"
                                    style={{
                                      background: "#f0f9ff",
                                      color: "#0891b2",
                                      border: "1px solid #bae6fd",
                                    }}
                                  >
                                    {Object.keys(PRICING[svcType][svc.id])
                                      .length > 1
                                      ? `${m}min · `
                                      : ""}
                                    {fmt(p)}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                          {service === svc.id && <Tick />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {service && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Duration
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {durList(service).map((m) => {
                          const p = getPrice(svcType, service, m);
                          const sel = Number(duration) === m;
                          return (
                            <div
                              key={m}
                              onClick={() => setDuration(m)}
                              className="p-4 rounded-xl cursor-pointer ch border-2 text-center"
                              style={{
                                borderColor: sel ? "#06b6d4" : "#e5e7eb",
                                background: sel ? "#f0f9ff" : "white",
                              }}
                            >
                              <div
                                className="text-2xl sm:text-3xl font-bold text-gray-900"
                                style={{ fontFamily: "Cormorant Garamond" }}
                              >
                                {m}
                              </div>
                              <div className="text-xs text-gray-400 mb-1">
                                MIN
                              </div>
                              <div
                                className="text-sm font-bold"
                                style={{ color: "#0891b2" }}
                              >
                                {fmt(p)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ───── STEP 1 — Add-ons ───── */}
              {step === 1 && (
                <div className="space-y-3">
                  <div
                    className="flex items-center gap-2 rounded-xl p-3 text-xs"
                    style={{
                      background: "#ecfeff",
                      border: "1px solid #a5f3fc",
                      color: "#155e75",
                    }}
                  >
                    <Sparkles className="w-4 h-4" /> Add-ons extend your
                    session — duration adjusts automatically.
                  </div>
                  {ADDONS.map((a) => {
                    const on = addons.includes(a.id);
                    return (
                      <div
                        key={a.id}
                        onClick={() =>
                          setAddons(
                            on
                              ? addons.filter((x) => x !== a.id)
                              : [...addons, a.id],
                          )
                        }
                        className="p-4 rounded-xl cursor-pointer ch border-2 flex items-center gap-3"
                        style={{
                          borderColor: on ? "#06b6d4" : "#e5e7eb",
                          background: on ? "#f0f9ff" : "white",
                        }}
                      >
                        <div className="text-2xl">{a.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm">
                            {a.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {a.desc}
                            {a.minutes > 0 ? ` · +${a.minutes} min` : ""}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p
                            className="text-sm font-bold"
                            style={{ color: "#0891b2" }}
                          >
                            +{fmt(a.price)}
                          </p>
                          {on && (
                            <p className="text-xs text-emerald-600 font-semibold">
                              Added
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {addons.length > 0 && (
                    <div
                      className="rounded-xl p-3 flex justify-between text-sm"
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      <span className="text-emerald-800 font-semibold">
                        Add-ons total
                      </span>
                      <span className="font-bold text-emerald-700">
                        {fmt(
                          addons.reduce(
                            (a, id) =>
                              a + (ADDONS.find((x) => x.id === id)?.price || 0),
                            0,
                          ),
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ───── STEP 2 — Therapist ───── */}
              {step === 2 && (
                <div className="space-y-3">
                  <IB text="All massages are available with either a male or female therapist. Choose whichever you prefer." />
                  {THERAPISTS.map((t) => {
                    const sel = therapist === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setTherapist(t.id)}
                        className="p-4 rounded-xl cursor-pointer ch border-2"
                        style={{
                          borderColor: sel ? "#06b6d4" : "#e5e7eb",
                          background: sel ? "#f0f9ff" : "white",
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                background: sel ? "#0891b2" : "#f1f5f9",
                              }}
                            >
                              <User
                                className="w-5 h-5"
                                style={{ color: sel ? "white" : "#94a3b8" }}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {t.name}
                              </p>
                              <p className="text-xs text-gray-400">{t.role}</p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {t.specialties.map((s) => (
                                  <span
                                    key={s}
                                    className="text-xs px-1.5 py-0.5 rounded font-medium"
                                    style={{
                                      background: "#f0f9ff",
                                      color: "#0891b2",
                                    }}
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          {sel && <Tick />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ───── STEP 3 — Date & Time ───── */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Pick a Date
                    </p>
                    <DateStrip value={date} onChange={setDate} />
                  </div>

                  {date && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Available Times{" "}
                        <span className="font-normal normal-case text-gray-400">
                          · {draftDuration} min session
                        </span>
                      </p>
                      {svcType === "mobile" && (
                        <IB text="Mobile service runs 7 AM – 12 AM, 7 days a week." />
                      )}
                      <div className="mt-3">
                        <SlotGrid
                          available={available}
                          loading={slotsLoading}
                          selected={time}
                          onSelect={setTime}
                          serviceType={svcType}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ───── STEP 4 — Details ───── */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Your Information
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <TF
                        label="Full Name *"
                        value={name}
                        onChange={setName}
                        placeholder="Your full name"
                      />
                      <PF
                        label="Phone Number *"
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
                    </div>
                    <div className="mt-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Email *{" "}
                        <span className="font-normal text-gray-400">
                          (for confirmation)
                        </span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full p-3 rounded-lg text-sm"
                        style={{
                          border: `2px solid ${email ? "#06b6d4" : "#e5e7eb"}`,
                        }}
                      />
                    </div>
                  </div>

                  {svcType === "studio" && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Payment Option
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            id: "full",
                            l: "Pay in Full",
                            s: "Complete payment now",
                            a: draftSubtotal,
                          },
                          {
                            id: "deposit",
                            l: "50% Deposit",
                            s: "Balance at the studio",
                            a: Math.round(draftSubtotal * 0.5),
                          },
                        ].map((o) => (
                          <SC
                            key={o.id}
                            sel={payOpt === o.id}
                            onClick={() => setPayOpt(o.id)}
                          >
                            <div>
                              <p className="font-bold text-gray-900 text-sm mb-0.5">
                                {o.l}
                              </p>
                              <p className="text-xs text-gray-500 mb-1">
                                {o.s}
                              </p>
                              <p
                                className="text-base font-bold"
                                style={{ color: "#0891b2" }}
                              >
                                {fmt(o.a)}
                              </p>
                            </div>
                          </SC>
                        ))}
                      </div>
                      <IB text="Studio bookings require online payment via Paystack." />
                    </div>
                  )}

                  {svcType === "mobile" && (
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "#ecfdf5",
                        border: "1.5px solid #a7f3d0",
                      }}
                    >
                      <p className="font-bold text-gray-900 text-sm">
                        Pay After Session
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        For mobile service, payment is collected after your
                        massage is complete.
                      </p>
                    </div>
                  )}

                  {step0Valid && (
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                      }}
                    >
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        This Service
                      </p>
                      <div className="space-y-1.5 text-xs">
                        <Row
                          label="Service"
                          value={
                            SERVICES.find((s) => s.id === service)?.name || "—"
                          }
                        />
                        <Row
                          label="Location"
                          value={
                            svcType === "studio" ? "Home Studio" : "Mobile"
                          }
                        />
                        <Row label="Duration" value={`${duration} min`} />
                        <Row
                          label="Therapist"
                          value={
                            therapist === "male"
                              ? "Male"
                              : therapist === "female"
                                ? "Female"
                                : "Any"
                          }
                        />
                        <Row label="Date" value={date || "—"} />
                        <Row label="Time" value={time || "—"} />
                        {addons.length > 0 && (
                          <Row
                            label="Add-ons"
                            value={`${addons.length} selected`}
                          />
                        )}
                      </div>
                      <div
                        className="flex justify-between items-center pt-3 mt-3"
                        style={{ borderTop: "1.5px solid #e2e8f0" }}
                      >
                        <span className="text-sm font-semibold text-gray-600">
                          Subtotal
                        </span>
                        <span
                          className="text-2xl font-bold"
                          style={{
                            fontFamily: "Cormorant Garamond",
                            color: "#0891b2",
                          }}
                        >
                          {fmt(draftSubtotal)}
                        </span>
                      </div>
                    </div>
                  )}

                  {items.length > 0 && (
                    <div
                      className="flex items-center gap-2 rounded-xl p-3 text-xs"
                      style={{
                        background: "#f0f9ff",
                        border: "1px solid #bae6fd",
                        color: "#0c4a6e",
                      }}
                    >
                      <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                      <span>
                        You have <b>{items.length}</b> item
                        {items.length > 1 ? "s" : ""} in your session. Add this
                        service or finish from the cart.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Nav */}
            <div
              className="flex gap-3 mt-6 pt-5"
              style={{ borderTop: "1px solid #f1f5f9" }}
            >
              <button
                onClick={goBack}
                disabled={step === 0}
                className="px-5 py-3 rounded-xl font-semibold text-sm border-2"
                style={{
                  borderColor: step === 0 ? "#f3f4f6" : "#e5e7eb",
                  color: step === 0 ? "#d1d5db" : "#374151",
                  background: "white",
                  cursor: step === 0 ? "not-allowed" : "pointer",
                }}
              >
                ← Back
              </button>

              {step < 4 ? (
                <>
                  {step === 1 && (
                    <button
                      onClick={goNext}
                      className="px-4 py-3 rounded-xl font-semibold text-sm border-2"
                      style={{
                        borderColor: "#e5e7eb",
                        color: "#374151",
                        background: "white",
                      }}
                    >
                      Skip
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (stepValids[step]) goNext();
                    }}
                    disabled={!stepValids[step]}
                    className="flex-1 py-3 rounded-xl font-bold text-sm"
                    style={{
                      background: stepValids[step]
                        ? "linear-gradient(135deg,#0891b2,#06b6d4)"
                        : "#e5e7eb",
                      color: stepValids[step] ? "white" : "#9ca3af",
                      cursor: stepValids[step] ? "pointer" : "not-allowed",
                      boxShadow: stepValids[step]
                        ? "0 4px 14px rgba(8,145,178,0.25)"
                        : "none",
                    }}
                  >
                    Next →
                  </button>
                </>
              ) : (
                <button
                  onClick={addToSession}
                  disabled={!step4Valid}
                  className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{
                    background: step4Valid
                      ? "linear-gradient(135deg,#0891b2,#06b6d4)"
                      : "#e5e7eb",
                    color: step4Valid ? "white" : "#9ca3af",
                    cursor: step4Valid ? "pointer" : "not-allowed",
                    boxShadow: step4Valid
                      ? "0 4px 14px rgba(8,145,178,0.3)"
                      : "none",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add to Session
                </button>
              )}
            </div>

            {step === 4 && items.length > 0 && (
              <p className="text-xs text-center mt-3 text-gray-400">
                Ready to finish? Open your cart (
                <b className="lg:hidden">tap the bag button</b>
                <b className="hidden lg:inline">right panel</b>) and tap{" "}
                <b>Book Appointment</b> or <b>Continue to Payment</b>.
              </p>
            )}
          </div>
        </div>

        {/* Mobile cart FAB */}
        {items.length > 0 && (
          <button
            onClick={() => setCartOpen(true)}
            className="lg:hidden fixed bottom-5 right-5 z-40 rounded-full px-5 py-3 shadow-2xl flex items-center gap-2 font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)" }}
          >
            <ShoppingBag className="w-4 h-4" />
            {items.length} · {fmt(subtotal)}
          </button>
        )}
      </div>

      <CartSidebar
        items={items}
        onRemove={removeItem}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        subtotal={subtotal}
        canCheckout={canPay}
        onCheckout={handlePay}
        customerName={name}
      />

      {loading && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl mx-4">
            <div
              style={{
                width: 52,
                height: 52,
                border: "3px solid #e5e7eb",
                borderTopColor: "#06b6d4",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p
              className="font-bold text-gray-900"
              style={{ fontFamily: "Cormorant Garamond", fontSize: 18 }}
            >
              Processing…
            </p>
          </div>
        </div>
      )}

      {success && booking && (
        <Modal onClose={closeSuccess}>
          <SuccessIcon />
          <h3
            className="text-2xl font-bold text-gray-900 text-center mb-1"
            style={{ fontFamily: "Cormorant Garamond" }}
          >
            Booking Confirmed!
          </h3>
          <p className="text-center text-sm text-gray-500 mb-4">
            Ref: <span className="font-mono font-semibold">{booking.ref}</span>
          </p>
          <div className="rounded-xl p-4 mb-4" style={{ background: "#f0f9ff" }}>
            {booking.items.map((it, i) => (
              <div key={i} className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 truncate">
                  {it.serviceName} · {it.duration}min
                </span>
                <span className="font-semibold text-gray-800 ml-2">
                  {fmt(getPrice(it.svcType, it.service, it.duration))}
                </span>
              </div>
            ))}
            <div
              className="flex justify-between pt-2 mt-2"
              style={{ borderTop: "1px solid #bae6fd" }}
            >
              <span className="font-semibold text-gray-700">Total</span>
              <span
                className="text-xl font-bold"
                style={{ fontFamily: "Cormorant Garamond", color: "#0891b2" }}
              >
                {fmt(booking.subtotal)}
              </span>
            </div>
          </div>
          <Btn color="whatsapp" onClick={sendWA}>
            💬 Send Details via WhatsApp
          </Btn>
          <Btn color="blue" onClick={closeSuccess}>
            Done
          </Btn>
        </Modal>
      )}
    </div>
  );
}

const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-400">{label}</span>
    <span className="font-semibold text-gray-800 text-right max-w-[60%] truncate">
      {value}
    </span>
  </div>
);