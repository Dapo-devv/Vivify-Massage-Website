import React, { useState, useEffect } from "react";
import { Phone, MapPin, Sparkles, Shield, Star, Gift, Crown, Check, ArrowLeft, Repeat, Pause, AlertCircle } from "lucide-react";
import { SERVICES, MEMBERSHIP_PLAN, fmt, disc10, getPrice, durList, LOCATION_LABEL } from "./config/services";
import { Tick, TF, PF, Modal } from "./components/ui";
import LocationGate from "./components/LocationGate";
import MassageGuide from "./components/MassageGuide";
import BookingWizard from "./components/BookingWizard";
import SportsMassage from "./components/SportsMassage";

const PAYSTACK_KEY = "pk_live_915663b76742c16f999c99e6251596ee7c5c9584";
const WA_NUMBER = "2347040723894";

const TABS = [
  { id: "booking", icon: "📅", short: "Book", full: "Book Session" },
  { id: "sports", icon: "🏃", short: "Sports", full: "Sports Massage" },
  { id: "membership", icon: "👑", short: "Member", full: "Membership" },
  { id: "giftcard", icon: "🎁", short: "Gift", full: "Gift Card" },
];

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
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-toast w-[90%] max-w-sm">
        <div className={`p-4 rounded-2xl shadow-2xl flex items-start gap-3 border-2 ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
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

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI
// ─────────────────────────────────────────────────────────────────────────────
const FC = ({ children }) => (
  <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-teal-900/10 border border-gray-100">{children}</div>
);
const SBox = ({ rows, hi }) => (
  <div className="rounded-2xl p-5 mb-5 space-y-3 bg-teal-50/50 border border-teal-100">
    {rows.map(([l, v]) => (
      <div key={l} className="flex justify-between text-sm items-center">
        <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{l}</span>
        <span className={`font-bold text-right max-w-[60%] truncate ${l === hi ? "text-lg text-teal-600" : "text-gray-900"}`} style={l === hi ? { fontFamily: "Cormorant Garamond" } : {}}>{v}</span>
      </div>
    ))}
  </div>
);
const SectionHeading = ({ number, title, hint }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3 mb-1">
      <span className="text-xs font-black tracking-widest text-pink-500 bg-pink-50 px-2 py-1 rounded-md">{number}</span>
      <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">{title}</span>
    </div>
    {hint && <p className="text-xs text-gray-400 font-medium">{hint}</p>}
  </div>
);
const SubLabel = ({ children }) => (
  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{children}</p>
);

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERSHIP
// ─────────────────────────────────────────────────────────────────────────────
const MembershipSection = ({ sendEmail, showToast }) => {
  const plan = MEMBERSHIP_PLAN;
  const [mSvcType, setMSvcType] = useState("studio");
  const [mSvc, setMSvc] = useState("");
  const [mDur, setMDur] = useState("");
  const [mName, setMName] = useState("");
  const [mPhone, setMPhone] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mPhoneErr, setMPhoneErr] = useState("");
  const [mLoading, setMLoading] = useState(false);
  const [mSuccess, setMSuccess] = useState(false);
  const [mDetails, setMDetails] = useState(null);

  const mBase = () => getPrice(mSvcType, mSvc, mDur);
  const mTotal = () => disc10(mBase());
  const mSaved = () => mBase() - mTotal();
  const mDone = !!(mSvc && mSvcType && mName && mPhone && mPhone.replace(/\D/g, "").length >= 11 && mEmail && mDur);

  useEffect(() => { if (mSvc && mDur && !durList(mSvc).includes(Number(mDur))) setMDur(""); }, [mSvc, mDur]);

  const handleMembership = () => {
    if (!mDone) return showToast("Please complete all fields.");
    setMLoading(true);
    const svcObj = SERVICES.find((s) => s.id === mSvc);
    const data = { name: mName, phone: mPhone, email: mEmail, plan: plan.name, service: svcObj?.name, location: LOCATION_LABEL[mSvcType], duration: `${mDur} minutes`, sessions: plan.sessions, normalPrice: mBase(), discountedPerSession: mTotal(), monthlyAmount: mTotal(), savedPerMonth: mSaved() };
    paystackPay({
      amount: mTotal(), email: mEmail,
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
    <div className="max-w-2xl mx-auto pb-32 md:pb-8">
      <div className="text-center mb-10 px-4">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold tracking-widest uppercase bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 backdrop-blur-md">
          <Crown className="w-3.5 h-3.5" /> Monthly Wellness Membership
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "Cormorant Garamond" }}>
          One massage a month.<br /><span className="text-yellow-300">Every month.</span>
        </h2>
        <p className="text-teal-100 text-sm max-w-md mx-auto leading-relaxed font-medium">A simple way to keep your body happy. Book your monthly session whenever it suits you — we'll always have a slot for you.</p>
      </div>

      <div className="rounded-[2rem] overflow-hidden mb-8 shadow-2xl border-2 border-yellow-200/50 bg-white">
        <div className="px-8 py-6 bg-gradient-to-r from-teal-600 to-teal-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md">{plan.icon}</div>
              <div>
                <p className="font-bold text-white text-2xl leading-tight" style={{ fontFamily: "Cormorant Garamond" }}>{plan.name}</p>
                <p className="text-xs text-teal-100 mt-1 font-medium">{plan.tagline}</p>
              </div>
            </div>
            <span className="text-xs font-black px-4 py-1.5 rounded-full bg-yellow-400 text-yellow-900 shadow-md">SAVE 10%</span>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8">
          <ul className="space-y-4 mb-8">
            {plan.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl bg-teal-50 border border-teal-100">{b.icon}</div>
                <p className="text-sm text-gray-700 leading-relaxed pt-2.5 font-medium">{b.text}</p>
              </li>
            ))}
          </ul>

          <div className="space-y-6 pt-8 border-t border-gray-100">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Location</p>
              <div className="grid grid-cols-2 gap-3">
                {[{ id: "studio", l: LOCATION_LABEL.studio, s: "Pay online" }, { id: "mobile", l: LOCATION_LABEL.mobile, s: "Pay online too" }].map((o) => (
                  <button key={o.id} onClick={() => setMSvcType(o.id)} className="p-4 rounded-2xl border-2 text-left transition-all duration-200" style={{ borderColor: mSvcType === o.id ? "#14b8a6" : "#e5e7eb", background: mSvcType === o.id ? "#f0fdfa" : "white" }}>
                    <p className="font-bold text-gray-900 text-sm">{o.l}</p>
                    <p className={`text-xs mt-1 font-bold ${mSvcType === o.id ? "text-teal-600" : "text-gray-400"}`}>{o.s}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Your monthly massage</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SERVICES.map((svc) => (
                  <button key={svc.id} onClick={() => setMSvc(svc.id)} className="p-3 rounded-xl border-2 flex items-center gap-3 text-left transition-all duration-200" style={{ borderColor: mSvc === svc.id ? "#14b8a6" : "#e5e7eb", background: mSvc === svc.id ? "#f0fdfa" : "white" }}>
                    <span className="text-2xl">{svc.icon}</span>
                    <span className="font-bold text-gray-900 text-sm flex-1">{svc.name}</span>
                    {mSvc === svc.id && <Tick />}
                  </button>
                ))}
              </div>
            </div>

            {mSvc && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Session length</p>
                <div className="grid grid-cols-3 gap-2">
                  {durList(mSvc).map((m) => {
                    const base = getPrice(mSvcType, mSvc, m); const dp = disc10(base); const sel = mDur === m;
                    return (
                      <button key={m} onClick={() => setMDur(m)} className="p-3 rounded-xl border-2 text-center transition-all duration-200" style={{ borderColor: sel ? "#14b8a6" : "#e5e7eb", background: sel ? "#f0fdfa" : "white" }}>
                        <p className={`font-bold text-sm ${sel ? "text-teal-700" : "text-gray-700"}`}>{m} min</p>
                        <p className="text-xs text-gray-400 line-through mt-1">{fmt(base)}</p>
                        <p className="text-sm font-bold text-teal-600">{fmt(dp)}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mSvc && mDur && (
              <div className="rounded-2xl p-5 flex items-center justify-between gap-3 bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-100 animate-in fade-in">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-0.5">Your monthly fee</p>
                  <p className="text-xs text-teal-600 font-medium">Billed monthly · cancel anytime</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold leading-none text-teal-700" style={{ fontFamily: "Cormorant Garamond" }}>{fmt(mTotal())}</p>
                  <p className="text-xs text-emerald-600 font-bold mt-1">You save {fmt(mSaved())}/mo</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Your details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <TF label="Full Name *" value={mName} onChange={setMName} placeholder="Your name" />
              <PF label="Phone *" value={mPhone} error={mPhoneErr} onChange={(v) => onPhone(v, setMPhone, setMPhoneErr)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Email *</label>
              <input type="email" value={mEmail} onChange={(e) => setMEmail(e.target.value)} placeholder="your@email.com" className="w-full p-4 rounded-xl text-sm font-medium border-2 transition-all duration-200 outline-none" style={{ borderColor: mEmail ? "#14b8a6" : "#e5e7eb", background: mEmail ? "#f0fdfa" : "#f9fafb" }} />
            </div>
          </div>

          <button onClick={handleMembership} disabled={!mDone} className="w-full mt-8 py-4 rounded-2xl font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:shadow-none" style={{ background: mDone ? "linear-gradient(135deg,#0d9488,#14b8a6)" : "#d1d5db", cursor: mDone ? "pointer" : "not-allowed" }}>
            <Crown className="w-4 h-4" />
            {mSvc && mDur ? `Start Membership — ${fmt(mTotal())}/mo` : "Start Membership"}
          </button>
          <p className="text-xs text-center text-gray-400 mt-4 font-medium">🔒 Secure via Paystack · 256-bit SSL · Cancel anytime</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{ icon: Repeat, l: "Auto-renews", s: "Monthly" }, { icon: Pause, l: "Pause anytime", s: "No penalty" }, { icon: Shield, l: "Secure billing", s: "Paystack" }].map(({ icon: Icon, l, s }) => (
          <div key={l} className="rounded-2xl p-4 text-center bg-white/5 border border-white/10 backdrop-blur-md">
            <Icon className="w-5 h-5 mx-auto mb-2 text-teal-300" />
            <p className="text-xs font-bold text-white">{l}</p>
            <p className="text-[10px] text-teal-200 mt-1 uppercase tracking-wider">{s}</p>
          </div>
        ))}
      </div>

      {mLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl mx-4 flex flex-col items-center max-w-sm w-full">
            <div className="w-16 h-16 rounded-full mb-5 animate-spin border-4 border-teal-100 border-t-teal-500" />
            <h3 className="font-bold text-gray-900 text-xl mb-1" style={{ fontFamily: "Cormorant Garamond" }}>Processing…</h3>
            <p className="text-sm text-gray-500">Please wait.</p>
          </div>
        </div>
      )}

      {mSuccess && mDetails && (
        <Modal onClose={resetMembership}>
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-yellow-100 mx-auto flex items-center justify-center mb-4 animate-in zoom-in">
              <Crown className="w-10 h-10 text-yellow-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: "Cormorant Garamond" }}>Welcome, Member!</h3>
            <p className="text-sm text-gray-500 font-medium">Confirmation sent to <b>{mDetails.email}</b></p>
          </div>
          <SBox rows={[["Member", mDetails.name], ["Plan", mDetails.plan], ["Monthly massage", mDetails.service], ["Session", mDetails.duration], ["Location", mDetails.location], ["Monthly", fmt(mDetails.monthlyAmount)], ["You save", fmt(mDetails.savedPerMonth)], ["Ref", mDetails.ref]]} hi="Monthly" />
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-5 text-sm text-amber-800 font-medium leading-relaxed">
            <b>What's next?</b> We'll reach out on WhatsApp to schedule your first monthly session.
          </div>
          <button onClick={() => sendWA(`Hello Vivify! 👑\n\nI just joined ${mDetails.plan}!\n\n👤 ${mDetails.name}\n📱 ${mDetails.phone}\n💆 ${mDetails.service} (${mDetails.duration})\n📍 ${mDetails.location}\n💰 ${fmt(mDetails.monthlyAmount)}/month\n🔗 ${mDetails.ref}\n\nPlease help me schedule my first session.`)} className="w-full py-4 rounded-xl font-bold text-white mb-3 shadow-lg shadow-green-500/30" style={{ background: "#25D366" }}>
            💬 Send Details via WhatsApp
          </button>
          <button onClick={resetMembership} className="w-full py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-700">Done</button>
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
    <div className="max-w-2xl mx-auto pb-32 md:pb-8">
      <div className="text-center mb-10 px-4">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold tracking-widest uppercase bg-pink-500/20 text-pink-300 border border-pink-500/30 backdrop-blur-md">
          <Gift className="w-3.5 h-3.5" /> Spa Gift Card
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "Cormorant Garamond" }}>
          Give the Gift<br /><span className="text-pink-300">of Wellness.</span>
        </h2>
        <p className="text-teal-100 text-sm max-w-md mx-auto leading-relaxed font-medium">A beautiful, personalised gift. We'll reach out to both of you to arrange the session.</p>
      </div>

      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-teal-200 mb-3 px-1">Live preview</p>
        <div className="rounded-[2rem] p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl" style={{ background: "linear-gradient(135deg,#db2777,#9d174d,#831843)" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: -60, left: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,0.08) 0%,transparent 70%)" }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Sparkles className="w-4 h-4 text-pink-100" />
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight" style={{ fontFamily: "Cormorant Garamond" }}>Vivify Massage & Spa</p>
                  <p className="text-xs leading-tight" style={{ color: "#fbcfe8" }}>Gift Card</p>
                </div>
              </div>
              <Gift className="w-5 h-5 text-pink-200" />
            </div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#fbcfe8" }}>A gift for</p>
            <p className="text-2xl sm:text-3xl font-bold mb-1" style={{ fontFamily: "Cormorant Garamond" }}>{gRName || "Their Name"}</p>
            <p className="text-sm italic mb-6 mt-3 px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)", color: "#fce7f3", borderLeft: "3px solid #f9a8d4" }}>
              "{gCaption || "Wishing you pure relaxation 💆"}"
            </p>
            <div className="flex justify-between items-end pt-4 border-t border-white/20">
              <div>
                <p className="text-xs" style={{ color: "#fbcfe8" }}>{gSvc ? SERVICES.find((s) => s.id === gSvc)?.name : "Select a service"}</p>
                {gDur && <p className="text-xs mt-0.5" style={{ color: "#fbcfe8" }}>{gDur} minutes · {gSvcType === "studio" ? "Our Home Studio" : "Your Home or Hotel"}</p>}
                <p className="text-xs mt-1" style={{ color: "#f9a8d4" }}>From {gBName || "Your Name"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider" style={{ color: "#fbcfe8" }}>Value</p>
                <p className="text-3xl sm:text-4xl font-bold leading-none" style={{ fontFamily: "Cormorant Garamond" }}>{gPrice() ? fmt(gPrice()) : "₦—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FC>
        <SectionHeading number="01" title="Design the gift" hint="Choose the treatment you'd like to give" />
        <div className="mb-6">
          <SubLabel>Location</SubLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[{ id: "studio", l: LOCATION_LABEL.studio }, { id: "mobile", l: LOCATION_LABEL.mobile }].map((o) => (
              <button key={o.id} onClick={() => setGSvcType(o.id)} className="p-4 rounded-2xl border-2 text-left transition-all duration-200" style={{ borderColor: gSvcType === o.id ? "#db2777" : "#e5e7eb", background: gSvcType === o.id ? "#fdf2f8" : "white" }}>
                <span className="font-bold text-gray-900 text-sm">{o.l}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <SubLabel>Massage</SubLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SERVICES.map((svc) => (
              <button key={svc.id} onClick={() => setGSvc(svc.id)} className="p-3 rounded-xl border-2 flex items-center gap-3 text-left transition-all duration-200" style={{ borderColor: gSvc === svc.id ? "#db2777" : "#e5e7eb", background: gSvc === svc.id ? "#fdf2f8" : "white" }}>
                <span className="text-2xl">{svc.icon}</span>
                <span className="font-bold text-gray-900 text-sm flex-1">{svc.name}</span>
                {gSvc === svc.id && <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></div>}
              </button>
            ))}
          </div>
        </div>
        {gSvc && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2">
            <SubLabel>Duration</SubLabel>
            <div className="grid grid-cols-3 gap-2">
              {durList(gSvc).map((m) => (
                <button key={m} onClick={() => setGDur(m)} className="p-3 rounded-xl border-2 text-center transition-all duration-200" style={{ borderColor: gDur === m ? "#db2777" : "#e5e7eb", background: gDur === m ? "#fdf2f8" : "white" }}>
                  <p className="font-bold text-gray-900 text-sm">{m} min</p>
                  <p className="text-sm font-bold text-pink-600 mt-1">{fmt(getPrice(gSvcType, gSvc, m))}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <SubLabel>Personal message</SubLabel>
          <textarea value={gCaption} onChange={(e) => setGCaption(e.target.value)} rows={3} placeholder="Wishing you a year of calm and strength 💆" className="w-full p-4 rounded-xl text-sm font-medium resize-none border-2 border-gray-200 focus:border-pink-400 transition-all outline-none bg-gray-50/50" />
          <p className="text-xs text-gray-400 mt-2 font-medium">This message appears on the gift card the recipient receives.</p>
        </div>
      </FC>

      <div className="mt-5">
        <FC>
          <SectionHeading number="02" title="Your details" hint="So we can send you the receipt" />
          <div className="space-y-4">
            <TF label="Full Name *" value={gBName} onChange={setGBName} placeholder="Your name" />
            <PF label="Phone *" value={gBPhone} error={gBPhoneErr} onChange={(v) => onPhone(v, setGBPhone, setGBPhoneErr)} />
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Email *</label>
              <input type="email" value={gBEmail} onChange={(e) => setGBEmail(e.target.value)} placeholder="your@email.com" className="w-full p-4 rounded-xl text-sm font-medium border-2 transition-all duration-200 outline-none" style={{ borderColor: gBEmail ? "#db2777" : "#e5e7eb", background: gBEmail ? "#fdf2f8" : "#f9fafb" }} />
            </div>
          </div>
        </FC>
      </div>

      <div className="mt-5">
        <FC>
          <SectionHeading number="03" title="Who's receiving it?" hint="Provide at least one way for us to reach them" />
          <div className="space-y-4">
            <TF label="Recipient's Full Name *" value={gRName} onChange={setGRName} placeholder="Their name" />
            <PF label="Recipient's Phone" value={gRPhone} error={gRPhoneErr} onChange={(v) => onPhone(v, setGRPhone, setGRPhoneErr)} />
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">Recipient's Email</label>
              <input type="email" value={gREmail} onChange={(e) => setGREmail(e.target.value)} placeholder="recipient@email.com" className="w-full p-4 rounded-xl text-sm font-medium border-2 transition-all duration-200 outline-none" style={{ borderColor: gREmail ? "#db2777" : "#e5e7eb", background: gREmail ? "#fdf2f8" : "#f9fafb" }} />
              <p className="text-xs text-gray-400 mt-2 font-medium">If you provide their email, we'll send them a beautiful gift notification directly.</p>
            </div>
          </div>
        </FC>
      </div>

      <div className="mt-5">
        <FC>
          {gSvc && gPrice() > 0 && (
            <div className="rounded-2xl p-5 mb-6 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#fdf2f8,#fce7f3)", border: "2px solid #fbcfe8" }}>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-pink-700 mb-0.5">Gift value</p>
                <p className="text-sm text-gray-700 font-medium">{SERVICES.find((s) => s.id === gSvc)?.name} · {gDur} min</p>
              </div>
              <p className="text-3xl font-bold leading-none" style={{ fontFamily: "Cormorant Garamond", color: "#db2777" }}>{fmt(gPrice())}</p>
            </div>
          )}
          <button onClick={handleGift} disabled={!gDone} className="w-full py-4 rounded-2xl font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:shadow-none" style={{ background: gDone ? "linear-gradient(135deg,#db2777,#ec4899)" : "#d1d5db", cursor: gDone ? "pointer" : "not-allowed" }}>
            <Gift className="w-4 h-4" />
            {gPrice() > 0 ? `Purchase Gift Card — ${fmt(gPrice())}` : "Purchase Gift Card"}
          </button>
          <p className="text-xs text-center text-gray-400 mt-4 font-medium">🔒 Secure via Paystack · Confirmation emails to you{gREmail ? " and the recipient" : ""}</p>
        </FC>
      </div>

      {gLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl mx-4 flex flex-col items-center max-w-sm w-full">
            <div className="w-16 h-16 rounded-full mb-5 animate-spin border-4 border-pink-100 border-t-pink-500" />
            <h3 className="font-bold text-gray-900 text-xl mb-1" style={{ fontFamily: "Cormorant Garamond" }}>Processing…</h3>
            <p className="text-sm text-gray-500">Please wait.</p>
          </div>
        </div>
      )}

      {gSuccess && gDetails && (
        <Modal onClose={resetGift}>
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-pink-100 mx-auto flex items-center justify-center mb-4 animate-in zoom-in">
              <Gift className="w-10 h-10 text-pink-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: "Cormorant Garamond" }}>Gift Card Sent! 🎁</h3>
            <p className="text-sm text-gray-500 font-medium">Confirmation sent to <b>{gDetails.buyerEmail}</b>{gDetails.recipientEmail ? <> and <b>{gDetails.recipientEmail}</b></> : null}</p>
          </div>
          <div className="rounded-2xl p-5 mb-5 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg,#db2777,#9d174d)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-pink-200" />
              <span className="font-bold text-sm" style={{ fontFamily: "Cormorant Garamond" }}>Vivify Massage & Spa</span>
            </div>
            <p className="text-lg font-bold mb-1" style={{ fontFamily: "Cormorant Garamond" }}>For {gDetails.recipientName}</p>
            <p className="text-xs italic mb-3" style={{ color: "#fbcfe8" }}>"{gDetails.caption}"</p>
            <div className="flex justify-between items-end pt-3 border-t border-white/20">
              <div>
                <p className="text-xs" style={{ color: "#fbcfe8" }}>{gDetails.service}</p>
                <p className="text-xs" style={{ color: "#f9a8d4" }}>From {gDetails.buyerName}</p>
              </div>
              <p className="text-2xl font-bold" style={{ fontFamily: "Cormorant Garamond" }}>{fmt(gDetails.amount)}</p>
            </div>
          </div>
          <SBox rows={[["Ref", gDetails.ref], ["Recipient", gDetails.recipientName], ["Value", fmt(gDetails.amount)]]} hi="Value" />
          <div className="rounded-xl bg-pink-50 border border-pink-200 p-4 mb-5 text-sm text-pink-800 font-medium leading-relaxed">
            <b>What's next?</b> We'll reach out to {gDetails.recipientName} to arrange their session. You'll both get an email confirmation.
          </div>
          <button onClick={() => sendWA(`Hello Vivify! 🎁\n\nGift card:\n👤 Buyer: ${gDetails.buyerName}\n🎁 Recipient: ${gDetails.recipientName}\n💆 ${gDetails.service}\n💰 ${fmt(gDetails.amount)}\n💬 "${gDetails.caption}"\n🔗 ${gDetails.ref}`)} className="w-full py-4 rounded-xl font-bold text-white mb-3 shadow-lg shadow-green-500/30" style={{ background: "#25D366" }}>
            💬 Send Details via WhatsApp
          </button>
          <button onClick={resetGift} className="w-full py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-700">Done</button>
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
    if (id === "booking" && bookingCity === "ilorin") { /* Keep ilorin state */ }
    else if (id === "booking") { setBookingCity(null); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectService = (serviceId) => {
    setPreselectedService(serviceId);
    document.getElementById("wizard-start")?.scrollIntoView({ behavior: "smooth" });
  };

  const hideHero = activeTab === "sports" || (activeTab === "booking" && !bookingCity);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#0f172a 0%,#0f766e 50%,#042f2e 100%)", backgroundAttachment: "fixed", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <ToastComponent />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@500;600;700&display=swap');
        input,textarea,select,button { outline:none; font-family:inherit }
        button { -webkit-tap-highlight-color:transparent }
        * { box-sizing:border-box }
        @media (max-width:768px){ input, textarea, select { font-size: 16px !important; } }
      `}</style>

      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight" style={{ fontFamily: "Cormorant Garamond" }}>Vivify Massage & Spa</h1>
              <p className="text-[10px] font-bold tracking-widest text-teal-300 uppercase">Relax · Restore · Renew</p>
            </div>
          </div>
          <div className="flex-1" />
          <nav className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10">
            {TABS.map((t) => {
              const active = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => switchTab(t.id)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${active ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                  <span>{t.icon}</span>{t.full}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-400 to-teal-600 shadow-md shadow-teal-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight" style={{ fontFamily: "Cormorant Garamond" }}>Vivify</h1>
              <p className="text-[10px] font-bold tracking-widest text-teal-300 uppercase -mt-0.5">Massage & Spa</p>
            </div>
          </div>
          <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold px-4 py-2 rounded-xl bg-white/10 text-white border border-white/10 backdrop-blur-md">
            💬 Help
          </a>
        </div>
      </header>

      {!hideHero && (
        <section className="py-12 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-200 via-transparent to-transparent" />
          <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-white/10 text-teal-200 border border-white/20 backdrop-blur-md">
              <Star className="w-3.5 h-3.5" fill="currentColor" /> Where Recovery Meets Convenience
            </div>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.05]" style={{ fontFamily: "Cormorant Garamond" }}>
              Relax. Restore.<br /><span className="text-teal-400">Renew.</span>
            </h2>
            <p className="text-base sm:text-lg max-w-md mx-auto px-4 text-teal-100 font-medium">Expert massage therapy — at our studio or your doorstep.</p>
          </div>
        </section>
      )}

      <div id="main" className="min-h-screen">
        {activeTab === "booking" && (
          <div className="px-4 sm:px-6">
            {!bookingCity && <LocationGate onSelectCity={setBookingCity} />}
            {bookingCity === "ilorin" && (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-center mb-6">
                  <button onClick={() => setBookingCity(null)} className="text-xs font-bold uppercase tracking-widest text-teal-300 hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <ArrowLeft className="w-3 h-3" /> Change Location
                  </button>
                </div>
                <MassageGuide onSelectService={handleSelectService} />
                <div id="wizard-start">
                  <BookingWizard initialService={preselectedService} />
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "sports" && <SportsMassage />}
        {activeTab === "membership" && (
          <div className="px-4 sm:px-6 pt-8">
            <MembershipSection sendEmail={sendEmail} showToast={showToast} />
          </div>
        )}
        {activeTab === "giftcard" && (
          <div className="px-4 sm:px-6 pt-8">
            <GiftCardSection sendEmail={sendEmail} showToast={showToast} />
          </div>
        )}
      </div>

      <footer className="py-12 pb-32 md:pb-12 bg-slate-950 text-gray-500 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-400 to-teal-600"><Sparkles className="w-5 h-5 text-white" /></div>
              <h4 className="text-xl font-bold text-white" style={{ fontFamily: "Cormorant Garamond" }}>Vivify Massage & Spa</h4>
            </div>
            <p className="text-sm font-medium">Your sanctuary for relaxation and rejuvenation.</p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Contact</h4>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex items-start gap-3"><Phone className="w-4 h-4 mt-0.5 text-teal-400 flex-shrink-0" /><div><p className="font-bold text-white">07040723894</p><p>Available for bookings</p></div></div>
              <div className="flex items-start gap-3"><MapPin className="w-4 h-4 mt-0.5 text-teal-400 flex-shrink-0" /><div><p className="font-bold text-white">Studio</p><p>Ewa Block Industry, Alao Farm, Tanke Akata.</p></div></div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Hours</h4>
            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between border-b border-white/10 pb-2"><span>Studio</span><span className="font-bold text-white">9 AM – 6 PM</span></div>
              <div className="flex justify-between border-b border-white/10 pb-2"><span>Mobile</span><span className="font-bold text-white">7 AM – 12 AM</span></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
          <p>© 2026 Vivify Massage & Spa. All rights reserved.</p>
          <p>Secure Payments via Paystack</p>
        </div>
      </footer>

      {/* UPGRADED MOBILE BOTTOM NAV (Glassmorphism) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/85 backdrop-blur-2xl border-t border-white/10" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="grid grid-cols-4 px-2 py-2">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => switchTab(t.id)} className={`py-2 flex flex-col items-center gap-1 transition-all duration-300 relative rounded-xl ${active ? "bg-white/10" : "hover:bg-white/5"}`}>
                {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-teal-400" />}
                <span className={`text-xl transition-transform duration-300 ${active ? "scale-110" : "scale-100 grayscale opacity-70"}`}>{t.icon}</span>
                <span className={`text-[10px] font-bold tracking-wider uppercase ${active ? "text-teal-300" : "text-gray-400"}`}>{t.short}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default VivifySpaWebsite;