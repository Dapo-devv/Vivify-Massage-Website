import React, { useState, useEffect } from "react";
import { Phone, MapPin, Sparkles, Shield, Star, Gift, Crown, Check, ArrowLeft, AlertCircle } from "lucide-react";
import { SERVICES, ADDONS, MEMBERSHIP_PLAN, fmt, getPrice, durList, LOCATION_LABEL } from "./config/services";
import LocationGate from "./components/LocationGate";
import MassageGuide from "./components/MassageGuide";
import BookingWizard from "./components/BookingWizard";
import SportsMassage from "./components/SportsMassage";

const PAYSTACK_KEY = "pk_live_915663b76742c16f999c99e6251596ee7c5c9584";
const WA_NUMBER = "2347040723894";

const TABS = [
  { id: "booking", icon: "✧", short: "Rituals", full: "Signature Rituals" },
  { id: "sports", icon: "❖", short: "Sports", full: "Sports Therapy" },
  { id: "membership", icon: "♕", short: "Club", full: "Wellness Club" },
  { id: "giftcard", icon: "❦", short: "Gift", full: "Gift Cards" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SELF-CONTAINED UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Tick = () => (
  <div className="w-6 h-6 rounded-full bg-[#4A5D4E] flex items-center justify-center flex-shrink-0">
    <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
  </div>
);
const TF = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="block text-[10px] font-bold text-[#5A6B5D] mb-1.5 uppercase tracking-widest">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-5 py-4 rounded-xl text-sm font-medium border-2 transition-all duration-200 outline-none" style={{ borderColor: value ? "#4A5D4E" : "#E8EDE6", background: value ? "#F9F6F0" : "#FFF" }} />
  </div>
);
const PF = ({ label, value, error, onChange }) => {
  const digits = value.replace(/\D/g, "");
  return (
    <div>
      <label className="block text-[10px] font-bold text-[#5A6B5D] mb-1.5 uppercase tracking-widest">{label}</label>
      <input type="tel" value={value} onChange={(e) => onChange(e.target.value)} placeholder="08012345678" maxLength={14} className="w-full px-5 py-4 rounded-xl text-sm font-medium border-2 transition-all duration-200 outline-none" style={{ borderColor: error ? "#C8795D" : digits.length === 11 ? "#4A5D4E" : "#E8EDE6", background: digits.length === 11 ? "#F9F6F0" : "#FFF" }} />
      {error && <p className="text-[10px] font-bold text-[#C8795D] mt-2 uppercase tracking-wider">{error}</p>}
    </div>
  );
};
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C3531]/80 backdrop-blur-md animate-luxe" onClick={onClose}>
    <div className="bg-white rounded-[2rem] p-8 sm:p-10 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-luxe" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS & CUSTOM TOAST
// ─────────────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  const ToastComponent = () => {
    if (!toast) return null;
    return (
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-luxe w-[90%] max-w-sm">
        <div className={`p-4 rounded-2xl shadow-2xl flex items-start gap-3 border-2 ${toast.type === "error" ? "bg-[#FDF4F2] border-[#E8C5BC] text-[#9B5C4A]" : "bg-[#F0F5EF] border-[#A3B19B] text-[#4A5D4E]"}`}>
          {toast.type === "error" ? <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />}
          <p className="text-sm font-bold flex-1">{toast.message}</p>
        </div>
      </div>
    );
  };
  return { showToast, ToastComponent };
};

const onPhone = (v, set, setErr) => {
  set(v);
  const d = v.replace(/\D/g, "");
  setErr(d.length > 0 && d.length < 11 ? "Must be 11 digits" : "");
};

const paystackPay = ({ amount, meta, onSuccess, onFailure, email, ref }) => {
  if (!window.PaystackPop) {
    if (onFailure) onFailure("Payment system loading. Please try again.");
    return;
  }
  window.PaystackPop.setup({
    key: PAYSTACK_KEY,
    email: email || "customer@vivifymassageandspa.online",
    amount: Math.round(amount * 100),
    currency: "NGN",
    ref: ref || `VMS_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    metadata: { custom_fields: meta },
    callback: function (res) { onSuccess(res); },
    onClose: function () { if (onFailure) onFailure("Payment cancelled. Contact us at 07040723894."); },
  }).openIframe();
};

const sendWA = (msg) => { window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`; };

const FC = ({ children }) => (
  <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-[#4A5D4E]/5 border border-[#E8EDE6]">{children}</div>
);
const SBox = ({ rows, hi }) => (
  <div className="rounded-2xl p-6 mb-6 space-y-4 bg-[#F9F6F0] border border-[#E8EDE6]">
    {rows.map(([l, v]) => (
      <div key={l} className="flex justify-between text-sm items-center">
        <span className="text-[#5A6B5D] text-[10px] font-bold uppercase tracking-widest">{l}</span>
        <span className={`font-bold text-right max-w-[60%] truncate ${l === hi ? "text-xl text-[#4A5D4E]" : "text-[#2C3531]"}`} style={l === hi ? { fontFamily: "Cormorant Garamond" } : {}}>{v}</span>
      </div>
    ))}
  </div>
);
const SectionHeading = ({ number, title, hint }) => (
  <div className="mb-8">
    <div className="flex items-center gap-4 mb-2">
      <span className="text-xs font-black tracking-widest text-[#C8795D] bg-[#FDF4F2] px-3 py-1 rounded-full">{number}</span>
      <span className="text-sm font-bold text-[#2C3531] uppercase tracking-widest">{title}</span>
    </div>
    {hint && <p className="text-sm text-[#5A6B5D] font-light mt-1">{hint}</p>}
  </div>
);
const SubLabel = ({ children }) => (
  <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A6B5D] mb-3">{children}</p>
);

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERSHIP
// ─────────────────────────────────────────────────────────────────────────────
const MembershipSection = ({ sendEmail, showToast }) => {
  const plan = MEMBERSHIP_PLAN;
  const [mSvcType, setMSvcType] = useState("studio");
  const [mSvc, setMSvc] = useState("");
  const [mDur, setMDur] = useState("");
  const [mSessions, setMSessions] = useState(1);
  const [mName, setMName] = useState("");
  const [mPhone, setMPhone] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mPhoneErr, setMPhoneErr] = useState("");
  const [mLoading, setMLoading] = useState(false);
  const [mSuccess, setMSuccess] = useState(false);
  const [mDetails, setMDetails] = useState(null);

  const basePrice = getPrice(mSvcType, mSvc, mDur);
  const totalWithoutDiscount = basePrice * mSessions;
  const discountAmount = mSessions === 2 ? totalWithoutDiscount * 0.05 : 0;
  const finalMonthlyPrice = Math.round(totalWithoutDiscount - discountAmount);

  const mDone = !!(mSvc && mSvcType && mName && mPhone && mPhone.replace(/\D/g, "").length >= 11 && mEmail && mDur);

  useEffect(() => { if (mSvc && mDur && !durList(mSvc).includes(Number(mDur))) setMDur(""); }, [mSvc, mDur]);

  const handleMembership = () => {
    if (!mDone) return showToast("Please complete all fields.");
    setMLoading(true);
    const svcObj = SERVICES.find((s) => s.id === mSvc);
    const data = { name: mName, phone: mPhone, email: mEmail, plan: `${plan.name} (${mSessions}x/month)`, service: svcObj?.name, location: LOCATION_LABEL[mSvcType], duration: `${mDur} minutes`, sessions: mSessions, normalPrice: totalWithoutDiscount, monthlyAmount: finalMonthlyPrice, savedPerMonth: discountAmount };

    paystackPay({
      amount: finalMonthlyPrice, email: mEmail,
      meta: [{ display_name: "Member", variable_name: "member", value: mName }],
      onSuccess: async (res) => {
        const u = { ...data, ref: res.reference };
        await sendEmail("membership", u);
        setMDetails(u); setMLoading(false); setMSuccess(true);
      },
      onFailure: (msg) => { setMLoading(false); showToast(msg); },
    });
  };

  const resetMembership = () => { setMSuccess(false); setMName(""); setMPhone(""); setMEmail(""); setMSvc(""); setMDur(""); setMDetails(null); };

  return (
    <div className="max-w-3xl mx-auto pb-32 md:pb-12 animate-luxe">
      <div className="text-center mb-12 px-4">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-[#E8EDE6] text-[#4A5D4E]">
          <Crown className="w-3.5 h-3.5" /> Monthly Wellness Club
        </div>
        <h2 className="text-4xl sm:text-6xl font-medium text-[#2C3531] mb-6 leading-tight" style={{ fontFamily: "Cormorant Garamond" }}>
          A ritual a month. <br />
          <span className="italic text-[#C8795D]">A lifetime of balance.</span>
        </h2>
      </div>

      <div className="rounded-[2.5rem] overflow-hidden mb-10 shadow-2xl border border-[#E8EDE6] bg-white">
        <div className="px-8 py-8 bg-[#4A5D4E]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="text-4xl bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">{plan.icon}</div>
              <div>
                <p className="font-medium text-white text-3xl leading-tight" style={{ fontFamily: "Cormorant Garamond" }}>{plan.name}</p>
                <p className="text-xs text-[#E8EDE6] mt-1 font-medium">{plan.tagline}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-10 sm:px-12">
          <ul className="space-y-5 mb-10">
            {plan.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl bg-[#F9F6F0] border border-[#E8EDE6] text-[#4A5D4E]">{b.icon}</div>
                <p className="text-[#5A6B5D] leading-relaxed pt-2.5 font-light">{b.text}</p>
              </li>
            ))}
          </ul>

          <div className="space-y-8 pt-8 border-t border-[#F4F1E9]">
            <div>
              <SubLabel>How many sessions per month?</SubLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => setMSessions(1)} className="p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden" style={{ borderColor: mSessions === 1 ? "#4A5D4E" : "#E8EDE6", background: mSessions === 1 ? "#F9F6F0" : "white" }}>
                  <p className="font-bold text-[#2C3531] text-sm">1 Session / Month</p>
                  <p className="text-xs text-[#5A6B5D] mt-1">Standard rate</p>
                </button>
                <button onClick={() => setMSessions(2)} className="p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden" style={{ borderColor: mSessions === 2 ? "#4A5D4E" : "#E8EDE6", background: mSessions === 2 ? "#F9F6F0" : "white" }}>
                  <div className="absolute top-0 right-0 bg-[#C8795D] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl-lg">Save 5%</div>
                  <p className="font-bold text-[#2C3531] text-sm">2 Sessions / Month</p>
                  <p className="text-xs text-[#C8795D] mt-1 font-medium">Discounted rate</p>
                </button>
              </div>
            </div>

            <div>
              <SubLabel>Location Preference</SubLabel>
              <div className="grid grid-cols-2 gap-4">
                {[{ id: "studio", l: LOCATION_LABEL.studio }, { id: "mobile", l: LOCATION_LABEL.mobile }].map((o) => (
                  <button key={o.id} onClick={() => setMSvcType(o.id)} className="p-4 rounded-xl border-2 text-left transition-all duration-200" style={{ borderColor: mSvcType === o.id ? "#4A5D4E" : "#E8EDE6", background: mSvcType === o.id ? "#F9F6F0" : "white" }}>
                    <p className="font-bold text-[#2C3531] text-sm">{o.l}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <SubLabel>Your Monthly Ritual</SubLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICES.map((svc) => (
                  <button key={svc.id} onClick={() => setMSvc(svc.id)} className="p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all duration-200" style={{ borderColor: mSvc === svc.id ? "#4A5D4E" : "#E8EDE6", background: mSvc === svc.id ? "#F9F6F0" : "white" }}>
                    <span className="text-2xl">{svc.icon}</span>
                    <span className="font-bold text-[#2C3531] text-sm flex-1">{svc.name}</span>
                    {mSvc === svc.id && <Tick />}
                  </button>
                ))}
              </div>
            </div>

            {mSvc && (
              <div className="animate-luxe">
                <SubLabel>Session Length</SubLabel>
                <div className="grid grid-cols-3 gap-3">
                  {durList(mSvc).map((m) => {
                    const p = getPrice(mSvcType, mSvc, m);
                    const sel = mDur === m;
                    return (
                      <button key={m} onClick={() => setMDur(m)} className="p-4 rounded-xl border-2 text-center transition-all duration-200" style={{ borderColor: sel ? "#4A5D4E" : "#E8EDE6", background: sel ? "#F9F6F0" : "white" }}>
                        <p className={`font-bold text-sm ${sel ? "text-[#2C3531]" : "text-[#5A6B5D]"}`}>{m} min</p>
                        <p className="text-[10px] text-[#A3B19B] mt-1">{fmt(p)} per session</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mSvc && mDur && (
              <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#F9F6F0] border border-[#E8EDE6] animate-luxe">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A5D4E] mb-1">Monthly Fee</p>
                  <p className="text-xs text-[#5A6B5D] font-medium">{mSessions} session{mSessions > 1 ? 's' : ''} / month · cancel anytime</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-4xl font-bold leading-none text-[#4A5D4E]" style={{ fontFamily: "Cormorant Garamond" }}>{fmt(finalMonthlyPrice)}</p>
                  {mSessions === 2 && <p className="text-xs text-[#C8795D] font-bold mt-2">You save {fmt(discountAmount)}/mo</p>}
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 pt-10 border-t border-[#F4F1E9]">
            <SubLabel>Your Details</SubLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <TF label="Full Name *" value={mName} onChange={setMName} placeholder="Your name" />
              <PF label="Phone *" value={mPhone} error={mPhoneErr} onChange={(v) => onPhone(v, setMPhone, setMPhoneErr)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#5A6B5D] mb-2 uppercase tracking-widest">Email Address *</label>
              <input type="email" value={mEmail} onChange={(e) => setMEmail(e.target.value)} placeholder="your@email.com" className="w-full p-5 rounded-xl text-sm font-medium border-2 transition-all duration-200 outline-none" style={{ borderColor: mEmail ? "#4A5D4E" : "#E8EDE6", background: mEmail ? "#F9F6F0" : "#FFF" }} />
            </div>
          </div>

          <button onClick={handleMembership} disabled={!mDone} className="w-full mt-10 py-5 rounded-2xl font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-xl disabled:shadow-none" style={{ background: mDone ? "#4A5D4E" : "#E8EDE6", color: mDone ? "white" : "#A3B19B", cursor: mDone ? "pointer" : "not-allowed" }}>
            <Crown className="w-4 h-4" />
            {mSvc && mDur ? `Join Club — ${fmt(finalMonthlyPrice)}/mo` : "Join The Club"}
          </button>
          <p className="text-xs text-center text-[#A3B19B] mt-5 font-medium flex items-center justify-center gap-1.5"><Shield className="w-3 h-3" /> Secure via Paystack · Cancel anytime</p>
        </div>
      </div>

      {mLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3531]/80 backdrop-blur-md animate-luxe">
          <div className="bg-[#F9F6F0] rounded-3xl p-10 text-center shadow-2xl mx-4 flex flex-col items-center max-w-sm w-full border border-[#E8EDE6]">
            <div className="w-16 h-16 rounded-full mb-6 animate-spin border-4 border-[#E8EDE6] border-t-[#4A5D4E]" />
            <h3 className="font-bold text-[#2C3531] text-2xl mb-2" style={{ fontFamily: "Cormorant Garamond" }}>Processing…</h3>
            <p className="text-sm text-[#5A6B5D]">Please wait.</p>
          </div>
        </div>
      )}

      {mSuccess && mDetails && (
        <Modal onClose={resetMembership}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-[#E8EDE6] mx-auto flex items-center justify-center mb-5 animate-luxe">
              <Crown className="w-10 h-10 text-[#4A5D4E]" />
            </div>
            <h3 className="text-3xl font-bold text-[#2C3531] mb-2" style={{ fontFamily: "Cormorant Garamond" }}>Welcome to the Club</h3>
            <p className="text-sm text-[#5A6B5D] font-medium">Confirmation sent to <b>{mDetails.email}</b></p>
          </div>
          <SBox rows={[["Member", mDetails.name], ["Plan", mDetails.plan], ["Monthly ritual", mDetails.service], ["Session", mDetails.duration], ["Location", mDetails.location], ["Monthly Fee", fmt(mDetails.monthlyAmount)], ["You save", fmt(mDetails.savedPerMonth)], ["Ref", mDetails.ref]]} hi="Monthly Fee" />
          <div className="rounded-2xl bg-[#F9F6F0] border border-[#E8EDE6] p-5 mb-6 text-sm text-[#5A6B5D] font-medium leading-relaxed">
            <b className="text-[#2C3531]">What's next?</b> We'll reach out on WhatsApp to schedule your first monthly session.
          </div>
          <button onClick={() => sendWA(`Hello Vivify! 👑\n\nI just joined ${mDetails.plan}!\n\n👤 ${mDetails.name}\n📱 ${mDetails.phone}\n💆 ${mDetails.service} (${mDetails.duration})\n📍 ${mDetails.location}\n💰 ${fmt(mDetails.monthlyAmount)}/month\n🔗 ${mDetails.ref}\n\nPlease help me schedule my first session.`)} className="w-full py-4 rounded-2xl font-bold text-white mb-3 shadow-xl" style={{ background: "#25D366" }}>
            Send Details via WhatsApp
          </button>
          <button onClick={resetMembership} className="w-full py-4 rounded-2xl font-bold text-sm bg-white border border-[#E8EDE6] text-[#2C3531]">Done</button>
        </Modal>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// GIFT CARD
// ─────────────────────────────────────────────────────────────────────────────
const GiftCardSection = ({ sendEmail, showToast }) => {
  const [gSvcType, setGSvcType] = useState("studio");
  const [gSvc, setGSvc] = useState("");
  const [gDur, setGDur] = useState("");
  const [gCaption, setGCaption] = useState("");
  const [gBName, setGBName] = useState("");
  const [gBPhone, setGBPhone] = useState("");
  const [gBEmail, setGBEmail] = useState("");
  const [gRName, setGRName] = useState("");
  const [gRPhone, setGRPhone] = useState("");
  const [gREmail, setGREmail] = useState("");
  const [gBPhoneErr, setGBPhoneErr] = useState("");
  const [gRPhoneErr, setGRPhoneErr] = useState("");
  const [gLoading, setGLoading] = useState(false);
  const [gSuccess, setGSuccess] = useState(false);
  const [gDetails, setGDetails] = useState(null);

  const gPrice = () => getPrice(gSvcType, gSvc, gDur);
  const gDone = !!(gSvc && gSvcType && gDur && gBName && gBPhone && gBPhone.replace(/\D/g, "").length >= 11 && gBEmail && gRName && (gRPhone || gREmail));

  useEffect(() => {
    if (gSvc && gDur && !durList(gSvc).includes(Number(gDur))) setGDur("");
  }, [gSvc, gDur]);

  const handleGift = () => {
    if (!gDone) return showToast("Please complete all required fields.");
    setGLoading(true);
    const svcObj = SERVICES.find((s) => s.id === gSvc);
    const data = {
      buyerName: gBName, buyerPhone: gBPhone, buyerEmail: gBEmail,
      recipientName: gRName, recipientPhone: gRPhone, recipientEmail: gREmail,
      service: svcObj?.name, location: LOCATION_LABEL[gSvcType], duration: `${gDur} minutes`,
      caption: gCaption || "Wishing you pure relaxation 💆", amount: gPrice(),
    };
    paystackPay({
      amount: gPrice(), email: gBEmail,
      meta: [{ display_name: "Buyer", variable_name: "buyer", value: gBName }, { display_name: "Recipient", variable_name: "recipient", value: gRName }],
      onSuccess: async (res) => {
        const u = { ...data, ref: res.reference };
        await sendEmail("gift", u);
        setGDetails(u); setGLoading(false); setGSuccess(true);
      },
      onFailure: (msg) => { setGLoading(false); showToast(msg); },
    });
  };

  const resetGift = () => {
    setGSuccess(false); setGBName(""); setGBPhone(""); setGBEmail(""); setGRName(""); setGRPhone(""); setGREmail(""); setGSvc(""); setGDur(""); setGCaption(""); setGDetails(null);
  };

  return (
    <div className="max-w-3xl mx-auto pb-32 md:pb-12 animate-luxe">
      <div className="text-center mb-12 px-4">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-[#FDF4F2] text-[#C8795D]">
          <Gift className="w-3.5 h-3.5" /> The Art of Gifting
        </div>
        <h2 className="text-4xl sm:text-6xl font-medium text-[#2C3531] mb-6 leading-tight" style={{ fontFamily: "Cormorant Garamond" }}>
          Give the gift of <br />
          <span className="italic text-[#C8795D]">pure serenity.</span>
        </h2>
      </div>

      <div className="mb-10">
        <SubLabel>Live Preview</SubLabel>
        <div className="rounded-[2.5rem] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl" style={{ background: "linear-gradient(135deg,#C8795D,#9B5C4A,#7A4435)" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)" }} />
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[200px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#FDF4F2]" />
                <p className="font-medium text-xl tracking-wide" style={{ fontFamily: "Cormorant Garamond" }}>Vivify Massage & Spa</p>
              </div>
              <Gift className="w-6 h-6 text-[#FDF4F2] opacity-50" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-2 text-white/70">Prepared for</p>
              <p className="text-3xl font-bold mb-4" style={{ fontFamily: "Cormorant Garamond" }}>{gRName || "Their Name"}</p>
              <p className="text-sm italic mb-8 px-6 py-4 rounded-2xl bg-black/10 border-l-2 border-white/30 text-white/90">"{gCaption || "Wishing you pure relaxation 💆"}"</p>
            </div>
            <div className="flex justify-between items-end pt-6 border-t border-white/20">
              <div>
                <p className="text-xs text-white/70">{gSvc ? SERVICES.find((s) => s.id === gSvc)?.name : "Select a service"}</p>
                {gDur && <p className="text-xs mt-1 text-white/70">{gDur} minutes</p>}
                <p className="text-sm mt-2 text-white/90 font-medium">From: {gBName || "Your Name"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-white/70 mb-1">Value</p>
                <p className="text-4xl font-bold leading-none" style={{ fontFamily: "Cormorant Garamond" }}>{gPrice() ? fmt(gPrice()) : "₦—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FC>
        <SectionHeading number="01" title="Design the experience" hint="Select the details of your gift" />
        <div className="mb-8">
          <SubLabel>Location</SubLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[{ id: "studio", l: LOCATION_LABEL.studio }, { id: "mobile", l: LOCATION_LABEL.mobile }].map((o) => (
              <button key={o.id} onClick={() => setGSvcType(o.id)} className="p-5 rounded-2xl border-2 text-left transition-all duration-200" style={{ borderColor: gSvcType === o.id ? "#C8795D" : "#E8EDE6", background: gSvcType === o.id ? "#FDF4F2" : "white" }}>
                <span className="font-bold text-[#2C3531] text-sm">{o.l}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-8">
          <SubLabel>Ritual</SubLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SERVICES.map((svc) => (
              <button key={svc.id} onClick={() => setGSvc(svc.id)} className="p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all duration-200" style={{ borderColor: gSvc === svc.id ? "#C8795D" : "#E8EDE6", background: gSvc === svc.id ? "#FDF4F2" : "white" }}>
                <span className="text-2xl">{svc.icon}</span>
                <span className="font-bold text-[#2C3531] text-sm flex-1">{svc.name}</span>
                {gSvc === svc.id && <div className="w-6 h-6 rounded-full bg-[#C8795D] flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></div>}
              </button>
            ))}
          </div>
        </div>
        {gSvc && (
          <div className="mb-8 animate-luxe">
            <SubLabel>Duration</SubLabel>
            <div className="grid grid-cols-3 gap-3">
              {durList(gSvc).map((m) => (
                <button key={m} onClick={() => setGDur(m)} className="p-4 rounded-xl border-2 text-center transition-all duration-200" style={{ borderColor: gDur === m ? "#C8795D" : "#E8EDE6", background: gDur === m ? "#FDF4F2" : "white" }}>
                  <p className="font-bold text-[#2C3531] text-sm">{m} min</p>
                  <p className="text-sm font-bold text-[#C8795D] mt-1">{fmt(getPrice(gSvcType, gSvc, m))}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <SubLabel>Personal Message</SubLabel>
          <textarea value={gCaption} onChange={(e) => setGCaption(e.target.value)} rows={3} placeholder="Wishing you a year of calm and strength 💆" className="w-full p-5 rounded-xl text-sm font-medium resize-none border-2 border-[#E8EDE6] focus:border-[#C8795D] transition-all outline-none bg-white" />
          <p className="text-xs text-[#A3B19B] mt-3 font-medium">This message will be beautifully displayed on their digital gift card.</p>
        </div>
      </FC>

      <div className="mt-6">
        <FC>
          <SectionHeading number="02" title="Your Details" hint="So we can send your receipt" />
          <div className="space-y-5">
            <TF label="Full Name *" value={gBName} onChange={setGBName} placeholder="Your name" />
            <PF label="Phone *" value={gBPhone} error={gBPhoneErr} onChange={(v) => onPhone(v, setGBPhone, setGBPhoneErr)} />
            <div>
              <label className="block text-[10px] font-bold text-[#5A6B5D] mb-2 uppercase tracking-widest">Email Address *</label>
              <input type="email" value={gBEmail} onChange={(e) => setGBEmail(e.target.value)} placeholder="your@email.com" className="w-full p-5 rounded-xl text-sm font-medium border-2 transition-all duration-200 outline-none" style={{ borderColor: gBEmail ? "#C8795D" : "#E8EDE6", background: gBEmail ? "#FDF4F2" : "#FFF" }} />
            </div>
          </div>
        </FC>
      </div>

      <div className="mt-6">
        <FC>
          <SectionHeading number="03" title="The Recipient" hint="Provide at least one way to reach them" />
          <div className="space-y-5">
            <TF label="Recipient's Full Name *" value={gRName} onChange={setGRName} placeholder="Their name" />
            <PF label="Recipient's Phone" value={gRPhone} error={gRPhoneErr} onChange={(v) => onPhone(v, setGRPhone, setGRPhoneErr)} />
            <div>
              <label className="block text-[10px] font-bold text-[#5A6B5D] mb-2 uppercase tracking-widest">Recipient's Email</label>
              <input type="email" value={gREmail} onChange={(e) => setGREmail(e.target.value)} placeholder="recipient@email.com" className="w-full p-5 rounded-xl text-sm font-medium border-2 transition-all duration-200 outline-none" style={{ borderColor: gREmail ? "#C8795D" : "#E8EDE6", background: gREmail ? "#FDF4F2" : "#FFF" }} />
              <p className="text-xs text-[#A3B19B] mt-3 font-medium">If provided, we will email them a beautiful notification directly.</p>
            </div>
          </div>
        </FC>
      </div>

      <div className="mt-6">
        <FC>
          {gSvc && gPrice() > 0 && (
            <div className="rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FDF4F2] border border-[#E8C5BC] animate-luxe">
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C8795D] mb-1">Gift Value</p>
                <p className="text-sm text-[#5A6B5D] font-medium">{SERVICES.find((s) => s.id === gSvc)?.name} · {gDur} min</p>
              </div>
              <p className="text-4xl font-bold leading-none" style={{ fontFamily: "Cormorant Garamond", color: "#C8795D" }}>{fmt(gPrice())}</p>
            </div>
          )}
          <button onClick={handleGift} disabled={!gDone} className="w-full py-5 rounded-2xl font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-xl disabled:shadow-none" style={{ background: gDone ? "#C8795D" : "#E8EDE6", color: gDone ? "white" : "#A3B19B", cursor: gDone ? "pointer" : "not-allowed" }}>
            <Gift className="w-4 h-4" />
            {gPrice() > 0 ? `Purchase Gift — ${fmt(gPrice())}` : "Purchase Gift Card"}
          </button>
          <p className="text-xs text-center text-[#A3B19B] mt-5 font-medium flex items-center justify-center gap-1.5"><Shield className="w-3 h-3" /> Secure via Paystack</p>
        </FC>
      </div>

      {gLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C3531]/80 backdrop-blur-md animate-luxe">
          <div className="bg-[#FDF4F2] rounded-3xl p-10 text-center shadow-2xl mx-4 flex flex-col items-center max-w-sm w-full border border-[#E8C5BC]">
            <div className="w-16 h-16 rounded-full mb-6 animate-spin border-4 border-[#E8C5BC] border-t-[#C8795D]" />
            <h3 className="font-bold text-[#2C3531] text-2xl mb-2" style={{ fontFamily: "Cormorant Garamond" }}>Processing…</h3>
            <p className="text-sm text-[#5A6B5D]">Please wait.</p>
          </div>
        </div>
      )}

      {gSuccess && gDetails && (
        <Modal onClose={resetGift}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-[#FDF4F2] mx-auto flex items-center justify-center mb-5 animate-luxe">
              <Gift className="w-10 h-10 text-[#C8795D]" />
            </div>
            <h3 className="text-3xl font-bold text-[#2C3531] mb-2" style={{ fontFamily: "Cormorant Garamond" }}>Gift Sent Successfully</h3>
            <p className="text-sm text-[#5A6B5D] font-medium">Confirmation sent to <b>{gDetails.buyerEmail}</b>{gDetails.recipientEmail ? <> and <b>{gDetails.recipientEmail}</b></> : null}</p>
          </div>
          <div className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden shadow-xl" style={{ background: "linear-gradient(135deg,#C8795D,#9B5C4A)" }}>
            <p className="text-xl font-bold mb-1" style={{ fontFamily: "Cormorant Garamond" }}>For {gDetails.recipientName}</p>
            <p className="text-xs italic mb-4 text-white/80">"{gDetails.caption}"</p>
            <div className="flex justify-between items-end pt-4 border-t border-white/20">
              <div>
                <p className="text-xs text-white/80">{gDetails.service}</p>
                <p className="text-xs mt-1 text-white/90 font-medium">From {gDetails.buyerName}</p>
              </div>
              <p className="text-2xl font-bold" style={{ fontFamily: "Cormorant Garamond" }}>{fmt(gDetails.amount)}</p>
            </div>
          </div>
          <SBox rows={[["Ref", gDetails.ref], ["Recipient", gDetails.recipientName], ["Value", fmt(gDetails.amount)]]} hi="Value" />
          <div className="rounded-2xl bg-[#F9F6F0] border border-[#E8EDE6] p-5 mb-6 text-sm text-[#5A6B5D] font-medium leading-relaxed">
            <b className="text-[#2C3531]">What's next?</b> We'll reach out to {gDetails.recipientName} to arrange their session. You'll both get a confirmation.
          </div>
          <button onClick={() => sendWA(`Hello Vivify! 🎁\n\nGift card:\n👤 Buyer: ${gDetails.buyerName}\n🎁 Recipient: ${gDetails.recipientName}\n💆 ${gDetails.service}\n💰 ${fmt(gDetails.amount)}\n💬 "${gDetails.caption}"\n🔗 ${gDetails.ref}`)} className="w-full py-4 rounded-2xl font-bold text-white mb-3 shadow-xl" style={{ background: "#25D366" }}>
            Send Details via WhatsApp
          </button>
          <button onClick={resetGift} className="w-full py-4 rounded-2xl font-bold text-sm bg-white border border-[#E8EDE6] text-[#2C3531]">Done</button>
        </Modal>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
const VivifySpaWebsite = () => {
  const [activeTab, setActiveTab] = useState("booking");
  const [bookingCity, setBookingCity] = useState(null);
  const [preselectedService, setPreselectedService] = useState("");
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (window.PaystackPop) return;
    if (document.querySelector('script[src*="paystack"]')) return;
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    document.head.appendChild(s);
  }, []);

  const sendEmail = async (type, data) => {
    try {
      const resp = await fetch("/api/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, data }) });
      if (!resp.ok) throw new Error("Email API error");
    } catch (err) { console.error("Email sending failed:", err); }
  };

  const switchTab = (id) => {
    setActiveTab(id);
    if (id === "booking" && bookingCity === "ilorin") { }
    else if (id === "booking") { setBookingCity(null); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectService = (serviceId) => {
    setPreselectedService(serviceId);
    document.getElementById("wizard-start")?.scrollIntoView({ behavior: "smooth" });
  };

  const hideHero = activeTab === "sports" || activeTab === "giftcard";

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#2C3531]" style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <ToastComponent />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        input,textarea,select,button { outline:none; font-family:inherit }
        button { -webkit-tap-highlight-color:transparent }
        * { box-sizing:border-box }
        @media (max-width:768px){ input, textarea, select { font-size: 16px !important; } }
      `}</style>

      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-40 bg-[#F9F6F0]/90 backdrop-blur-xl border-b border-[#E8EDE6]">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center gap-8">
          <div className="flex items-center gap-4 flex-shrink-0 cursor-pointer" onClick={() => switchTab("booking")}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#4A5D4E] shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#2C3531] leading-tight" style={{ fontFamily: "Cormorant Garamond" }}>Vivify</h1>
              <p className="text-[9px] font-bold tracking-[0.2em] text-[#A3B19B] uppercase">Massage & Spa</p>
            </div>
          </div>
          <div className="flex-1" />
          <nav className="flex items-center gap-2">
            {TABS.map((t) => {
              const active = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => switchTab(t.id)} className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${active ? "bg-[#4A5D4E] text-white shadow-lg" : "text-[#5A6B5D] hover:bg-[#E8EDE6]"}`}>
                  <span className="opacity-70">{t.icon}</span>{t.full}
                </button>
              );
            })}
          </nav>
          <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold px-6 py-2.5 rounded-full bg-white border border-[#E8EDE6] text-[#4A5D4E] hover:bg-[#F9F6F0] transition-colors shadow-sm">
            Contact Concierge
          </a>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-[#F9F6F0]/90 backdrop-blur-xl border-b border-[#E8EDE6]">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#4A5D4E]">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#2C3531] leading-tight" style={{ fontFamily: "Cormorant Garamond" }}>Vivify</h1>
              <p className="text-[8px] font-bold tracking-[0.2em] text-[#A3B19B] uppercase -mt-0.5">Massage & Spa</p>
            </div>
          </div>
          <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold px-4 py-2 rounded-full bg-[#E8EDE6] text-[#4A5D4E]">
            Help
          </a>
        </div>
      </header>

      {/* Hero Section */}
      {!hideHero && (
        <section className="pt-16 pb-24 sm:pt-24 sm:pb-32 px-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#E8EDE6] rounded-full blur-3xl opacity-40 -z-10" />
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 text-[10px] font-bold tracking-[0.2em] uppercase bg-white text-[#4A5D4E] border border-[#E8EDE6] shadow-sm">
            <Star className="w-3 h-3" fill="currentColor" /> The Art of Wellness
          </div>
          <h2 className="text-5xl sm:text-7xl lg:text-8xl font-medium text-[#2C3531] mb-8 leading-[1.1]" style={{ fontFamily: "Cormorant Garamond" }}>
            Relax. Restore. <br />
            <span className="italic text-[#C8795D]">Renew.</span>
          </h2>
          <p className="text-lg sm:text-xl max-w-xl mx-auto text-[#5A6B5D] font-light leading-relaxed">
            Step into a sanctuary of calm. Expert massage therapy, curated just for you — at our studio or your doorstep.
          </p>
        </section>
      )}

      {/* Main Content */}
      <div id="main" className="min-h-screen">
        {activeTab === "booking" && (
          <div className="px-4 sm:px-6">
            {!bookingCity && <LocationGate onSelectCity={setBookingCity} />}

            {bookingCity === "ilorin" && (
              <div className="animate-luxe duration-700">
                <div className="flex justify-center mb-8">
                  <button onClick={() => setBookingCity(null)} className="text-xs font-bold uppercase tracking-widest text-[#A3B19B] hover:text-[#4A5D4E] transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-3 h-3" /> Change Location
                  </button>
                </div>

                <MassageGuide onSelectService={handleSelectService} />

                <div id="wizard-start" className="py-12 bg-white/50 border-t border-[#E8EDE6]">
                  <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center mb-8">
                    <h3 className="text-3xl font-medium text-[#2C3531]" style={{ fontFamily: "Cormorant Garamond" }}>Configure Your Session</h3>
                    <p className="text-[#5A6B5D] mt-2">Select your preferences below to lock in your appointment.</p>
                  </div>
                  <BookingWizard initialService={preselectedService} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "sports" && <SportsMassage showToast={showToast} />}

        {activeTab === "membership" && (
          <div className="px-4 sm:px-6 pt-12">
            <MembershipSection sendEmail={sendEmail} showToast={showToast} />
          </div>
        )}

        {activeTab === "giftcard" && (
          <div className="px-4 sm:px-6 pt-12">
            <GiftCardSection sendEmail={sendEmail} showToast={showToast} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="pt-20 pb-32 md:pb-12 bg-white border-t border-[#E8EDE6] mt-20">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#4A5D4E]"><Sparkles className="w-5 h-5 text-white" /></div>
              <h4 className="text-2xl font-bold text-[#2C3531]" style={{ fontFamily: "Cormorant Garamond" }}>Vivify Massage & Spa</h4>
            </div>
            <p className="text-[#5A6B5D] font-light max-w-sm leading-relaxed">
              Your sanctuary for relaxation and rejuvenation. We bring the spa experience to you, or welcome you to our private studio.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-[#2C3531] uppercase tracking-[0.2em] mb-6">Contact Us</h4>
            <div className="space-y-4 text-sm font-light text-[#5A6B5D]">
              <div className="flex items-start gap-3"><Phone className="w-4 h-4 mt-0.5 text-[#C8795D] flex-shrink-0" /><div><p className="font-bold text-[#2C3531]">07040723894</p><p>Available for bookings</p></div></div>
              <div className="flex items-start gap-3"><MapPin className="w-4 h-4 mt-0.5 text-[#C8795D] flex-shrink-0" /><div><p className="font-bold text-[#2C3531]">Our Studio</p><p>Ewa Block Industry, Alao Farm, Tanke Akata, Ilorin.</p></div></div>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-[#2C3531] uppercase tracking-[0.2em] mb-6">Hours</h4>
            <div className="space-y-3 text-sm font-light text-[#5A6B5D]">
              <div className="flex justify-between border-b border-[#F4F1E9] pb-2"><span>Studio</span><span className="font-bold text-[#2C3531]">9 AM – 6 PM</span></div>
              <div className="flex justify-between border-b border-[#F4F1E9] pb-2"><span>Mobile</span><span className="font-bold text-[#2C3531]">7 AM – 12 AM</span></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 pt-8 border-t border-[#F4F1E9] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#A3B19B]">
          <p>© 2026 Vivify Massage & Spa. All rights reserved.</p>
          <p className="flex items-center gap-2"><Shield className="w-3 h-3" /> Secure Payments via Paystack</p>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-[#E8EDE6] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="grid grid-cols-4 px-2 py-3">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => switchTab(t.id)} className={`py-2 flex flex-col items-center gap-1.5 transition-all duration-300 relative rounded-2xl ${active ? "bg-[#F9F6F0]" : ""}`}>
                <span className={`text-xl transition-transform duration-300 ${active ? "scale-110 text-[#4A5D4E]" : "scale-100 text-[#A3B19B]"}`}>{t.icon}</span>
                <span className={`text-[9px] font-bold tracking-widest uppercase ${active ? "text-[#4A5D4E]" : "text-[#A3B19B]"}`}>{t.short}</span>
                {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#4A5D4E] rounded-full" />}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default VivifySpaWebsite;