import { useState, useRef, useEffect } from "react";
import { Activity, Target, Check, ArrowLeft, ArrowRight, UserCheck } from "lucide-react";
import {
  PRICING, fmt, SPORTS_TECHNIQUES, SPORTS_DURATIONS, SPORTS_FOCUS, LOCATION_LABEL, getSportsTherapistInfo,
} from "../config/services";
import DateStrip from "./DateStrip";
import SlotGrid from "./SlotGrid";
import { useAvailability } from "../hooks/useAvailability";

const WA_NUMBER = "2347040723894";
const PAYSTACK_KEY = "pk_live_915663b76742c16f999c99e6251596ee7c5c9584";

// 🚨 EXPLICIT PRICING LOGIC
const getExplicitPrice = (svcType, techniqueId, duration) => {
  if (techniqueId === "deep-tissue-sports") {
    if (svcType === "studio") return duration === 60 ? 45000 : 60000;
    if (svcType === "mobile") return duration === 60 ? 65000 : 85000;
  }
  // Default Sports Pricing (MET / PNF)
  if (svcType === "studio") return duration === 60 ? 50000 : 70000;
  if (svcType === "mobile") return duration === 60 ? 70000 : 95000;
  return 0;
};

export default function SportsMassage({ showToast }) {
  const [step, setStep] = useState(0);

  const [svcType, setSvcType] = useState("studio");
  const [technique, setTechnique] = useState("met");
  const [duration, setDuration] = useState(60);
  const [focus, setFocus] = useState([]);
  const [sportType, setSportType] = useState("");
  const [recoveryNotes, setRecoveryNotes] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(null);

  const topRef = useRef(null);
  useEffect(() => {
    if (!topRef.current) return;
    const headerOffset = window.innerWidth < 768 ? 70 : 90;
    const y = topRef.current.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: Math.max(y, 0), behavior: "smooth" });
  }, [step]);

  const currentPrice = getExplicitPrice(svcType, technique, duration);
  const price60 = getExplicitPrice(svcType, technique, 60);
  const price90 = getExplicitPrice(svcType, technique, 90);

  const techniqueObj = SPORTS_TECHNIQUES.find((t) => t.id === technique);
  const therapistInfo = getSportsTherapistInfo();

  const { available, loading: slotsLoading } = useAvailability({
    date, serviceType: svcType, minutes: duration,
  });

  const toggleFocus = (f) => setFocus((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  const validatePhone = (v) => {
    setPhone(v);
    const d = v.replace(/\D/g, "");
    setPhoneErr(d.length > 0 && d.length < 11 ? "Must be 11 digits" : "");
  };

  const customerValid = !!(name && phone.replace(/\D/g, "").length >= 11 && email);
  const stepValid = [true, !!(date && time), customerValid];

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!customerValid) return;
    setLoading(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name, customerPhone: phone, email, serviceType: svcType,
          date, time, service: "Sports Massage", technique: techniqueObj?.name,
          techniqueFull: techniqueObj?.fullName, minutes: duration, focus,
          sportType, injuries: recoveryNotes, therapist: "male",
          paymentAmount: currentPrice, subtotal: currentPrice,
          paymentType: svcType === "studio" ? "Full" : "Pay After Session",
        }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch (e) { throw new Error("Server error. Please try again."); }
      if (!res.ok) throw new Error(data.error || "Failed to create booking.");

      const { ref } = data;

      const finalize = async (paymentRef = "PAY-AFTER") => {
        try {
          await fetch("/api/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "sports",
              data: {
                ref, customerName: name, customerPhone: phone, email, serviceType: svcType,
                date, time, technique: techniqueObj?.name, techniqueFull: techniqueObj?.fullName,
                minutes: duration, focus, sportType, injuries: recoveryNotes, price: currentPrice, paymentRef,
              },
            }),
          });
        } catch (err) { console.error("Email failed:", err); }

        setBooking({ ref, customerName: name, technique: techniqueObj?.name, minutes: duration, focus, price: currentPrice });
        setLoading(false);
        setSuccess(true);
      };

      if (svcType === "mobile") return finalize();

      if (!window.PaystackPop) {
        setLoading(false);
        return showToast("Payment loading. Try again.");
      }

      window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: email || "athlete@vivifymassageandspa.online",
        amount: Math.round(currentPrice * 100),
        currency: "NGN",
        ref,
        metadata: { custom_fields: [{ display_name: "Athlete", variable_name: "athlete", value: name }] },
        callback: function (r) { finalize(r.reference); },
        onClose: function () { setLoading(false); showToast("Payment cancelled."); },
      }).openIframe();
    } catch (e) {
      console.error(e);
      setLoading(false);
      showToast(e.message || "Something went wrong.");
    }
  };

  const sendWA = () => {
    if (!booking) return;
    const msg = `Hello Vivify! 🏃 Sports Massage:\n\nRef: ${booking.ref}\n👤 ${booking.customerName}\n🎯 ${booking.technique} · ${booking.minutes} min\n💥 Focus: ${booking.focus.join(", ") || "Full body"}\n💰 ${fmt(booking.price)}\n\nPlease confirm.`;
    window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  const reset = () => {
    setStep(0); setSuccess(false); setBooking(null); setSvcType("studio");
    setTechnique("met"); setDuration(60); setFocus([]); setSportType("");
    setRecoveryNotes(""); setDate(""); setTime(""); setName(""); setPhone(""); setEmail(""); setPhoneErr("");
  };

  const ctaLabel = svcType === "studio" ? `Pay ${fmt(currentPrice)}` : "Confirm Appointment";

  return (
    <div ref={topRef} className="max-w-3xl mx-auto py-12 px-4 sm:px-6 animate-luxe">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold tracking-widest uppercase bg-[#E8EDE6] text-[#4A5D4E]">
          <Activity className="w-3.5 h-3.5" /> Athletic Recovery
        </div>
        <h2 className="text-4xl sm:text-5xl font-medium text-[#2C3531] mb-4 leading-tight" style={{ fontFamily: "Cormorant Garamond" }}>
          Whatever your sport. <br />
          <span className="italic text-[#C8795D]">We help you recover.</span>
        </h2>
        <p className="text-[#5A6B5D] max-w-md mx-auto text-lg font-light">MET & PNF stretching for athletes who train hard.</p>
      </div>

      <div className="mb-10 text-center">
        <p className="text-[10px] font-bold text-[#A3B19B] uppercase tracking-[0.2em] mb-4">
          Step {step + 1} of 3 — {["Recovery Setup", "Schedule", "Confirm"][step]}
        </p>
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${step >= i ? "w-8 bg-[#4A5D4E]" : "w-4 bg-[#E8EDE6]"}`} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-[#E8EDE6]">
        {step === 0 && (
          <div className="space-y-8 animate-luxe">
            <div className="rounded-2xl p-6 bg-[#F9F6F0] border border-[#E8EDE6]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#4A5D4E] text-white">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#2C3531] text-lg mb-1" style={{ fontFamily: "Cormorant Garamond" }}>
                    {therapistInfo.headline}
                  </p>
                  <p className="text-sm text-[#5A6B5D] leading-relaxed">{therapistInfo.detail}</p>
                </div>
              </div>
            </div>

            <div>
              <Label>Location</Label>
              <div className="grid grid-cols-2 gap-3">
                {[{ id: "studio", l: LOCATION_LABEL.studio, note: "Pay online" }, { id: "mobile", l: LOCATION_LABEL.mobile, note: "Pay after session" }].map((o) => (
                  <button key={o.id} onClick={() => setSvcType(o.id)} className="p-4 rounded-xl border-2 text-left transition-all" style={{ borderColor: svcType === o.id ? "#4A5D4E" : "#E8EDE6", background: svcType === o.id ? "#F9F6F0" : "white" }}>
                    <p className="font-bold text-[#2C3531] text-sm">{o.l}</p>
                    <p className="text-xs text-[#A3B19B] mt-1 font-medium">{o.note}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Your Sport</Label>
              <input value={sportType} onChange={(e) => setSportType(e.target.value)} placeholder="e.g. Football, Running, Weightlifting…" className="w-full p-4 rounded-xl text-sm font-medium border-2 border-[#E8EDE6] focus:border-[#4A5D4E] outline-none bg-white" />
            </div>

            <div>
              <Label>Technique</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SPORTS_TECHNIQUES.map((t) => {
                  const sel = technique === t.id;
                  return (
                    <button key={t.id} onClick={() => setTechnique(t.id)} className="p-5 rounded-xl border-2 text-left transition-all" style={{ borderColor: sel ? "#4A5D4E" : "#E8EDE6", background: sel ? "#F9F6F0" : "white" }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl">{t.icon}</span>
                        {sel && <div className="w-5 h-5 rounded-full bg-[#4A5D4E] flex items-center justify-center"><Check className="w-3 text-white" /></div>}
                      </div>
                      <p className="font-bold text-[#2C3531] text-sm mb-1" style={{ fontFamily: "Cormorant Garamond" }}>{t.name}</p>
                      <p className="text-[10px] font-bold text-[#C8795D] uppercase tracking-wider mb-2">{t.fullName}</p>
                      <p className="text-xs text-[#5A6B5D] leading-relaxed">{t.blurb}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Session Duration</Label>
              <div className="grid grid-cols-2 gap-3">
                {SPORTS_DURATIONS.map((m) => {
                  const sel = duration === m;
                  const displayPrice = m === 60 ? price60 : price90;
                  return (
                    <button key={m} onClick={() => setDuration(m)} className="p-5 rounded-xl border-2 text-center transition-all" style={{ borderColor: sel ? "#4A5D4E" : "#E8EDE6", background: sel ? "#F9F6F0" : "white" }}>
                      <p className={`text-2xl font-bold ${sel ? "text-[#2C3531]" : "text-[#5A6B5D]"}`} style={{ fontFamily: "Cormorant Garamond" }}>{m}</p>
                      <p className="text-[10px] text-[#A3B19B] uppercase tracking-wider mb-2 font-bold">Minutes</p>
                      <p className="text-lg font-bold text-[#4A5D4E]" style={{ fontFamily: "Cormorant Garamond" }}>{fmt(displayPrice)}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Target Areas <span className="text-[#A3B19B] font-normal text-[10px]">(Multi-select)</span></Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SPORTS_FOCUS.map((f) => {
                  const on = focus.includes(f);
                  return (
                    <button key={f} onClick={() => toggleFocus(f)} className={`p-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border-2 ${on ? "bg-[#4A5D4E] border-[#4A5D4E] text-white" : "bg-white border-[#E8EDE6] text-[#5A6B5D] hover:border-[#A3B19B]"}`}>
                      <Target className="w-3.5 h-3.5" /> {f}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>Recovery Notes <span className="text-[#A3B19B] font-normal text-[10px]">(Optional)</span></Label>
              <textarea value={recoveryNotes} onChange={(e) => setRecoveryNotes(e.target.value)} rows={3} placeholder="Anything we should know? Injuries, soreness, tightness…" className="w-full p-4 rounded-xl text-sm font-medium border-2 border-[#E8EDE6] focus:border-[#4A5D4E] outline-none resize-none bg-white" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8 animate-luxe">
            <div>
              <Label>Pick a Date</Label>
              <DateStrip value={date} onChange={setDate} />
            </div>
            {date ? (
              <div className="animate-luxe">
                <Label>Pick a Time</Label>
                <SlotGrid available={available} loading={slotsLoading} selected={time} onSelect={setTime} serviceType={svcType} />
              </div>
            ) : (
              <p className="text-sm text-center py-6 text-[#A3B19B] font-medium">Choose a date above to see available times</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-luxe">
            <div>
              <Label>Your Details</Label>
              <div className="space-y-4">
                <Field label="Full Name" value={name} onChange={setName} placeholder="Your name" />
                <PhoneField label="Phone Number" value={phone} error={phoneErr} onChange={validatePhone} />
                <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
              </div>
            </div>

            <div className="rounded-2xl p-6 bg-[#F9F6F0] border border-[#E8EDE6]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D4E] mb-4">Recovery Summary</p>
              <SummaryRow label="Location" value={svcType === "studio" ? LOCATION_LABEL.studio : LOCATION_LABEL.mobile} />
              {sportType && <SummaryRow label="Sport" value={sportType} />}
              <SummaryRow label="Technique" value={techniqueObj?.name || "—"} />
              <SummaryRow label="Duration" value={`${duration} min`} />
              {focus.length > 0 && <SummaryRow label="Target areas" value={focus.join(", ")} />}
              <SummaryRow label="Schedule" value={`${date} · ${time}`} />

              <div className="flex justify-between items-center pt-4 mt-4 border-t border-[#E8EDE6]">
                <span className="text-sm font-bold text-[#2C3531] uppercase tracking-widest">Total</span>
                <span className="text-3xl font-bold text-[#4A5D4E]" style={{ fontFamily: "Cormorant Garamond" }}>{fmt(currentPrice)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button onClick={back} className="px-6 py-4 rounded-2xl font-bold text-sm border-2 border-[#E8EDE6] bg-white text-[#5A6B5D] hover:bg-[#F4F1E9] transition-all flex-shrink-0">
            Back
          </button>
        )}
        {step < 2 ? (
          <button onClick={next} disabled={!stepValid[step]} className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg disabled:shadow-none" style={{ background: stepValid[step] ? "#4A5D4E" : "#E8EDE6", color: stepValid[step] ? "white" : "#A3B19B", cursor: stepValid[step] ? "pointer" : "not-allowed" }}>
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!customerValid || loading} className="flex-1 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg disabled:shadow-none" style={{ background: customerValid ? "#4A5D4E" : "#E8EDE6", color: customerValid ? "white" : "#A3B19B", cursor: customerValid ? "pointer" : "not-allowed" }}>
            {ctaLabel}
          </button>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3531]/80 backdrop-blur-md animate-luxe">
          <div className="bg-[#F9F6F0] rounded-3xl p-10 text-center shadow-2xl mx-4 flex flex-col items-center max-w-sm w-full border border-[#E8EDE6]">
            <div className="w-16 h-16 rounded-full mb-6 animate-spin border-4 border-[#E8EDE6] border-t-[#4A5D4E]" />
            <h3 className="font-bold text-[#2C3531] text-2xl mb-2" style={{ fontFamily: "Cormorant Garamond" }}>{svcType === "mobile" ? "Booking your session…" : "Opening payment…"}</h3>
          </div>
        </div>
      )}

      {success && booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C3531]/80 backdrop-blur-md animate-luxe">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-luxe">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#E8EDE6] mx-auto flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-[#4A5D4E]" />
              </div>
              <h3 className="text-3xl font-bold text-[#2C3531] mb-2" style={{ fontFamily: "Cormorant Garamond" }}>Recovery Confirmed</h3>
              <p className="text-sm text-[#5A6B5D] font-medium">Ref: <span className="font-mono bg-[#F9F6F0] px-2 py-1 rounded-md">{booking.ref}</span></p>
            </div>
            <div className="rounded-2xl p-5 mb-6 bg-[#F9F6F0] border border-[#E8EDE6]">
              <div className="flex justify-between text-sm mb-2"><span className="text-[#5A6B5D]">Technique</span><span className="font-bold text-[#2C3531]">{booking.technique}</span></div>
              <div className="flex justify-between text-sm mb-2"><span className="text-[#5A6B5D]">Duration</span><span className="font-bold text-[#2C3531]">{booking.minutes} min</span></div>
              <div className="flex justify-between text-sm mb-2"><span className="text-[#5A6B5D]">Target</span><span className="font-bold text-[#2C3531] text-right max-w-[60%] truncate">{booking.focus.join(", ") || "Full body"}</span></div>
              <div className="flex justify-between items-center pt-4 mt-2 border-t border-[#E8EDE6]"><span className="text-sm font-bold text-[#2C3531]">Total</span><span className="text-2xl font-bold text-[#4A5D4E]" style={{ fontFamily: "Cormorant Garamond" }}>{fmt(booking.price)}</span></div>
            </div>
            <button onClick={sendWA} className="w-full py-4 rounded-xl font-bold text-white mb-3 shadow-lg" style={{ background: "#25D366" }}>Send Details via WhatsApp</button>
            <button onClick={reset} className="w-full py-3 rounded-xl font-bold text-sm bg-[#F9F6F0] border border-[#E8EDE6] text-[#2C3531]">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

const Label = ({ children }) => <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#4A5D4E] mb-3">{children}</p>;
const Field = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-[10px] font-bold text-[#5A6B5D] mb-1.5 uppercase tracking-widest">{label} *</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-5 py-4 rounded-xl text-sm font-medium border-2 transition-all outline-none" style={{ borderColor: value ? "#4A5D4E" : "#E8EDE6", background: value ? "#F9F6F0" : "#FFF" }} />
  </div>
);
const PhoneField = ({ label, value, error, onChange }) => {
  const digits = value.replace(/\D/g, "");
  return (
    <div>
      <label className="block text-[10px] font-bold text-[#5A6B5D] mb-1.5 uppercase tracking-widest">{label} *</label>
      <input type="tel" value={value} onChange={(e) => onChange(e.target.value)} placeholder="08012345678" maxLength={14} className="w-full px-5 py-4 rounded-xl text-sm font-medium border-2 transition-all outline-none" style={{ borderColor: error ? "#C8795D" : digits.length === 11 ? "#4A5D4E" : "#E8EDE6", background: digits.length === 11 ? "#F9F6F0" : "#FFF" }} />
      {error && <p className="text-[10px] font-bold text-[#C8795D] mt-2 uppercase tracking-wider">{error}</p>}
    </div>
  );
};
const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between text-sm mb-3">
    <span className="text-[#5A6B5D] text-xs font-medium">{label}</span>
    <span className="font-bold text-[#2C3531] text-right max-w-[60%] truncate">{value}</span>
  </div>
);