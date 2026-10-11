import { useState, useRef, useEffect } from "react";
import {
  Activity,
  Target,
  Check,
  ArrowLeft,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import {
  PRICING,
  fmt,
  SPORTS_TECHNIQUES,
  SPORTS_DURATIONS,
  SPORTS_FOCUS,
  LOCATION_LABEL,
  getSportsTherapistInfo,
} from "../config/services";
import DateStrip from "./DateStrip";
import SlotGrid from "./SlotGrid";
import { useAvailability } from "../hooks/useAvailability";

const WA_NUMBER = "2347040723894";
const PAYSTACK_KEY = "pk_live_915663b76742c16f999c99e6251596ee7c5c9584";

const THEME = {
  bg: "linear-gradient(160deg,#0a0a0a 0%,#141414 50%,#0a0a0a 100%)",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  accent: "#f97316",
  accent2: "#ef4444",
};

export default function SportsMassage() {
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

  // ── Scroll anchor ──
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

  const price = PRICING[svcType].sports[duration];
  const techniqueObj = SPORTS_TECHNIQUES.find((t) => t.id === technique);
  const therapistInfo = getSportsTherapistInfo();

  const { available, loading: slotsLoading } = useAvailability({
    date,
    serviceType: svcType,
    minutes: duration,
  });

  const toggleFocus = (f) =>
    setFocus((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );

  const validatePhone = (v) => {
    setPhone(v);
    const d = v.replace(/\D/g, "");
    setPhoneErr(d.length > 0 && d.length < 11 ? "Must be 11 digits" : "");
  };

  const customerValid = !!(
    name &&
    phone.replace(/\D/g, "").length >= 11 &&
    email
  );

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
          customerName: name,
          customerPhone: phone,
          email,
          serviceType: svcType,
          date,
          time,
          service: "Sports Massage",
          technique: techniqueObj?.name,
          techniqueFull: techniqueObj?.fullName,
          minutes: duration,
          focus,
          sportType,
          injuries: recoveryNotes,
          therapist: "male",
          paymentAmount: price,
          subtotal: price,
          paymentType: svcType === "studio" ? "Full" : "Pay After Session",
        }),
      });
      const { ref } = await res.json();

      const finalize = async (paymentRef = "PAY-AFTER") => {
        try {
          await fetch("/api/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "sports",
              data: {
                ref,
                customerName: name,
                customerPhone: phone,
                email,
                serviceType: svcType,
                date,
                time,
                technique: techniqueObj?.name,
                techniqueFull: techniqueObj?.fullName,
                minutes: duration,
                focus,
                sportType,
                injuries: recoveryNotes,
                price,
                paymentRef,
              },
            }),
          });
        } catch (err) {
          console.error("Email failed:", err);
        }
        setBooking({
          ref,
          customerName: name,
          technique: techniqueObj?.name,
          minutes: duration,
          focus,
          price,
        });
        setLoading(false);
        setSuccess(true);
      };

      if (svcType === "mobile") return finalize();

      if (!window.PaystackPop) {
        setLoading(false);
        return alert("Payment loading. Try again.");
      }

      window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: email || "athlete@vivifymassageandspa.online",
        amount: price * 100,
        currency: "NGN",
        ref,
        metadata: {
          custom_fields: [
            { display_name: "Athlete", variable_name: "athlete", value: name },
          ],
        },
        callback: (r) => finalize(r.reference),
        onClose: () => {
          setLoading(false);
          alert("Payment cancelled.");
        },
      }).openIframe();
    } catch (e) {
      console.error(e);
      setLoading(false);
      alert("Something went wrong.");
    }
  };

  const sendWA = () => {
    if (!booking) return;
    const msg =
      `Hello Vivify! 🏃 Sports Massage:\n\n` +
      `Ref: ${booking.ref}\n` +
      `👤 ${booking.customerName}\n` +
      `🎯 ${booking.technique} · ${booking.minutes} min\n` +
      `💥 Focus: ${booking.focus.join(", ") || "Full body"}\n` +
      `💰 ${fmt(booking.price)}\n\n` +
      `Please confirm.`;
    window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
      msg,
    )}`;
  };

  const reset = () => {
    setStep(0);
    setSuccess(false);
    setBooking(null);
    setSvcType("studio");
    setTechnique("met");
    setDuration(60);
    setFocus([]);
    setSportType("");
    setRecoveryNotes("");
    setDate("");
    setTime("");
    setName("");
    setPhone("");
    setEmail("");
    setPhoneErr("");
  };

  const ctaLabel =
    svcType === "studio" ? `Pay ${fmt(price)}` : "Book Appointment";

  return (
    <div
      ref={topRef}
      className="-mx-4 sm:-mx-6 -mt-4 sm:-mt-6 min-h-screen pb-32 md:pb-16"
      style={{ background: THEME.bg }}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold tracking-wider uppercase"
            style={{
              background: "rgba(249,115,22,0.15)",
              color: "#fb923c",
              border: "1px solid rgba(249,115,22,0.3)",
            }}
          >
            <Activity className="w-3.5 h-3.5" /> Vivify Sports Massage
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 leading-tight"
            style={{
              fontFamily: "Cormorant Garamond",
              letterSpacing: "-0.02em",
            }}
          >
            Whatever your sport.
            <br />
            <span style={{ color: THEME.accent }}>We help you recover.</span>
          </h2>
          <p
            className="text-sm max-w-md mx-auto leading-relaxed"
            style={{ color: "#a3a3a3" }}
          >
            MET &amp; PNF stretching for athletes who train hard.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {["Recovery", "Schedule", "Confirm"].map((label, i) => (
            <div key={label} className="flex-1 flex items-center gap-2">
              <div
                className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background:
                    step > i
                      ? "#10b981"
                      : step === i
                        ? `linear-gradient(135deg,${THEME.accent},${THEME.accent2})`
                        : "rgba(255,255,255,0.1)",
                  color: step >= i ? "white" : "rgba(255,255,255,0.4)",
                  boxShadow:
                    step === i ? "0 4px 12px rgba(249,115,22,0.4)" : "none",
                }}
              >
                {step > i ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < 2 && (
                <div
                  className="flex-1 h-0.5 rounded-full transition-all"
                  style={{
                    background: step > i ? "#10b981" : "rgba(255,255,255,0.1)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-center mb-6" style={{ color: "#737373" }}>
          Step {step + 1} of 3 ·{" "}
          {["Recovery setup", "Schedule", "Confirm"][step]}
        </p>

        {/* Card */}
        <div
          className="rounded-3xl p-6 sm:p-7"
          style={{
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            backdropFilter: "blur(10px)",
          }}
        >
          {/* ── STEP 0 ── */}
          {step === 0 && (
            <div className="space-y-8">
              {/* Therapist info card — driven by SPORTS_THERAPISTS */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background:
                    "linear-gradient(135deg,rgba(249,115,22,0.1),rgba(239,68,68,0.05))",
                  border: "1px solid rgba(249,115,22,0.25)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(249,115,22,0.2)" }}
                  >
                    <UserCheck
                      className="w-5 h-5"
                      style={{ color: THEME.accent }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-white text-sm mb-1"
                      style={{
                        fontFamily: "Cormorant Garamond",
                        fontSize: "1.05rem",
                      }}
                    >
                      {therapistInfo.headline}
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "#a3a3a3" }}
                    >
                      {therapistInfo.detail}
                    </p>
                    {therapistInfo.list.length > 1 && (
                      <ul
                        className="mt-3 pt-3 space-y-1.5"
                        style={{ borderTop: "1px solid rgba(249,115,22,0.15)" }}
                      >
                        {therapistInfo.list.map((t) => (
                          <li
                            key={t.name}
                            className="flex items-center gap-2 text-xs"
                            style={{ color: "#d4d4d4" }}
                          >
                            <span style={{ color: THEME.accent }}>•</span>
                            <span className="font-semibold text-white">
                              {t.name}
                            </span>
                            <span style={{ color: "#737373" }}>· {t.role}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <Section title="Location">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      id: "studio",
                      l: LOCATION_LABEL.studio,
                      note: "Pay online",
                    },
                    {
                      id: "mobile",
                      l: LOCATION_LABEL.mobile,
                      note: "Pay after session",
                    },
                  ].map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSvcType(o.id)}
                      className="p-4 rounded-2xl border-2 text-left transition-all"
                      style={{
                        borderColor:
                          svcType === o.id
                            ? THEME.accent
                            : "rgba(255,255,255,0.1)",
                        background:
                          svcType === o.id
                            ? "rgba(249,115,22,0.1)"
                            : "transparent",
                      }}
                    >
                      <p className="font-bold text-white text-sm leading-tight">
                        {o.l}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "#737373" }}>
                        {o.note}
                      </p>
                    </button>
                  ))}
                </div>
              </Section>

              {/* Sport */}
              <Section title="Your sport">
                <input
                  value={sportType}
                  onChange={(e) => setSportType(e.target.value)}
                  placeholder="e.g. Football, Running, Weightlifting…"
                  className="w-full p-4 rounded-2xl text-sm text-white placeholder-gray-500"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `2px solid ${
                      sportType ? THEME.accent : "rgba(255,255,255,0.1)"
                    }`,
                  }}
                />
              </Section>

              {/* Technique */}
              <Section title="Stretching technique">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SPORTS_TECHNIQUES.map((t) => {
                    const sel = technique === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTechnique(t.id)}
                        className="p-5 rounded-2xl border-2 transition-all text-left"
                        style={{
                          borderColor: sel
                            ? THEME.accent
                            : "rgba(255,255,255,0.1)",
                          background: sel
                            ? "linear-gradient(135deg,rgba(249,115,22,0.15),rgba(239,68,68,0.08))"
                            : "transparent",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{t.icon}</span>
                          {sel && (
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: THEME.accent,
                                color: "white",
                              }}
                            >
                              ✓
                            </span>
                          )}
                        </div>
                        <p
                          className="font-bold text-white text-sm mb-0.5"
                          style={{ fontFamily: "Cormorant Garamond" }}
                        >
                          {t.name}
                        </p>
                        <p
                          className="text-xs font-semibold mb-2"
                          style={{ color: THEME.accent }}
                        >
                          {t.fullName}
                        </p>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: "#a3a3a3" }}
                        >
                          {t.blurb}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Duration */}
              <Section title="Session duration">
                <div className="grid grid-cols-2 gap-3">
                  {SPORTS_DURATIONS.map((m) => {
                    const p = PRICING[svcType].sports[m];
                    const sel = duration === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setDuration(m)}
                        className="p-5 rounded-2xl border-2 text-center transition-all"
                        style={{
                          borderColor: sel
                            ? THEME.accent
                            : "rgba(255,255,255,0.1)",
                          background: sel
                            ? "linear-gradient(135deg,rgba(249,115,22,0.15),rgba(239,68,68,0.08))"
                            : "transparent",
                        }}
                      >
                        <p
                          className="text-2xl font-black text-white"
                          style={{ fontFamily: "Cormorant Garamond" }}
                        >
                          {m}
                        </p>
                        <p
                          className="text-xs uppercase tracking-wider mb-2"
                          style={{ color: "#737373" }}
                        >
                          Minutes
                        </p>
                        <p
                          className="text-lg font-black"
                          style={{
                            color: THEME.accent,
                            fontFamily: "Cormorant Garamond",
                          }}
                        >
                          {fmt(p)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Focus areas */}
              <Section title="Target areas" hint="Multi-select">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SPORTS_FOCUS.map((f) => {
                    const on = focus.includes(f);
                    return (
                      <button
                        key={f}
                        onClick={() => toggleFocus(f)}
                        className="p-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 justify-center"
                        style={{
                          background: on
                            ? "rgba(249,115,22,0.15)"
                            : "rgba(255,255,255,0.04)",
                          color: on ? THEME.accent : "#a3a3a3",
                          border: `1.5px solid ${
                            on ? THEME.accent : "rgba(255,255,255,0.08)"
                          }`,
                        }}
                      >
                        <Target className="w-3.5 h-3.5" /> {f}
                      </button>
                    );
                  })}
                </div>
              </Section>

              {/* Recovery notes */}
              <Section title="Recovery notes" hint="Optional">
                <textarea
                  value={recoveryNotes}
                  onChange={(e) => setRecoveryNotes(e.target.value)}
                  rows={3}
                  placeholder="Anything we should know? Injuries, soreness, tightness…"
                  className="w-full p-4 rounded-2xl text-sm resize-none text-white placeholder-gray-500"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "2px solid rgba(255,255,255,0.1)",
                  }}
                />
              </Section>
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="space-y-6">
              <Section title="Pick a date">
                <div style={{ colorScheme: "dark" }}>
                  <DateStrip value={date} onChange={setDate} />
                </div>
              </Section>

              {date ? (
                <Section title="Pick a time">
                  <SlotGrid
                    available={available}
                    loading={slotsLoading}
                    selected={time}
                    onSelect={setTime}
                    serviceType={svcType}
                  />
                </Section>
              ) : (
                <p
                  className="text-xs text-center py-6"
                  style={{ color: "#525252" }}
                >
                  Choose a date above to see available times
                </p>
              )}
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="space-y-6">
              <Section title="Your details">
                <div className="space-y-4">
                  <DarkField
                    label="Full Name *"
                    value={name}
                    onChange={setName}
                    placeholder="Your name"
                  />
                  <div>
                    <label
                      className="block text-xs font-bold mb-2 uppercase tracking-wider"
                      style={{ color: "#737373" }}
                    >
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => validatePhone(e.target.value)}
                      placeholder="08012345678"
                      className="w-full p-4 rounded-2xl text-sm text-white placeholder-gray-500"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: `2px solid ${
                          phoneErr
                            ? "#ef4444"
                            : phone.replace(/\D/g, "").length === 11
                              ? THEME.accent
                              : "rgba(255,255,255,0.1)"
                        }`,
                      }}
                    />
                    {phoneErr && (
                      <p className="text-xs text-red-400 mt-1.5">{phoneErr}</p>
                    )}
                  </div>
                  <DarkField
                    label="Email *"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@email.com"
                  />
                </div>
              </Section>

              {/* Summary */}
              <div
                className="rounded-2xl p-5"
                style={{
                  background:
                    "linear-gradient(135deg,rgba(249,115,22,0.08),rgba(239,68,68,0.05))",
                  border: "1px solid rgba(249,115,22,0.2)",
                }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: THEME.accent }}
                >
                  Your Sports Massage
                </p>
                <SummaryRow
                  label="Location"
                  value={
                    svcType === "studio"
                      ? LOCATION_LABEL.studio
                      : LOCATION_LABEL.mobile
                  }
                />
                {sportType && <SummaryRow label="Sport" value={sportType} />}
                <SummaryRow
                  label="Technique"
                  value={techniqueObj?.name || "—"}
                />
                <SummaryRow label="Duration" value={`${duration} min`} />
                {focus.length > 0 && (
                  <SummaryRow label="Target areas" value={focus.join(", ")} />
                )}
                <SummaryRow label="Date" value={`${date} · ${time}`} />
                <div
                  className="flex justify-between items-center pt-3 mt-3"
                  style={{ borderTop: "1px solid rgba(249,115,22,0.2)" }}
                >
                  <span className="text-sm font-bold text-white">Total</span>
                  <span
                    className="text-2xl font-black"
                    style={{
                      fontFamily: "Cormorant Garamond",
                      color: THEME.accent,
                    }}
                  >
                    {fmt(price)}
                  </span>
                </div>
              </div>

              <div
                className="flex items-start gap-2 p-3 rounded-xl text-xs leading-relaxed"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#a3a3a3",
                }}
              >
                <UserCheck
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: THEME.accent }}
                />
                <span>
                  <b className="text-white">{therapistInfo.headline}.</b>{" "}
                  {therapistInfo.detail}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              onClick={back}
              className="px-5 py-4 rounded-2xl font-bold text-sm text-white border-2"
              style={{
                borderColor: "rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
            </button>
          )}

          {step < 2 ? (
            <button
              onClick={next}
              disabled={!stepValid[step]}
              className="flex-1 py-4 rounded-2xl font-black text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2"
              style={{
                background: stepValid[step]
                  ? `linear-gradient(135deg,${THEME.accent},${THEME.accent2})`
                  : "rgba(255,255,255,0.08)",
                color: stepValid[step] ? "white" : "#525252",
                cursor: stepValid[step] ? "pointer" : "not-allowed",
                boxShadow: stepValid[step]
                  ? "0 6px 20px rgba(249,115,22,0.35)"
                  : "none",
              }}
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!customerValid || loading}
              className="flex-1 py-4 rounded-2xl font-black text-sm tracking-wider uppercase transition-all"
              style={{
                background: customerValid
                  ? `linear-gradient(135deg,${THEME.accent},${THEME.accent2})`
                  : "rgba(255,255,255,0.08)",
                color: customerValid ? "white" : "#525252",
                cursor: customerValid ? "pointer" : "not-allowed",
                boxShadow: customerValid
                  ? "0 6px 20px rgba(249,115,22,0.35)"
                  : "none",
              }}
            >
              {ctaLabel}
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="rounded-3xl p-8 text-center"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div
              className="w-14 h-14 rounded-full mx-auto mb-4 animate-spin"
              style={{
                border: "3px solid rgba(255,255,255,0.1)",
                borderTopColor: THEME.accent,
              }}
            />
            <p
              className="font-bold text-white"
              style={{ fontFamily: "Cormorant Garamond", fontSize: 20 }}
            >
              {svcType === "mobile"
                ? "Booking your session…"
                : "Opening payment…"}
            </p>
          </div>
        </div>
      )}

      {/* Success */}
      {success && booking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3"
          style={{
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 mx-auto flex items-center justify-center mb-3">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h3
                className="text-2xl font-bold text-gray-900 mb-1"
                style={{ fontFamily: "Cormorant Garamond" }}
              >
                Recovery Session Booked!
              </h3>
              <p className="text-sm text-gray-500">
                Ref: <span className="font-mono">{booking.ref}</span>
              </p>
            </div>

            <div className="rounded-2xl p-4 mb-4 bg-orange-50 border border-orange-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Technique</span>
                <span className="font-semibold text-gray-900">
                  {booking.technique}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold">{booking.minutes} min</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Target areas</span>
                <span className="font-semibold text-right max-w-[60%] truncate">
                  {booking.focus.join(", ") || "Full body"}
                </span>
              </div>
              <div
                className="flex justify-between pt-2 mt-2"
                style={{ borderTop: "1px solid #fed7aa" }}
              >
                <span className="font-semibold">Total</span>
                <span
                  className="text-xl font-bold"
                  style={{
                    fontFamily: "Cormorant Garamond",
                    color: THEME.accent,
                  }}
                >
                  {fmt(booking.price)}
                </span>
              </div>
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
          </div>
        </div>
      )}
    </div>
  );
}

// ── Micro components ──
const Section = ({ title, hint, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <span
        className="text-xs font-black uppercase tracking-widest"
        style={{ color: "#f97316" }}
      >
        {title}
      </span>
      {hint && (
        <span className="text-xs" style={{ color: "#525252" }}>
          · {hint}
        </span>
      )}
    </div>
    {children}
  </div>
);

const DarkField = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label
      className="block text-xs font-bold mb-2 uppercase tracking-wider"
      style={{ color: "#737373" }}
    >
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-4 rounded-2xl text-sm text-white placeholder-gray-500"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: `2px solid ${value ? "#f97316" : "rgba(255,255,255,0.1)"}`,
      }}
    />
  </div>
);

const SummaryRow = ({ label, value }) => (
  <div className="flex justify-between text-sm mb-2">
    <span style={{ color: "#a3a3a3" }}>{label}</span>
    <span className="font-semibold text-white text-right max-w-[60%] truncate">
      {value}
    </span>
  </div>
);
