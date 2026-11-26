import { useState, useEffect, useMemo, useRef } from "react";
import {
  Home, Building2, User, Check, ArrowRight, ArrowLeft, ShieldCheck, Wallet, AlertCircle, Sparkles
} from "lucide-react";
import {
  SERVICES, ADDONS, THERAPISTS, fmt, getPrice, durList, LOCATION_LABEL,
} from "../config/services";
import DateStrip from "./DateStrip";
import SlotGrid from "./SlotGrid";
import { useAvailability } from "../hooks/useAvailability";

const STEPS = ["Ritual", "Enhancements", "Therapist", "Schedule", "Confirm"];
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
    setErrorMsg("");
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
        return setErrorMsg("Payment system is still loading. Please try again.");
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
    if (svcType === "mobile") return "Confirm Appointment";
    if (payOpt === "full") return `Pay ${fmt(total)}`;
    return `Pay 50% — ${fmt(Math.round(total * 0.5))}`;
  })();

  return (
    <div ref={topRef} className="max-w-3xl mx-auto pb-32 md:pb-12 px-2 sm:px-0">
      {/* Elegant Step Progress */}
      <div className="mb-10 text-center">
        <p className="text-[10px] font-bold text-[#A3B19B] uppercase tracking-[0.2em] mb-4">
          Step {step + 1} — {STEPS[step]}
        </p>
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${step >= i ? "w-8 bg-[#4A5D4E]" : "w-4 bg-[#E8EDE6]"}`} />
          ))}
        </div>
      </div>

      {/* Main Booking Card */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#4A5D4E]/10 border border-[#F4F1E9]">

        <div className="p-6 sm:p-12">

          {errorMsg && (
            <div className="mb-8 p-4 bg-[#FDF4F2] border border-[#E8C5BC] rounded-2xl flex items-start gap-3 animate-luxe">
              <AlertCircle className="w-5 h-5 text-[#C8795D] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#9B5C4A] font-medium">{errorMsg}</p>
            </div>
          )}

          <div key={step} className="animate-luxe">
            {/* STEP 0: Service */}
            {step === 0 && (
              <div className="space-y-10">
                <div>
                  <Label>Select Environment</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "studio", label: LOCATION_LABEL.studio, sub: "Pay online", Icon: Building2 },
                      { id: "mobile", label: LOCATION_LABEL.mobile, sub: "Pay after session", Icon: Home },
                    ].map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setSvcType(o.id)}
                        className="p-5 rounded-2xl border-2 transition-all text-left group"
                        style={{
                          borderColor: svcType === o.id ? "#4A5D4E" : "#F4F1E9",
                          background: svcType === o.id ? "#F9F6F0" : "white",
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <o.Icon className={`w-5 h-5 ${svcType === o.id ? "text-[#4A5D4E]" : "text-[#A3B19B]"}`} />
                          {svcType === o.id && <CheckMark />}
                        </div>
                        <p className="font-bold text-[#2C3531] text-sm">{o.label}</p>
                        <p className={`text-xs mt-1 font-medium ${svcType === o.id ? "text-[#4A5D4E]" : "text-[#A3B19B]"}`}>{o.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Choose Your Ritual</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICES.map((svc) => {
                      const sel = service === svc.id;
                      return (
                        <button
                          key={svc.id}
                          onClick={() => setService(svc.id)}
                          className="p-5 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col gap-3 group"
                          style={{
                            borderColor: sel ? "#4A5D4E" : "#F4F1E9",
                            background: sel ? "#F9F6F0" : "white",
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-3xl bg-[#F9F6F0] w-14 h-14 rounded-2xl flex items-center justify-center border border-[#E8EDE6]">{svc.icon}</span>
                            {sel && <CheckMark />}
                          </div>
                          <div>
                            <p className="font-bold text-[#2C3531] text-base mb-1" style={{ fontFamily: "Cormorant Garamond" }}>{svc.name}</p>
                            <p className="text-xs text-[#5A6B5D] line-clamp-2 leading-relaxed">{svc.benefit}</p>
                          </div>
                          <p className="text-sm font-bold text-[#4A5D4E] mt-2">From {fmt(getPrice(svcType, svc.id, 60))}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {service && (
                  <div className="animate-luxe">
                    <Label>Session Length</Label>
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
                              borderColor: sel ? "#4A5D4E" : "#F4F1E9",
                              background: sel ? "#F9F6F0" : "white",
                            }}
                          >
                            <p className={`text-2xl font-bold ${sel ? "text-[#2C3531]" : "text-[#A3B19B]"}`} style={{ fontFamily: "Cormorant Garamond" }}>{m}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${sel ? "text-[#4A5D4E]" : "text-[#A3B19B]"}`}>MIN</p>
                            <p className={`text-sm font-bold ${sel ? "text-[#4A5D4E]" : "text-[#5A6B5D]"}`}>{fmt(p)}</p>
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
              <div>
                <Label>Enhance Your Experience</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ADDONS.map((a) => {
                    const on = addons.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        onClick={() => setAddons(on ? addons.filter((x) => x !== a.id) : [...addons, a.id])}
                        className="p-5 rounded-2xl border-2 flex flex-col gap-3 text-left transition-all duration-200"
                        style={{ borderColor: on ? "#4A5D4E" : "#F4F1E9", background: on ? "#F9F6F0" : "white" }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-3xl">{a.icon}</span>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${on ? "bg-[#4A5D4E] border-[#4A5D4E]" : "border-[#E8EDE6]"}`}>
                            {on && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-[#2C3531] text-sm">{a.name}</p>
                          <p className="text-xs text-[#5A6B5D] mt-1">{a.desc}</p>
                        </div>
                        <p className={`text-sm font-bold mt-1 ${on ? "text-[#4A5D4E]" : "text-[#A3B19B]"}`}>+{fmt(a.price)}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Therapist */}
            {step === 2 && (
              <div>
                <Label>Select Your Specialist</Label>
                <div className="space-y-3">
                  {THERAPISTS.map((t) => {
                    const sel = therapist === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTherapist(t.id)}
                        className="w-full p-5 rounded-2xl border-2 flex items-center gap-5 text-left transition-all duration-200"
                        style={{ borderColor: sel ? "#4A5D4E" : "#F4F1E9", background: sel ? "#F9F6F0" : "white" }}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${sel ? "bg-[#4A5D4E]" : "bg-[#F4F1E9]"}`}>
                          <User className={`w-5 h-5 ${sel ? "text-white" : "text-[#A3B19B]"}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-[#2C3531] text-sm">{t.name}</p>
                          <p className="text-xs text-[#5A6B5D] mt-1">{t.role}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${sel ? "bg-[#4A5D4E] border-[#4A5D4E]" : "border-[#E8EDE6]"}`}>
                          {sel && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Date & Time */}
            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <Label>Select Date</Label>
                  <DateStrip value={date} onChange={setDate} />
                </div>
                {date && (
                  <div className="animate-luxe">
                    <Label>
                      Select Time
                      <span className="text-[#4A5D4E] font-bold ml-2 text-[10px] bg-[#E8EDE6] px-2 py-1 rounded-md uppercase tracking-wider">· {totalDuration} min</span>
                    </Label>
                    <SlotGrid available={available} loading={slotsLoading} selected={time} onSelect={setTime} serviceType={svcType} />
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Confirm */}
            {step === 4 && (
              <div className="space-y-8">
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
                    <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
                  </div>
                </div>

                {svcType === "studio" && (
                  <div>
                    <Label>Payment Preference</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: "full", l: "Pay in full", s: "Complete payment now", a: total },
                        { id: "deposit", l: "50% Deposit", s: "Balance at the studio", a: Math.round(total * 0.5) },
                      ].map((o) => (
                        <button
                          key={o.id}
                          onClick={() => setPayOpt(o.id)}
                          className="p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2"
                          style={{ borderColor: payOpt === o.id ? "#4A5D4E" : "#F4F1E9", background: payOpt === o.id ? "#F9F6F0" : "white" }}
                        >
                          <div>
                            <p className="font-bold text-[#2C3531] text-sm">{o.l}</p>
                            <p className="text-xs text-[#5A6B5D] mt-1">{o.s}</p>
                          </div>
                          <p className={`text-lg font-bold ${payOpt === o.id ? "text-[#4A5D4E]" : "text-[#A3B19B]"}`} style={{ fontFamily: "Cormorant Garamond" }}>{fmt(o.a)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-3xl p-6 bg-[#F9F6F0] border border-[#E8EDE6]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D4E] mb-4">Booking Summary</p>
                  <SummaryRow icon="💆" label="Ritual" value={SERVICES.find((s) => s.id === service)?.name} />
                  <SummaryRow icon={svcType === "studio" ? "🏢" : "🏠"} label="Location" value={svcType === "studio" ? LOCATION_LABEL.studio : LOCATION_LABEL.mobile} />
                  <SummaryRow icon="⏱" label="Duration" value={`${totalDuration} min`} />
                  <SummaryRow icon="👤" label="Specialist" value={therapist === "male" ? "Male" : therapist === "female" ? "Female" : "Any"} />
                  {addons.length > 0 && <SummaryRow icon="✨" label="Enhancements" value={addons.map((id) => ADDONS.find((x) => x.id === id)?.name).join(", ")} />}
                  <SummaryRow icon="📅" label="Schedule" value={`${date} · ${time}`} />

                  <div className="flex justify-between items-center pt-5 mt-4 border-t border-[#E8EDE6]">
                    <span className="text-sm font-bold text-[#2C3531] uppercase tracking-widest">Total</span>
                    <span className="text-3xl font-bold text-[#4A5D4E]" style={{ fontFamily: "Cormorant Garamond" }}>{fmt(total)}</span>
                  </div>
                </div>

                {svcType === "mobile" && (
                  <InfoBar icon={<Wallet className="w-4 h-4" />}>
                    <b className="text-[#2C3531]">Pay after session</b> — cash or transfer to your therapist when done.
                  </InfoBar>
                )}
                {svcType === "studio" && (
                  <InfoBar icon={<ShieldCheck className="w-4 h-4" />}>
                    <b className="text-[#2C3531]">Secure payment</b> — encrypted via Paystack. 256-bit SSL.
                  </InfoBar>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 sm:p-8 bg-[#F9F6F0] border-t border-[#E8EDE6]">
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={back}
                className="px-6 py-4 rounded-2xl font-bold text-sm border-2 border-[#E8EDE6] bg-white text-[#5A6B5D] hover:bg-[#F4F1E9] transition-all flex-shrink-0"
              >
                Back
              </button>
            )}
            {step < 4 ? (
              <>
                {step === 1 && (
                  <button
                    onClick={next}
                    className="px-6 py-4 rounded-2xl font-bold text-sm border-2 border-[#E8EDE6] bg-white text-[#5A6B5D] hover:bg-[#F4F1E9] transition-all flex-shrink-0"
                  >
                    Skip
                  </button>
                )}
                <button
                  onClick={next}
                  disabled={!stepValid[step]}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
                  style={{
                    background: stepValid[step] ? "#4A5D4E" : "#E8EDE6",
                    color: stepValid[step] ? "white" : "#A3B19B",
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
                  background: customerValid ? "#4A5D4E" : "#E8EDE6",
                  color: customerValid ? "white" : "#A3B19B",
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3531]/80 backdrop-blur-md animate-luxe">
          <div className="bg-[#F9F6F0] rounded-3xl p-10 text-center shadow-2xl mx-4 flex flex-col items-center max-w-sm w-full border border-[#E8EDE6]">
            <div className="w-16 h-16 rounded-full mb-6 animate-spin border-4 border-[#E8EDE6] border-t-[#4A5D4E]" />
            <h3 className="font-bold text-[#2C3531] text-2xl mb-2" style={{ fontFamily: "Cormorant Garamond" }}>
              {svcType === "mobile" ? "Confirming Details…" : "Opening Secure Payment…"}
            </h3>
            <p className="text-sm text-[#5A6B5D]">Please do not close this window.</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && booking && (
        <Modal onClose={reset}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-[#E8EDE6] mx-auto flex items-center justify-center mb-5 animate-luxe">
              <Check className="w-10 h-10 text-[#4A5D4E]" />
            </div>
            <h3 className="text-3xl font-bold text-[#2C3531] mb-2" style={{ fontFamily: "Cormorant Garamond" }}>
              {booking.svcType === "mobile" ? "Appointment Confirmed" : "Payment Successful"}
            </h3>
            <p className="text-sm text-[#5A6B5D] font-medium">Ref: <span className="font-mono bg-[#F4F1E9] px-2 py-1 rounded-md text-[#2C3531]">{booking.ref}</span></p>
          </div>

          <div className="rounded-2xl p-6 mb-6 bg-[#F9F6F0] border border-[#E8EDE6]">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-[#5A6B5D]">Ritual</span>
              <span className="font-bold text-[#2C3531]">{booking.serviceName}</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-[#5A6B5D]">Duration</span>
              <span className="font-bold text-[#2C3531]">{booking.duration} min</span>
            </div>
            <div className="flex justify-between items-center pt-4 mt-2 border-t border-[#E8EDE6]">
              <span className="text-sm font-bold text-[#2C3531]">{booking.svcType === "mobile" ? "Total" : "Paid"}</span>
              <span className="text-2xl font-bold text-[#4A5D4E]" style={{ fontFamily: "Cormorant Garamond" }}>{fmt(booking.total)}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F4F1E9] border border-[#E8EDE6] p-5 mb-8 text-sm text-[#5A6B5D] leading-relaxed font-medium">
            <b className="text-[#2C3531]">What's next?</b> Our concierge team will reach out on WhatsApp shortly to confirm your specialist and finalize details.
          </div>

          <button onClick={sendWA} className="w-full py-4 rounded-2xl font-bold text-white mb-3 transition-transform active:scale-95 shadow-xl bg-[#25D366]">
            Send Details via WhatsApp
          </button>
          <button onClick={reset} className="w-full py-4 rounded-2xl font-bold text-sm bg-white border border-[#E8EDE6] text-[#2C3531] hover:bg-[#F4F1E9] transition-colors">
            Book Another Session
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── Micro components ──
const Label = ({ children }) => (
  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#4A5D4E] mb-4">
    {children}
  </p>
);

const CheckMark = () => (
  <div className="w-6 h-6 rounded-full bg-[#4A5D4E] flex items-center justify-center flex-shrink-0 animate-luxe shadow-sm">
    <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
  </div>
);

const Field = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-[10px] font-bold text-[#5A6B5D] mb-2 uppercase tracking-widest">{label} *</label>
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-5 py-4 rounded-2xl text-sm font-medium border-2 transition-all duration-200 outline-none"
      style={{ borderColor: value ? "#4A5D4E" : "#E8EDE6", background: value ? "#F9F6F0" : "#FFF" }}
    />
  </div>
);

const PhoneField = ({ label, value, error, onChange }) => {
  const digits = value.replace(/\D/g, "");
  return (
    <div>
      <label className="block text-[10px] font-bold text-[#5A6B5D] mb-2 uppercase tracking-widest">{label} *</label>
      <input
        type="tel" value={value} onChange={(e) => onChange(e.target.value)} placeholder="08012345678" maxLength={14}
        className="w-full px-5 py-4 rounded-2xl text-sm font-medium border-2 transition-all duration-200 outline-none"
        style={{ borderColor: error ? "#C8795D" : digits.length === 11 ? "#4A5D4E" : "#E8EDE6", background: digits.length === 11 ? "#F9F6F0" : "#FFF" }}
      />
      {error && <p className="text-[10px] font-bold text-[#C8795D] mt-2 uppercase tracking-wider">{error}</p>}
    </div>
  );
};

const SummaryRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between text-sm mb-3">
    <span className="text-[#5A6B5D] flex items-center gap-2 text-xs font-medium">
      <span className="text-base">{icon}</span> {label}
    </span>
    <span className="font-bold text-[#2C3531] text-right max-w-[60%] truncate">{value}</span>
  </div>
);

const InfoBar = ({ icon, children }) => (
  <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F9F6F0] border border-[#E8EDE6] text-xs text-[#5A6B5D] leading-relaxed font-medium">
    <span className="flex-shrink-0 mt-0.5 text-[#4A5D4E]">{icon}</span>
    <span>{children}</span>
  </div>
);

const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C3531]/80 backdrop-blur-md animate-luxe" onClick={onClose}>
    <div className="bg-white rounded-[2rem] p-8 sm:p-10 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-luxe" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);