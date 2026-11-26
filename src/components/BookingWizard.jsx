import { useState, useEffect, useMemo, useRef } from "react";
import {
  Home, Building2, User, Check, ArrowRight, ArrowLeft, ShieldCheck, Wallet, AlertCircle
} from "lucide-react";
import {
  SERVICES, ADDONS, THERAPISTS, fmt, getPrice, durList, LOCATION_LABEL,
} from "../config/services";
import DateStrip from "./DateStrip";
import SlotGrid from "./SlotGrid";
import { useAvailability } from "../hooks/useAvailability";

const STEPS = ["Service", "Add-ons", "Therapist", "Date", "Confirm"];
const WA_NUMBER = "2347040723894";
const PAYSTACK_KEY = "pk_live_915663b76742c16f999c99e6251596ee7c5c9584";

export default function BookingWizard({ initialService = "" }) {
  const [step, setStep] = useState(0);

  // ── Draft ──
  const [svcType, setSvcType] = useState("studio");
  const [service, setService] = useState(initialService);
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

  // ── UI States ──
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(null);

  // ── Scroll anchor ──
  const topRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setErrorMsg(""); // clear errors on step change
    if (!topRef.current) return;
    const headerOffset = window.innerWidth < 768 ? 70 : 90;
    const y = topRef.current.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: Math.max(y, 0), behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (initialService) {
      setService(initialService);
      const opts = durList(initialService);
      if (opts.length > 0) {
        setDuration((prev) => (opts.includes(Number(prev)) ? prev : opts[0]));
      }
    }
  }, [initialService]);

  const totalDuration = useMemo(() => {
    if (!duration) return 0;
    return Number(duration) + addons.reduce((a, id) => a + (ADDONS.find((x) => x.id === id)?.minutes || 0), 0);
  }, [duration, addons]);

  const basePrice = service ? getPrice(svcType, service, duration) : 0;
  const addonsTotal = addons.reduce((a, id) => a + (ADDONS.find((x) => x.id === id)?.price || 0), 0);
  const total = basePrice + addonsTotal;

  const { available, loading: slotsLoading } = useAvailability({
    date,
    serviceType: svcType,
    minutes: totalDuration || 60,
  });

  const customerValid = !!(name && phone.replace(/\D/g, "").length >= 11 && email);
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
    setErrorMsg("");
    let ref = "";

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
          addons: addons.map((id) => ADDONS.find((x) => x.id === id)?.name || id),
          therapist,
          subtotal: total,
          totalAmount: total,
          paymentAmount: payOpt === "full" ? total : Math.round(total * 0.5),
          paymentType: payOpt === "full" ? "Full" : "Deposit",
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("Server error. Please ensure the backend API is working.");
      }

      if (!res.ok) throw new Error(data.error || "Failed to create booking.");

      ref = data.ref;

      if (!window.PaystackPop) {
        setLoading(false);
        return setErrorMsg("Payment system is still loading. Please try again in a moment.");
      }

      const amount = payOpt === "full" ? total : Math.round(total * 0.5);

      window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: email || "customer@vivifymassageandspa.online",
        amount: Math.round(amount * 100),
        currency: "NGN",
        ref,
        metadata: {
          custom_fields: [{ display_name: "Customer", variable_name: "customer", value: name }],
        },
        // Standard function syntax to prevent Paystack errors
        callback: function (response) {
          finalizeBooking(response.reference, svcObj, ref).catch(console.error);
        },
        onClose: function () {
          setLoading(false);
          fetch("/api/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "cancel", ref }),
          }).catch(console.error);
          setErrorMsg("Payment cancelled. You can try again.");
        },
      }).openIframe();
    } catch (e) {
      console.error(e);
      setLoading(false);
      setErrorMsg(e.message || "Something went wrong. Please try again.");
    }
  };

  const finalizeBooking = async (paymentRef = "PAY-AFTER", svcObj, existingRef) => {
    const ref = existingRef || `VMS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    try {
      if (svcType === "studio" && paymentRef !== "PAY-AFTER") {
        await fetch("/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "mark_paid", ref, paymentRef }),
        });
      }

      await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "booking_multi",
          data: {
            ref, customerName: name, customerPhone: phone, email,
            items: [{
              serviceName: svcObj?.name, service, svcType, duration,
              addons: addons.map((id) => ADDONS.find((x) => x.id === id)?.name || id),
              therapist, date, time,
            }],
            subtotal: total, paymentRef,
            paymentType: svcType === "mobile" ? "Pay After Session" : payOpt === "full" ? "Full" : "Deposit",
          },
        }),
      });
    } catch (err) {
      console.error("Email failed:", err);
    }

    setBooking({ ref, customerName: name, serviceName: svcObj?.name, duration, total, svcType });
    setLoading(false);
    setSuccess(true);
  };

  const reset = () => {
    setSuccess(false); setBooking(null); setStep(0); setService(""); setDuration("");
    setAddons([]); setTherapist("any"); setDate(""); setTime(""); setName("");
    setPhone(""); setEmail(""); setPhoneErr(""); setPayOpt("full"); setErrorMsg("");
  };

  const sendWA = () => {
    if (!booking) return;
    const msg = `Hello Vivify! 🌟\n\nRef: ${booking.ref}\n👤 ${booking.customerName}\n💆 ${booking.serviceName} (${booking.duration} min)\n💰 ${fmt(booking.total)}\n\nPlease confirm my appointment.`;
    window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  const ctaLabel = (() => {
    if (svcType === "mobile") return "Confirm Booking";
    if (payOpt === "full") return `Pay ${fmt(total)}`;
    return `Pay 50% — ${fmt(Math.round(total * 0.5))}`;
  })();

  return (
    <div ref={topRef} className="max-w-2xl mx-auto pb-32 md:pb-8">
      {/* Progress Bar */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-2 mb-3">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex items-center gap-2">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  background: step > i ? "#10b981" : step === i ? "linear-gradient(135deg,#0d9488,#14b8a6)" : "rgba(255,255,255,0.15)",
                  color: step >= i ? "white" : "rgba(255,255,255,0.5)",
                  boxShadow: step === i ? "0 4px 12px rgba(20,184,166,0.4)" : "none",
                }}
              >
                {step > i ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-1 rounded-full transition-all duration-300" style={{ background: step > i ? "#10b981" : "rgba(255,255,255,0.15)" }} />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-center font-medium text-teal-100 uppercase tracking-widest">
          Step {step + 1} of 5 · {STEPS[step]}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-teal-900/20 border border-white/20">

        {/* Card Header */}
        <div className="px-6 py-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-gray-900 leading-tight" style={{ fontFamily: "Cormorant Garamond", fontSize: "1.6rem" }}>
            {step === 0 && "Choose your massage"}
            {step === 1 && "Add something special?"}
            {step === 2 && "Pick your therapist"}
            {step === 3 && "When works best?"}
            {step === 4 && "Almost done"}
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {step === 0 && "Pick location, massage and duration"}
            {step === 1 && "Optional — skip if you prefer"}
            {step === 2 && "Male, female, or let us choose"}
            {step === 3 && "Live slots — booked times are hidden"}
            {step === 4 && "Enter your details and confirm"}
          </p>
        </div>

        {/* Body (Animated) */}
        <div className="p-5 sm:p-7 min-h-[400px]">

          {errorMsg && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
            </div>
          )}

          <div key={step} className="animate-step">
            {/* STEP 0: Service */}
            {step === 0 && (
              <div className="space-y-8">
                <div>
                  <Label>Location</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "studio", label: LOCATION_LABEL.studio, sub: "Pay online", Icon: Building2 },
                      { id: "mobile", label: LOCATION_LABEL.mobile, sub: "Pay after session", Icon: Home },
                    ].map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setSvcType(o.id)}
                        className="p-4 rounded-2xl border-2 transition-all text-left group"
                        style={{
                          borderColor: svcType === o.id ? "#14b8a6" : "#e5e7eb",
                          background: svcType === o.id ? "#f0fdfa" : "white",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <o.Icon className={`w-5 h-5 transition-colors ${svcType === o.id ? "text-teal-600" : "text-gray-400 group-hover:text-teal-500"}`} />
                          {svcType === o.id && <CheckMark />}
                        </div>
                        <p className="font-bold text-gray-900 text-sm">{o.label}</p>
                        <p className={`text-xs mt-0.5 font-semibold ${svcType === o.id ? "text-teal-600" : "text-gray-500"}`}>{o.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Massage</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICES.map((svc) => {
                      const sel = service === svc.id;
                      return (
                        <button
                          key={svc.id}
                          onClick={() => setService(svc.id)}
                          className="p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col gap-2 relative overflow-hidden group"
                          style={{
                            borderColor: sel ? "#14b8a6" : "#e5e7eb",
                            background: sel ? "#f0fdfa" : "white",
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-3xl bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">{svc.icon}</span>
                            {sel && <CheckMark />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-bold text-gray-900 text-sm">{svc.name}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${svc.bc}`}>{svc.badge}</span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{svc.benefit}</p>
                          </div>
                          <p className="text-sm mt-1 font-bold text-teal-600">From {fmt(getPrice(svcType, svc.id, 60))}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {service && (
                  <div className="animate-in fade-in slide-in-from-top-4">
                    <Label>Duration</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {durList(service).map((m) => {
                        const p = getPrice(svcType, service, m);
                        const sel = Number(duration) === m;
                        return (
                          <button
                            key={m}
                            onClick={() => setDuration(m)}
                            className="p-4 rounded-2xl border-2 text-center transition-all duration-200"
                            style={{
                              borderColor: sel ? "#14b8a6" : "#e5e7eb",
                              background: sel ? "#f0fdfa" : "white",
                            }}
                          >
                            <p className={`text-2xl font-bold ${sel ? "text-teal-700" : "text-gray-900"}`} style={{ fontFamily: "Cormorant Garamond" }}>{m}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${sel ? "text-teal-600" : "text-gray-400"}`}>MIN</p>
                            <p className={`text-sm font-bold ${sel ? "text-teal-700" : "text-gray-600"}`}>{fmt(p)}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 1: Add-ons */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ADDONS.map((a) => {
                  const on = addons.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => setAddons(on ? addons.filter((x) => x !== a.id) : [...addons, a.id])}
                      className="p-4 rounded-2xl border-2 flex flex-col gap-2 text-left transition-all duration-200 relative group"
                      style={{ borderColor: on ? "#14b8a6" : "#e5e7eb", background: on ? "#f0fdfa" : "white" }}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-3xl">{a.icon}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${on ? "bg-teal-500 border-teal-500" : "border-gray-300"}`}>
                          {on && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{a.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
                      </div>
                      <p className={`text-sm font-bold mt-1 ${on ? "text-teal-700" : "text-gray-600"}`}>+{fmt(a.price)}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 2: Therapist */}
            {step === 2 && (
              <div className="space-y-3">
                {THERAPISTS.map((t) => {
                  const sel = therapist === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTherapist(t.id)}
                      className="w-full p-4 rounded-2xl border-2 flex items-center gap-4 text-left transition-all duration-200"
                      style={{ borderColor: sel ? "#14b8a6" : "#e5e7eb", background: sel ? "#f0fdfa" : "white" }}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${sel ? "bg-teal-500" : "bg-gray-100"}`}>
                        <User className={`w-6 h-6 ${sel ? "text-white" : "text-gray-400"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{t.role}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${sel ? "bg-teal-500 border-teal-500" : "border-gray-300"}`}>
                        {sel && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 3: Date & Time */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label>Select Date</Label>
                  <DateStrip value={date} onChange={setDate} />
                </div>
                {date && (
                  <div className="animate-in fade-in slide-in-from-top-4">
                    <Label>
                      Select Time
                      <span className="text-teal-600 font-bold ml-1 bg-teal-50 px-2 py-0.5 rounded-md">· {totalDuration} min session</span>
                    </Label>
                    {svcType === "mobile" && (
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span> Mobile service runs 7 AM – 12 AM, 7 days a week
                      </p>
                    )}
                    <SlotGrid available={available} loading={slotsLoading} selected={time} onSelect={setTime} serviceType={svcType} />
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Confirm */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <Label>Your Details</Label>
                  <div className="space-y-4">
                    <Field label="Full Name" value={name} onChange={setName} placeholder="e.g. Adeola Ogunlesi" />
                    <PhoneField
                      label="Phone Number" value={phone} error={phoneErr}
                      onChange={(v) => {
                        setPhone(v);
                        const d = v.replace(/\D/g, "");
                        setPhoneErr(d.length > 0 && d.length < 11 ? "Must be 11 digits" : "");
                      }}
                    />
                    <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
                  </div>
                </div>

                {svcType === "studio" && (
                  <div>
                    <Label>Payment Option</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: "full", l: "Pay in full", s: "Complete payment now", a: total },
                        { id: "deposit", l: "50% Deposit", s: "Balance at the studio", a: Math.round(total * 0.5) },
                      ].map((o) => (
                        <button
                          key={o.id}
                          onClick={() => setPayOpt(o.id)}
                          className="p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between gap-3"
                          style={{ borderColor: payOpt === o.id ? "#14b8a6" : "#e5e7eb", background: payOpt === o.id ? "#f0fdfa" : "white" }}
                        >
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{o.l}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{o.s}</p>
                          </div>
                          <p className={`text-lg font-bold ${payOpt === o.id ? "text-teal-600" : "text-gray-700"}`}>{fmt(o.a)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl p-5 bg-gray-50 border border-gray-200">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-3">Booking Summary</p>
                  <SummaryRow icon="💆" label="Massage" value={SERVICES.find((s) => s.id === service)?.name} />
                  <SummaryRow icon={svcType === "studio" ? "🏢" : "🏠"} label="Location" value={svcType === "studio" ? LOCATION_LABEL.studio : LOCATION_LABEL.mobile} />
                  <SummaryRow icon="⏱" label="Duration" value={`${totalDuration} min`} />
                  <SummaryRow icon="👤" label="Therapist" value={therapist === "male" ? "Male" : therapist === "female" ? "Female" : "Any"} />
                  {addons.length > 0 && <SummaryRow icon="✨" label="Add-ons" value={addons.map((id) => ADDONS.find((x) => x.id === id)?.name).join(", ")} />}
                  <SummaryRow icon="📅" label="Date" value={`${date} · ${time}`} />

                  <div className="flex justify-between items-center pt-4 mt-3 border-t border-gray-200">
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Total</span>
                    <span className="text-3xl font-bold text-teal-600" style={{ fontFamily: "Cormorant Garamond" }}>{fmt(total)}</span>
                  </div>
                </div>

                {svcType === "mobile" && (
                  <InfoBar icon={<Wallet className="w-4 h-4" />}>
                    <b className="text-gray-900">Pay after session</b> — cash or transfer to your therapist when done.
                  </InfoBar>
                )}
                {svcType === "studio" && (
                  <InfoBar icon={<ShieldCheck className="w-4 h-4" />}>
                    <b className="text-gray-900">Secure payment</b> — encrypted via Paystack. 256-bit SSL.
                  </InfoBar>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer (Mobile) / Bottom Nav (Desktop) */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-white rounded-b-[2rem]">
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={back}
                className="px-5 py-4 rounded-2xl font-bold text-sm border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
              </button>
            )}
            {step < 4 ? (
              <>
                {step === 1 && (
                  <button
                    onClick={next}
                    className="px-5 py-4 rounded-2xl font-bold text-sm border-2 border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition-all flex-shrink-0"
                  >
                    Skip
                  </button>
                )}
                <button
                  onClick={next}
                  disabled={!stepValid[step]}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
                  style={{
                    background: stepValid[step] ? "linear-gradient(135deg,#0d9488,#14b8a6)" : "#d1d5db",
                    cursor: stepValid[step] ? "pointer" : "not-allowed",
                  }}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={submitBooking}
                disabled={!customerValid}
                className="flex-1 py-4 rounded-2xl font-bold text-sm text-white transition-all duration-200 shadow-lg disabled:shadow-none"
                style={{
                  background: customerValid
                    ? svcType === "mobile" ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#0d9488,#14b8a6)"
                    : "#d1d5db",
                  cursor: customerValid ? "pointer" : "not-allowed",
                }}
              >
                {ctaLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl mx-4 flex flex-col items-center max-w-sm w-full">
            <div className="w-16 h-16 rounded-full mb-5 animate-spin border-4 border-teal-100 border-t-teal-500" />
            <h3 className="font-bold text-gray-900 text-xl mb-1" style={{ fontFamily: "Cormorant Garamond" }}>
              {svcType === "mobile" ? "Booking your appointment…" : "Opening secure payment…"}
            </h3>
            <p className="text-sm text-gray-500">Please do not close this window.</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && booking && (
        <Modal onClose={reset}>
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 mx-auto flex items-center justify-center mb-4 animate-in zoom-in">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: "Cormorant Garamond" }}>
              {booking.svcType === "mobile" ? "Appointment Booked!" : "Payment Confirmed!"}
            </h3>
            <p className="text-sm text-gray-500 font-medium">Ref: <span className="font-mono bg-gray-100 px-2 py-1 rounded-md text-gray-900">{booking.ref}</span></p>
          </div>

          <div className="rounded-2xl p-5 mb-5 bg-teal-50/50 border border-teal-100">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Massage</span>
              <span className="font-bold text-gray-900">{booking.serviceName}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Duration</span>
              <span className="font-bold text-gray-900">{booking.duration} min</span>
            </div>
            <div className="flex justify-between items-center pt-3 mt-2 border-t border-teal-200/50">
              <span className="text-sm font-bold text-gray-700">{booking.svcType === "mobile" ? "Total" : "Paid"}</span>
              <span className="text-2xl font-bold text-teal-600" style={{ fontFamily: "Cormorant Garamond" }}>{fmt(booking.total)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-5 text-sm text-amber-800 leading-relaxed font-medium">
            <b>What's next?</b> Our team will reach out on WhatsApp shortly to confirm your therapist and finalize details.
          </div>

          <button onClick={sendWA} className="w-full py-4 rounded-xl font-bold text-white mb-3 transition-transform active:scale-95 shadow-lg shadow-green-500/30" style={{ background: "#25D366" }}>
            💬 Send Details via WhatsApp
          </button>
          <button onClick={reset} className="w-full py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
            Book Another Session
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── Micro components ──
const Label = ({ children }) => (
  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
    {children}
  </p>
);

const CheckMark = () => (
  <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 animate-in zoom-in shadow-sm">
    <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
  </div>
);

const Field = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">{label} *</label>
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-3.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 outline-none"
      style={{ borderColor: value ? "#14b8a6" : "#e5e7eb", background: value ? "#f0fdfa" : "#f9fafb" }}
    />
  </div>
);

const PhoneField = ({ label, value, error, onChange }) => {
  const digits = value.replace(/\D/g, "");
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">{label} *</label>
      <input
        type="tel" value={value} onChange={(e) => onChange(e.target.value)} placeholder="08012345678" maxLength={14}
        className="w-full px-4 py-3.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 outline-none"
        style={{ borderColor: error ? "#ef4444" : digits.length === 11 ? "#14b8a6" : "#e5e7eb", background: digits.length === 11 ? "#f0fdfa" : "#f9fafb" }}
      />
      {error && <p className="text-[10px] font-bold text-red-500 mt-1.5 uppercase tracking-wider">{error}</p>}
      {!error && digits.length > 0 && (
        <p className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${digits.length === 11 ? "text-emerald-600" : "text-gray-400"}`}>
          {digits.length}/11 digits {digits.length === 11 && "✓ Valid"}
        </p>
      )}
    </div>
  );
};

const SummaryRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between text-sm mb-2.5">
    <span className="text-gray-500 flex items-center gap-2 text-xs font-medium">
      <span className="text-base">{icon}</span> {label}
    </span>
    <span className="font-bold text-gray-900 text-right max-w-[60%] truncate">{value}</span>
  </div>
);

const InfoBar = ({ icon, children }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 leading-relaxed font-medium">
    <span className="flex-shrink-0 mt-0.5 text-teal-600">{icon}</span>
    <span>{children}</span>
  </div>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in" onClick={onClose}>
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);