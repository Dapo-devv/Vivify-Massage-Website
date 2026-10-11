import { useState } from "react";
import { Activity, Zap, Target, AlertTriangle, Flame } from "lucide-react";
import {
  PRICING,
  fmt,
  SPORTS_TECHNIQUES,
  SPORTS_DURATIONS,
  SPORTS_PHASES,
  SPORTS_FOCUS,
} from "../config/services";
import { Btn, Modal, SuccessIcon } from "./ui";
import DateStrip from "./DateStrip";
import SlotGrid from "./SlotGrid";
import { useAvailability } from "../hooks/useAvailability";

const WA_NUMBER = "2347040723894";
const PAYSTACK_KEY = "pk_live_915663b76742c16f999c99e6251596ee7c5c9584";

// Athletic dark theme — deliberately different from spa wizard
const THEME = {
  bg: "linear-gradient(160deg,#0a0a0a 0%,#1a1a1a 50%,#0a0a0a 100%)",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  accent: "#f97316", // orange
  accent2: "#ef4444", // red
};

export default function SportsMassage() {
  const [svcType, setSvcType] = useState("studio");
  const [technique, setTechnique] = useState("met"); // met | pnf
  const [duration, setDuration] = useState(60);
  const [phase, setPhase] = useState(SPORTS_PHASES[0]);
  const [focus, setFocus] = useState([]);
  const [sportType, setSportType] = useState("");
  const [injuries, setInjuries] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneErr, setPhoneErr] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(null);

  const price = PRICING[svcType].sports[duration];
  const techniqueObj = SPORTS_TECHNIQUES.find((t) => t.id === technique);

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

  const valid = !!(
    name &&
    phone.replace(/\D/g, "").length >= 11 &&
    email &&
    date &&
    time
  );

  const handleSubmit = async () => {
    if (!valid) return;
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
          phase,
          focus,
          sportType,
          injuries,
          therapist: "male",
          paymentAmount: price,
          subtotal: price,
          paymentType: svcType === "studio" ? "Full" : "Pay After Session",
        }),
      });
      const { ref } = await res.json();

      const finalize = async (paymentRef = "PAY-AFTER") => {
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
              phase,
              focus,
              sportType,
              injuries,
              price,
              paymentRef,
            },
          }),
        });
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

      // Mobile → no upfront payment
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
    const msg = `Hello Vivify! 🏃 Sports Massage booking:\n\nRef: ${booking.ref}\n👤 ${booking.customerName}\n🏅 Technique: ${booking.technique} (${booking.minutes} min)\n🎯 Focus: ${booking.focus.join(", ") || "Full body"}\n💰 ${fmt(booking.price)}\n\nPlease confirm.`;
    window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
      msg,
    )}`;
  };

  const resetSports = () => {
    setSuccess(false);
    setBooking(null);
    setName("");
    setPhone("");
    setEmail("");
    setPhoneErr("");
    setSportType("");
    setInjuries("");
    setFocus([]);
    setPhase(SPORTS_PHASES[0]);
    setTechnique("met");
    setDuration(60);
    setDate("");
    setTime("");
  };

  return (
    <div
      className="-mx-4 sm:-mx-6 -mt-4 sm:-mt-6 min-h-screen"
      style={{ background: THEME.bg, marginBottom: "-4rem" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-14">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-bold tracking-wider uppercase"
            style={{
              background: "rgba(249,115,22,0.15)",
              color: "#fb923c",
              border: "1px solid rgba(249,115,22,0.3)",
            }}
          >
            <Activity className="w-3.5 h-3.5" /> Vivify Sports Massage
          </div>
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight"
            style={{
              fontFamily: "Cormorant Garamond",
              letterSpacing: "-0.02em",
            }}
          >
            Built For
            <br />
            <span style={{ color: THEME.accent }}>Athletes.</span>
          </h2>
          <p
            className="text-sm sm:text-base max-w-lg mx-auto"
            style={{ color: "#a3a3a3" }}
          >
            MET &amp; PNF stretching with a structured athlete intake. Male
            specialist only. Real recovery for people who train hard.
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
          {[
            { k: "MET / PNF", l: "Techniques" },
            { k: "60 / 90", l: "Min Sessions" },
            { k: "8 Zones", l: "Focus Map" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl p-4 text-center"
              style={{
                background: THEME.card,
                border: `1px solid ${THEME.border}`,
              }}
            >
              <p
                className="text-lg sm:text-xl font-black text-white"
                style={{ fontFamily: "Cormorant Garamond" }}
              >
                {s.k}
              </p>
              <p
                className="text-xs uppercase tracking-wider mt-1"
                style={{ color: "#737373" }}
              >
                {s.l}
              </p>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div
          className="rounded-3xl p-6 sm:p-8"
          style={{
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Location */}
          <SectionLabel n="01" title="Location" />
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { id: "studio", l: "Home Studio", note: "Pay online" },
              { id: "mobile", l: "Mobile", note: "Pay after session" },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => setSvcType(o.id)}
                className="p-4 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor:
                    svcType === o.id ? THEME.accent : "rgba(255,255,255,0.1)",
                  background:
                    svcType === o.id ? "rgba(249,115,22,0.1)" : "transparent",
                }}
              >
                <p className="font-bold text-white text-sm">{o.l}</p>
                <p className="text-xs mt-0.5" style={{ color: "#737373" }}>
                  {o.note}
                </p>
              </button>
            ))}
          </div>

          {/* Technique */}
          <SectionLabel n="02" title="Stretching Technique" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {SPORTS_TECHNIQUES.map((t) => {
              const sel = technique === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setTechnique(t.id)}
                  className="p-5 rounded-2xl cursor-pointer border-2 transition-all"
                  style={{
                    borderColor: sel ? THEME.accent : "rgba(255,255,255,0.1)",
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
                        style={{ background: THEME.accent, color: "white" }}
                      >
                        SELECTED
                      </span>
                    )}
                  </div>
                  <p
                    className="font-bold text-white text-base mb-0.5"
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
                </div>
              );
            })}
          </div>

          {/* Duration */}
          <SectionLabel n="03" title="Session Duration" />
          <div className="grid grid-cols-2 gap-3 mb-8">
            {SPORTS_DURATIONS.map((m) => {
              const p = PRICING[svcType].sports[m];
              const sel = duration === m;
              return (
                <button
                  key={m}
                  onClick={() => setDuration(m)}
                  className="p-4 rounded-2xl border-2 text-center transition-all"
                  style={{
                    borderColor: sel ? THEME.accent : "rgba(255,255,255,0.1)",
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

          {/* Sport type */}
          <SectionLabel n="04" title="Your Sport" />
          <input
            value={sportType}
            onChange={(e) => setSportType(e.target.value)}
            placeholder="e.g. Football, Running, Weightlifting…"
            className="w-full p-3 rounded-xl text-sm mb-8 text-white placeholder-gray-500"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: `2px solid ${
                sportType ? THEME.accent : "rgba(255,255,255,0.1)"
              }`,
            }}
          />

          {/* Phase */}
          <SectionLabel n="05" title="Training Phase" />
          <div className="flex flex-wrap gap-2 mb-8">
            {SPORTS_PHASES.map((p) => (
              <button
                key={p}
                onClick={() => setPhase(p)}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                style={{
                  background:
                    phase === p ? THEME.accent : "rgba(255,255,255,0.05)",
                  color: phase === p ? "white" : "#a3a3a3",
                  border: `1px solid ${
                    phase === p ? THEME.accent : "rgba(255,255,255,0.1)"
                  }`,
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Focus zones */}
          <SectionLabel n="06" title="Focus Areas" hint="Multi-select" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
            {SPORTS_FOCUS.map((f) => {
              const on = focus.includes(f);
              return (
                <button
                  key={f}
                  onClick={() => toggleFocus(f)}
                  className="p-3 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 justify-center"
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

          {/* Injuries */}
          <SectionLabel n="07" title="Injury Notes" hint="Optional" />
          <textarea
            value={injuries}
            onChange={(e) => setInjuries(e.target.value)}
            rows={2}
            placeholder="Any injuries or areas we should avoid…"
            className="w-full p-3 rounded-xl text-sm resize-none mb-8 text-white placeholder-gray-500"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "2px solid rgba(255,255,255,0.1)",
            }}
          />

          {/* Date & time */}
          <SectionLabel n="08" title="Date & Time" />
          <div className="mb-4" style={{ colorScheme: "dark" }}>
            <DateStrip value={date} onChange={setDate} />
          </div>
          {date && (
            <div className="mb-8">
              <SlotGrid
                available={available}
                loading={slotsLoading}
                selected={time}
                onSelect={setTime}
                serviceType={svcType}
              />
            </div>
          )}

          {/* Contact */}
          <SectionLabel n="09" title="Your Details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "#a3a3a3" }}
              >
                Full Name *
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full p-3 rounded-lg text-sm text-white placeholder-gray-500"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `2px solid ${
                    name ? THEME.accent : "rgba(255,255,255,0.1)"
                  }`,
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "#a3a3a3" }}
              >
                Phone *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => validatePhone(e.target.value)}
                placeholder="08012345678"
                className="w-full p-3 rounded-lg text-sm text-white placeholder-gray-500"
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
                <p className="text-xs text-red-400 mt-1">{phoneErr}</p>
              )}
            </div>
          </div>
          <div className="mb-8">
            <label
              className="block text-xs font-semibold mb-1.5"
              style={{ color: "#a3a3a3" }}
            >
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full p-3 rounded-lg text-sm text-white placeholder-gray-500"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: `2px solid ${
                  email ? THEME.accent : "rgba(255,255,255,0.1)"
                }`,
              }}
            />
          </div>

          {/* Warning */}
          <div
            className="flex items-start gap-2 p-3 rounded-xl mb-6 text-xs"
            style={{
              background: "rgba(234,88,12,0.08)",
              border: "1px solid rgba(234,88,12,0.25)",
              color: "#fdba74",
            }}
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Sports Massage is performed by our male specialist only. If you
              have acute injury, please consult a physician first.
            </span>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!valid || loading}
            className="w-full py-4 rounded-2xl font-black text-sm tracking-wider uppercase transition-all"
            style={{
              background: valid
                ? `linear-gradient(135deg,${THEME.accent},${THEME.accent2})`
                : "rgba(255,255,255,0.08)",
              color: valid ? "white" : "#525252",
              cursor: valid ? "pointer" : "not-allowed",
              boxShadow: valid ? "0 8px 30px rgba(249,115,22,0.3)" : "none",
            }}
          >
            {svcType === "studio"
              ? `Book & Pay ${fmt(price)}`
              : `Book Appointment — ${fmt(price)}`}
          </button>
          {svcType === "mobile" && (
            <p
              className="text-xs text-center mt-3"
              style={{ color: "#737373" }}
            >
              💰 Payment collected after your session.
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  border: "3px solid rgba(255,255,255,0.1)",
                  borderTopColor: THEME.accent,
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 16px",
                }}
              />
              <p
                className="font-bold text-white"
                style={{ fontFamily: "Cormorant Garamond", fontSize: 18 }}
              >
                Processing…
              </p>
            </div>
          </div>
        )}

        {/* Success */}
        {success && booking && (
          <Modal onClose={resetSports}>
            <SuccessIcon />
            <h3
              className="text-2xl font-bold text-gray-900 text-center mb-1"
              style={{ fontFamily: "Cormorant Garamond" }}
            >
              Sports Massage Booked!
            </h3>
            <p className="text-center text-sm text-gray-500 mb-4">
              Ref:{" "}
              <span className="font-mono font-semibold">{booking.ref}</span>
            </p>
            <div
              className="rounded-xl p-4 mb-4"
              style={{ background: "#fff7ed" }}
            >
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Technique</span>
                <span className="font-semibold">{booking.technique}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Duration</span>
                <span className="font-semibold">{booking.minutes} min</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Focus</span>
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
            <Btn color="whatsapp" onClick={sendWA}>
              💬 Send Details via WhatsApp
            </Btn>
            <Btn color="blue" onClick={resetSports}>
              Done
            </Btn>
          </Modal>
        )}
      </div>
    </div>
  );
}

const SectionLabel = ({ n, title, hint }) => (
  <div className="flex items-center gap-3 mb-3">
    <span
      className="text-xs font-black tracking-widest"
      style={{ color: "#f97316" }}
    >
      {n}
    </span>
    <span className="text-xs font-bold uppercase tracking-widest text-white">
      {title}
    </span>
    {hint && (
      <span className="text-xs" style={{ color: "#525252" }}>
        · {hint}
      </span>
    )}
    <div
      className="flex-1 h-px"
      style={{ background: "rgba(255,255,255,0.06)" }}
    />
  </div>
);
