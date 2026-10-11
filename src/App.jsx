import React, { useState, useEffect } from "react";
import {
  Phone,
  MapPin,
  Sparkles,
  Home,
  Building2,
  User,
  Shield,
  Star,
  Gift,
  Crown,
  Calendar,
} from "lucide-react";

import {
  PRICING,
  SERVICES,
  MEM_PLANS,
  fmt,
  disc10,
  getPrice,
  durList,
} from "./config/services";

import { Tick, IB, TF, PF, SC, Modal, Btn } from "./components/ui";

import BookingWizard from "./components/BookingWizard";
import SportsMassage from "./components/SportsMassage";

const PAYSTACK_KEY = "pk_live_915663b76742c16f999c99e6251596ee7c5c9584";
const WA_NUMBER = "2347040723894";

// ─────────────────────────────────────────────────────────────────────────────
// Tab definitions — used by both desktop header and mobile bottom nav
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "booking", icon: "📅", short: "Book", full: "Book Session" },
  { id: "sports", icon: "🏃", short: "Sports", full: "Sports Massage" },
  { id: "membership", icon: "👑", short: "Member", full: "Membership" },
  { id: "giftcard", icon: "🎁", short: "Gift", full: "Gift Card" },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const onPhone = (v, set, setErr) => {
  set(v);
  const d = v.replace(/\D/g, "");
  setErr(d.length > 0 && d.length < 11 ? "Must be 11 digits" : "");
};

const paystackPay = ({ amount, meta, onSuccess, email, ref }) => {
  if (!window.PaystackPop) {
    alert("Payment system loading. Please try again in a moment.");
    return;
  }
  window.PaystackPop.setup({
    key: PAYSTACK_KEY,
    email: email || "customer@vivifymassageandspa.online",
    amount: amount * 100,
    currency: "NGN",
    ref: ref || `VMS_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    metadata: { custom_fields: meta },
    callback: (res) => onSuccess(res),
    onClose: () => alert("Payment cancelled. Contact us at 07040723894."),
  }).openIframe();
};

const sendWA = (msg) => {
  window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
    msg,
  )}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Micro components
// ─────────────────────────────────────────────────────────────────────────────
const FC = ({ children }) => (
  <div
    className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl"
    style={{ border: "1px solid rgba(255,255,255,0.1)" }}
  >
    {children}
  </div>
);

const SBox = ({ rows, hi }) => (
  <div className="rounded-2xl p-4 mb-4 space-y-2 bg-cyan-50 border border-cyan-100">
    {rows.map(([l, v]) => (
      <div key={l} className="flex justify-between text-sm">
        <span className="text-gray-500 text-xs sm:text-sm">{l}</span>
        <span
          className={`font-semibold text-right max-w-[58%] truncate ${
            l === hi ? "text-base sm:text-lg" : ""
          }`}
          style={
            l === hi
              ? { color: "#0891b2", fontFamily: "Cormorant Garamond" }
              : { color: "#111827", fontSize: "0.8125rem" }
          }
        >
          {v}
        </span>
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERSHIP SECTION
// ─────────────────────────────────────────────────────────────────────────────
const MembershipSection = ({ sendEmail }) => {
  const [mSvcType, setMSvcType] = useState("studio");
  const [mSvc, setMSvc] = useState("");
  const [mDur, setMDur] = useState("");
  const [mPlan, setMPlan] = useState("relaxation");
  const [mName, setMName] = useState("");
  const [mPhone, setMPhone] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mPhoneErr, setMPhoneErr] = useState("");
  const [mLoading, setMLoading] = useState(false);
  const [mSuccess, setMSuccess] = useState(false);
  const [mDetails, setMDetails] = useState(null);

  const mBase = () => getPrice(mSvcType, mSvc, mDur);
  const planSess = () => MEM_PLANS.find((p) => p.id === mPlan)?.sessions || 2;
  const mTotal = () => planSess() * disc10(mBase());
  const mDone = !!(
    mSvc &&
    mSvcType &&
    mName &&
    mPhone &&
    mPhone.replace(/\D/g, "").length >= 11 &&
    mEmail &&
    mDur
  );

  useEffect(() => {
    if (mSvc && mDur && !durList(mSvc).includes(Number(mDur))) setMDur("");
  }, [mSvc, mDur]);

  const handleMembership = () => {
    if (!mDone) {
      alert("Please complete all fields.");
      return;
    }
    setMLoading(true);
    const svcObj = SERVICES.find((s) => s.id === mSvc);
    const plan = MEM_PLANS.find((p) => p.id === mPlan);
    const data = {
      name: mName,
      phone: mPhone,
      email: mEmail,
      plan: plan?.label,
      service: svcObj?.name,
      location: mSvcType === "studio" ? "Home Studio" : "Mobile Service",
      duration: `${mDur} minutes`,
      sessions: planSess(),
      normalPrice: mBase(),
      discountedPerSession: disc10(mBase()),
      monthlyAmount: mTotal(),
    };
    paystackPay({
      amount: mTotal(),
      email: mEmail,
      meta: [
        { display_name: "Member", variable_name: "member", value: mName },
        { display_name: "Plan", variable_name: "plan", value: plan?.label },
      ],
      onSuccess: async (res) => {
        const u = { ...data, ref: res.reference };
        await sendEmail("membership", u);
        setMDetails(u);
        setMLoading(false);
        setMSuccess(true);
      },
    });
  };

  const resetMembership = () => {
    setMSuccess(false);
    setMName("");
    setMPhone("");
    setMEmail("");
    setMSvc("");
    setMDur("");
    setMDetails(null);
  };

  return (
    <div className="max-w-2xl mx-auto pb-32 md:pb-16">
      <div className="text-center mb-8 px-2">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fde68a",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <Crown className="w-3.5 h-3.5" /> Monthly Wellness
        </div>
        <h2
          className="text-3xl sm:text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "Cormorant Garamond" }}
        >
          Commit to Your Wellbeing
        </h2>
        <p className="text-cyan-200 text-sm max-w-md mx-auto">
          10% off every session. Real commitment, real results.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {MEM_PLANS.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setMPlan(plan.id)}
            className="rounded-3xl p-5 text-left transition-all relative overflow-hidden"
            style={{
              background:
                mPlan === plan.id
                  ? "rgba(255,255,255,0.98)"
                  : "rgba(255,255,255,0.08)",
              border:
                mPlan === plan.id
                  ? "2px solid #06b6d4"
                  : "2px solid rgba(255,255,255,0.15)",
              boxShadow:
                mPlan === plan.id ? "0 12px 32px rgba(6,182,212,0.25)" : "none",
            }}
          >
            <span
              className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background:
                  mPlan === plan.id ? "#0891b2" : "rgba(255,255,255,0.15)",
                color: "white",
              }}
            >
              {plan.tag}
            </span>
            <div className="text-3xl mb-3">{plan.icon}</div>
            <h3
              className="text-lg font-bold mb-1"
              style={{
                color: mPlan === plan.id ? "#0891b2" : "white",
                fontFamily: "Cormorant Garamond",
              }}
            >
              {plan.label}
            </h3>
            <p
              className="text-xs mb-3 leading-relaxed"
              style={{
                color: mPlan === plan.id ? "#6b7280" : "rgba(255,255,255,0.7)",
              }}
            >
              {plan.desc}
            </p>
            <div className="flex items-center gap-2">
              <Calendar
                className="w-4 h-4"
                style={{ color: mPlan === plan.id ? "#0891b2" : "#67e8f9" }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: mPlan === plan.id ? "#0891b2" : "#67e8f9" }}
              >
                {plan.sessions} sessions / month
              </span>
            </div>
            {mPlan === plan.id && mSvc && mDur && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400 line-through">
                    {fmt(plan.sessions * mBase())}
                  </span>
                  <span className="font-bold text-emerald-600">10% OFF</span>
                </div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "#0891b2", fontFamily: "Cormorant Garamond" }}
                >
                  {fmt(mTotal())}
                  <span className="text-sm font-normal text-gray-500">
                    /month
                  </span>
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      <FC>
        <h4
          className="font-bold text-gray-900 mb-5 text-lg"
          style={{ fontFamily: "Cormorant Garamond" }}
        >
          Customise Your Plan
        </h4>
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Location
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "studio", l: "Home Studio" },
              { id: "mobile", l: "Mobile Service" },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => setMSvcType(o.id)}
                className="p-4 rounded-2xl border-2 text-left transition-all"
                style={{
                  borderColor: mSvcType === o.id ? "#06b6d4" : "#e5e7eb",
                  background: mSvcType === o.id ? "#f0f9ff" : "white",
                }}
              >
                <span className="font-bold text-gray-900 text-sm">{o.l}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Massage
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SERVICES.map((svc) => (
              <button
                key={svc.id}
                onClick={() => setMSvc(svc.id)}
                className="p-3 rounded-2xl border-2 flex items-center gap-3 text-left transition-all"
                style={{
                  borderColor: mSvc === svc.id ? "#06b6d4" : "#e5e7eb",
                  background: mSvc === svc.id ? "#f0f9ff" : "white",
                }}
              >
                <span className="text-xl">{svc.icon}</span>
                <span className="font-semibold text-gray-900 text-sm flex-1">
                  {svc.name}
                </span>
                {mSvc === svc.id && <Tick />}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Duration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {durList(mSvc).map((m) => {
              const base = getPrice(mSvcType, mSvc, m),
                dp = disc10(base);
              return (
                <button
                  key={m}
                  onClick={() => setMDur(m)}
                  className="p-3 rounded-2xl border-2 text-center transition-all"
                  style={{
                    borderColor: mDur === m ? "#06b6d4" : "#e5e7eb",
                    background: mDur === m ? "#f0f9ff" : "white",
                  }}
                >
                  <p className="font-bold text-gray-900 text-sm">{m} min</p>
                  <p className="text-xs text-gray-400 line-through">
                    {fmt(base)}
                  </p>
                  <p className="text-sm font-bold text-cyan-600">{fmt(dp)}</p>
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <TF
            label="Full Name *"
            value={mName}
            onChange={setMName}
            placeholder="Your name"
          />
          <PF
            label="Phone *"
            value={mPhone}
            error={mPhoneErr}
            onChange={(v) => onPhone(v, setMPhone, setMPhoneErr)}
          />
        </div>
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Email *
          </label>
          <input
            type="email"
            value={mEmail}
            onChange={(e) => setMEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full p-4 rounded-2xl text-sm border-2 transition-all"
            style={{
              borderColor: mEmail ? "#06b6d4" : "#e5e7eb",
              background: mEmail ? "#f0f9ff" : "white",
            }}
          />
        </div>
        {mSvc && mDur && (
          <div className="rounded-2xl p-4 mb-5 bg-cyan-50 border-2 border-cyan-200 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-gray-800">
                {MEM_PLANS.find((p) => p.id === mPlan)?.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {planSess()} sessions · 10% off
              </p>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: "Cormorant Garamond", color: "#0891b2" }}
            >
              {fmt(mTotal())}
            </p>
          </div>
        )}
        <button
          onClick={handleMembership}
          disabled={!mDone}
          className="w-full py-4 rounded-2xl font-bold text-sm text-white transition-all"
          style={{
            background: mDone
              ? "linear-gradient(135deg,#0891b2,#06b6d4)"
              : "#d1d5db",
            cursor: mDone ? "pointer" : "not-allowed",
            boxShadow: mDone ? "0 6px 20px rgba(6,182,212,0.3)" : "none",
          }}
        >
          <Crown className="w-4 h-4 inline mr-2" />
          Start My Membership
        </button>
      </FC>

      {mLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.65)",
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
              Processing…
            </p>
          </div>
        </div>
      )}

      {mSuccess && mDetails && (
        <Modal onClose={resetMembership}>
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-yellow-100 mx-auto flex items-center justify-center mb-3">
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <h3
              className="text-2xl font-bold text-gray-900 mb-1"
              style={{ fontFamily: "Cormorant Garamond" }}
            >
              Welcome, Member!
            </h3>
            <p className="text-sm text-gray-500">
              Confirmation sent to <b>{mDetails.email}</b>
            </p>
          </div>
          <SBox
            rows={[
              ["Member", mDetails.name],
              ["Plan", mDetails.plan],
              ["Service", mDetails.service],
              ["Location", mDetails.location],
              ["Sessions/Month", `${mDetails.sessions}`],
              ["Monthly", fmt(mDetails.monthlyAmount)],
              ["Ref", mDetails.ref],
            ]}
            hi="Monthly"
          />
          <button
            onClick={() =>
              sendWA(
                `Hello Vivify! 👑\n\nMy membership:\n👤 ${mDetails.name}\n📱 ${mDetails.phone}\n📋 ${mDetails.plan}\n💆 ${mDetails.service}\n💰 ${fmt(mDetails.monthlyAmount)}/month\n🔗 ${mDetails.ref}\n\nPlease contact me to schedule.`,
              )
            }
            className="w-full py-3 rounded-xl font-semibold text-sm text-white mb-2"
            style={{ background: "#25D366" }}
          >
            💬 Send via WhatsApp
          </button>
          <button
            onClick={resetMembership}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700"
          >
            Done
          </button>
        </Modal>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// GIFT CARD SECTION
// ─────────────────────────────────────────────────────────────────────────────
const GiftCardSection = ({ sendEmail }) => {
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
  const gDone = !!(
    gSvc &&
    gSvcType &&
    gDur &&
    gBName &&
    gBPhone &&
    gBPhone.replace(/\D/g, "").length >= 11 &&
    gBEmail &&
    gRName &&
    (gRPhone || gREmail)
  );

  useEffect(() => {
    if (gSvc && gDur && !durList(gSvc).includes(Number(gDur))) setGDur("");
  }, [gSvc, gDur]);

  const handleGift = () => {
    if (!gDone) {
      alert("Please complete all required fields.");
      return;
    }
    setGLoading(true);
    const svcObj = SERVICES.find((s) => s.id === gSvc);
    const data = {
      buyerName: gBName,
      buyerPhone: gBPhone,
      buyerEmail: gBEmail,
      recipientName: gRName,
      recipientPhone: gRPhone,
      recipientEmail: gREmail,
      service: svcObj?.name,
      location:
        gSvcType === "studio" ? "Home Studio" : "Mobile Service (Home / Hotel)",
      duration: `${gDur} minutes`,
      caption: gCaption || "Wishing you pure relaxation 💆",
      amount: gPrice(),
    };
    paystackPay({
      amount: gPrice(),
      email: gBEmail,
      meta: [
        { display_name: "Buyer", variable_name: "buyer", value: gBName },
        {
          display_name: "Recipient",
          variable_name: "recipient",
          value: gRName,
        },
      ],
      onSuccess: async (res) => {
        const u = { ...data, ref: res.reference };
        await sendEmail("gift", u);
        setGDetails(u);
        setGLoading(false);
        setGSuccess(true);
      },
    });
  };

  const resetGift = () => {
    setGSuccess(false);
    setGBName("");
    setGBPhone("");
    setGBEmail("");
    setGRName("");
    setGRPhone("");
    setGREmail("");
    setGSvc("");
    setGDur("");
    setGCaption("");
    setGDetails(null);
  };

  return (
    <div className="max-w-2xl mx-auto pb-32 md:pb-16">
      <div className="text-center mb-8 px-2">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fbcfe8",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <Gift className="w-3.5 h-3.5" /> Spa Gift Card
        </div>
        <h2
          className="text-3xl sm:text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "Cormorant Garamond" }}
        >
          Give the Gift of Wellness
        </h2>
        <p className="text-cyan-200 text-sm max-w-md mx-auto">
          We'll personally contact both buyer and recipient.
        </p>
      </div>

      <div
        className="rounded-3xl p-5 mb-6 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#0c4a6e,#0e7490,#164e63)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            transform: "translate(40%,-40%)",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span
                className="font-bold text-sm"
                style={{ fontFamily: "Cormorant Garamond" }}
              >
                Vivify Massage & Spa
              </span>
            </div>
            <Gift className="w-5 h-5 text-cyan-300" />
          </div>
          <p className="text-xs mb-1" style={{ color: "#bae6fd" }}>
            A special gift for
          </p>
          <p
            className="text-xl font-bold mb-1"
            style={{ fontFamily: "Cormorant Garamond" }}
          >
            {gRName || "Your Recipient"}
          </p>
          <p className="text-sm italic mb-5" style={{ color: "#bae6fd" }}>
            "{gCaption || "Wishing you pure relaxation 💆"}"
          </p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs" style={{ color: "#bae6fd" }}>
                {gSvc
                  ? SERVICES.find((s) => s.id === gSvc)?.name
                  : "Select a service"}
              </p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                From {gBName || "Your Name"}
              </p>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: "Cormorant Garamond" }}
            >
              {gPrice() ? fmt(gPrice()) : "₦—"}
            </p>
          </div>
        </div>
      </div>

      <FC>
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Location
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setGSvcType("studio")}
              className="p-4 rounded-2xl border-2 text-left transition-all"
              style={{
                borderColor: gSvcType === "studio" ? "#06b6d4" : "#e5e7eb",
                background: gSvcType === "studio" ? "#f0f9ff" : "white",
              }}
            >
              <span className="font-bold text-gray-900 text-sm">
                Home Studio
              </span>
            </button>
            <button
              onClick={() => setGSvcType("mobile")}
              className="p-4 rounded-2xl border-2 text-left transition-all"
              style={{
                borderColor: gSvcType === "mobile" ? "#06b6d4" : "#e5e7eb",
                background: gSvcType === "mobile" ? "#f0f9ff" : "white",
              }}
            >
              <span className="font-bold text-gray-900 text-sm">Mobile</span>
            </button>
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Massage
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SERVICES.map((svc) => (
              <button
                key={svc.id}
                onClick={() => setGSvc(svc.id)}
                className="p-3 rounded-2xl border-2 flex items-center gap-3 text-left transition-all"
                style={{
                  borderColor: gSvc === svc.id ? "#06b6d4" : "#e5e7eb",
                  background: gSvc === svc.id ? "#f0f9ff" : "white",
                }}
              >
                <span className="text-xl">{svc.icon}</span>
                <span className="font-semibold text-gray-900 text-sm flex-1">
                  {svc.name}
                </span>
                {gSvc === svc.id && <Tick />}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Duration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {durList(gSvc).map((m) => (
              <button
                key={m}
                onClick={() => setGDur(m)}
                className="p-3 rounded-2xl border-2 text-center transition-all"
                style={{
                  borderColor: gDur === m ? "#06b6d4" : "#e5e7eb",
                  background: gDur === m ? "#f0f9ff" : "white",
                }}
              >
                <p className="font-bold text-gray-900 text-sm">{m} min</p>
                <p className="text-sm font-bold text-cyan-600 mt-1">
                  {fmt(getPrice(gSvcType, gSvc, m))}
                </p>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Personal Message
          </label>
          <textarea
            value={gCaption}
            onChange={(e) => setGCaption(e.target.value)}
            rows={3}
            placeholder="Write something personal…"
            className="w-full p-4 rounded-2xl text-sm resize-none border-2 border-gray-200 focus:border-cyan-500 transition-all"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <p className="font-bold text-gray-800 mb-3 text-sm pb-2 border-b border-gray-100">
              🎁 You (Buying)
            </p>
            <div className="space-y-3">
              <TF
                label="Full Name *"
                value={gBName}
                onChange={setGBName}
                placeholder="Your name"
              />
              <PF
                label="Phone *"
                value={gBPhone}
                error={gBPhoneErr}
                onChange={(v) => onPhone(v, setGBPhone, setGBPhoneErr)}
              />
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={gBEmail}
                  onChange={(e) => setGBEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-3 rounded-xl text-sm border-2 transition-all"
                  style={{
                    borderColor: gBEmail ? "#06b6d4" : "#e5e7eb",
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <p className="font-bold text-gray-800 mb-3 text-sm pb-2 border-b border-pink-100">
              💝 Recipient
            </p>
            <div className="space-y-3">
              <TF
                label="Full Name *"
                value={gRName}
                onChange={setGRName}
                placeholder="Recipient's name"
              />
              <PF
                label="Phone"
                value={gRPhone}
                error={gRPhoneErr}
                onChange={(v) => onPhone(v, setGRPhone, setGRPhoneErr)}
              />
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={gREmail}
                  onChange={(e) => setGREmail(e.target.value)}
                  placeholder="recipient@email.com"
                  className="w-full p-3 rounded-xl text-sm border-2 transition-all"
                  style={{
                    borderColor: gREmail ? "#06b6d4" : "#e5e7eb",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          * Provide at least one contact for the recipient (phone or email).
        </p>
        {gSvc && gPrice() > 0 && (
          <div className="rounded-2xl p-4 mb-5 bg-pink-50 border-2 border-pink-200 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-gray-800">Gift Card Value</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {SERVICES.find((s) => s.id === gSvc)?.name}
              </p>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: "Cormorant Garamond", color: "#db2777" }}
            >
              {fmt(gPrice())}
            </p>
          </div>
        )}
        <button
          onClick={handleGift}
          disabled={!gDone}
          className="w-full py-4 rounded-2xl font-bold text-sm text-white transition-all"
          style={{
            background: gDone
              ? "linear-gradient(135deg,#db2777,#ec4899)"
              : "#d1d5db",
            cursor: gDone ? "pointer" : "not-allowed",
            boxShadow: gDone ? "0 6px 20px rgba(219,39,119,0.3)" : "none",
          }}
        >
          <Gift className="w-4 h-4 inline mr-2" />
          Purchase Gift Card
        </button>
      </FC>

      {gLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl mx-4">
            <div
              className="w-14 h-14 rounded-full mx-auto mb-4 animate-spin"
              style={{
                border: "3px solid #e5e7eb",
                borderTopColor: "#db2777",
              }}
            />
            <p
              className="font-bold text-gray-900"
              style={{ fontFamily: "Cormorant Garamond", fontSize: 20 }}
            >
              Processing…
            </p>
          </div>
        </div>
      )}

      {gSuccess && gDetails && (
        <Modal onClose={resetGift}>
          <div className="text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-pink-100 mx-auto flex items-center justify-center mb-3">
              <Gift className="w-8 h-8 text-pink-500" />
            </div>
            <h3
              className="text-2xl font-bold text-gray-900 mb-1"
              style={{ fontFamily: "Cormorant Garamond" }}
            >
              Gift Card Sent! 🎁
            </h3>
            <p className="text-sm text-gray-500">
              Confirmation sent to {gDetails.buyerEmail}
            </p>
          </div>
          <SBox
            rows={[
              ["Ref", gDetails.ref],
              ["Recipient", gDetails.recipientName],
              ["Value", fmt(gDetails.amount)],
            ]}
            hi="Value"
          />
          <button
            onClick={() =>
              sendWA(
                `Hello Vivify! 🎁\n\nGift card:\n👤 Buyer: ${gDetails.buyerName}\n🎁 Recipient: ${gDetails.recipientName}\n💆 ${gDetails.service}\n💰 ${fmt(gDetails.amount)}\n💬 "${gDetails.caption}"\n🔗 ${gDetails.ref}`,
              )
            }
            className="w-full py-3 rounded-xl font-semibold text-sm text-white mb-2"
            style={{ background: "#25D366" }}
          >
            💬 Send via WhatsApp
          </button>
          <button
            onClick={resetGift}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700"
          >
            Done
          </button>
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
      const resp = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data }),
      });
      if (!resp.ok) throw new Error("Email API error");
    } catch (err) {
      console.error("Email sending failed:", err);
      alert(
        "Booking confirmed, but email notification could not be sent. WhatsApp sent.",
      );
    }
  };

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const switchTab = (id) => {
    setActiveTab(id);
    scrollTo("main");
  };

  const hideHero = activeTab === "sports";

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg,#0c4a6e 0%,#0e7490 40%,#164e63 100%)",
        backgroundAttachment: "fixed",
        fontFamily: "'DM Sans',system-ui,sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');
        @keyframes spin { to{transform:rotate(360deg)} }
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        input,textarea,select,button { outline:none; font-family:inherit }
        button { -webkit-tap-highlight-color:transparent }
        * { box-sizing:border-box }
        @media (max-width:768px){
          input, textarea, select { font-size: 16px !important; }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* DESKTOP HEADER                                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      <header
        className="hidden md:block sticky top-0 z-40"
        style={{
          background: "rgba(12,74,110,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#0891b2,#06b6d4)",
                boxShadow: "0 8px 20px rgba(6,182,212,0.35)",
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className="text-lg font-bold text-white leading-tight"
                style={{ fontFamily: "Cormorant Garamond" }}
              >
                Vivify Massage & Spa
              </h1>
              <p className="text-xs text-cyan-200 leading-tight">
                Relax · Restore · Renew
              </p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Pills */}
          <nav
            className="flex items-center gap-1 p-1 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            {TABS.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => switchTab(t.id)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                  style={{
                    background: active
                      ? "linear-gradient(135deg,#0891b2,#06b6d4)"
                      : "transparent",
                    color: active ? "white" : "rgba(255,255,255,0.75)",
                    boxShadow: active
                      ? "0 6px 16px rgba(6,182,212,0.4)"
                      : "none",
                  }}
                >
                  <span>{t.icon}</span>
                  {t.full}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MOBILE HEADER                                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <header
        className="md:hidden sticky top-0 z-40"
        style={{
          background: "rgba(12,74,110,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg,#0891b2,#06b6d4)",
                boxShadow: "0 6px 16px rgba(6,182,212,0.35)",
              }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1
                className="text-base font-bold text-white leading-tight"
                style={{ fontFamily: "Cormorant Garamond" }}
              >
                Vivify
              </h1>
              <p className="text-xs text-cyan-200 leading-tight -mt-0.5">
                Massage & Spa
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${WA_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-2 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            💬 Help
          </a>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO (hidden for sports)                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      {!hideHero && (
        <section className="py-10 sm:py-16 relative overflow-hidden">
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.08,
              backgroundImage:
                "radial-gradient(circle at 20% 80%,#fff 0%,transparent 50%),radial-gradient(circle at 80% 20%,#fff 0%,transparent 50%)",
            }}
          />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#bae6fd",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Star className="w-3.5 h-3.5" fill="currentColor" />
              Where Recovery Meets Convenience
            </div>
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: "Cormorant Garamond", lineHeight: 1.05 }}
            >
              Relax. Restore.
              <br />
              <span style={{ color: "#67e8f9" }}>Renew.</span>
            </h2>
            <p
              className="text-sm sm:text-lg max-w-md mx-auto px-4"
              style={{ color: "#bae6fd" }}
            >
              Expert massage therapy — at our studio or your doorstep.
            </p>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT                                            */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div id="main">
        {activeTab === "booking" && (
          <div className="px-4 sm:px-6">
            <BookingWizard />
          </div>
        )}

        {activeTab === "sports" && <SportsMassage />}

        {activeTab === "membership" && (
          <div className="px-4 sm:px-6">
            <MembershipSection sendEmail={sendEmail} />
          </div>
        )}

        {activeTab === "giftcard" && (
          <div className="px-4 sm:px-6">
            <GiftCardSection sendEmail={sendEmail} />
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TESTIMONIALS + FOOTER                                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section
        className="py-12 sm:py-16 mt-8"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h3
              className="text-2xl sm:text-3xl font-bold text-white"
              style={{ fontFamily: "Cormorant Garamond" }}
            >
              What Our Clients Say
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                name: "Abu M.",
                text: "Had chronic shoulder pain for 6 months. After 3 sessions with Vivify, I'm back to training pain-free.",
                rating: 5,
              },
              {
                name: "Adeola O.",
                text: "Having a professional therapist come to my home was incredible. No traffic, just pure relaxation in my own space.",
                rating: 5,
              },
              {
                name: "Kareem J.",
                text: "Deep tissue massage that delivered real results. My back pain is significantly better and the staff was incredibly professional.",
                rating: 5,
              },
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-3xl p-5"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <div className="flex gap-0.5 mb-3">
                  {Array(t.rating)
                    .fill(0)
                    .map((_, j) => (
                      <Star
                        key={j}
                        className="w-4 h-4 text-amber-400"
                        fill="currentColor"
                      />
                    ))}
                </div>
                <p
                  className="text-sm mb-4 italic leading-relaxed"
                  style={{ color: "#bae6fd" }}
                >
                  "{t.text}"
                </p>
                <p className="text-sm font-bold text-white">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer
        className="py-10 sm:py-14 pb-32 md:pb-14"
        style={{ background: "#0c1a2e" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg,#0891b2,#06b6d4)",
                  }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h4
                  className="text-lg font-bold text-white"
                  style={{ fontFamily: "Cormorant Garamond" }}
                >
                  Vivify Massage & Spa
                </h4>
              </div>
              <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                Your sanctuary for relaxation and rejuvenation.
              </p>
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-4">Contact</h4>
              <div
                className="space-y-3"
                style={{ color: "#6b7280", fontSize: "0.875rem" }}
              >
                <div className="flex items-start gap-3">
                  <Phone
                    className="w-4 h-4 mt-0.5"
                    style={{ color: "#06b6d4", flexShrink: 0 }}
                  />
                  <div>
                    <p className="font-semibold text-white">07040723894</p>
                    <p>Available for bookings</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin
                    className="w-4 h-4 mt-0.5"
                    style={{ color: "#06b6d4", flexShrink: 0 }}
                  />
                  <div>
                    <p className="font-semibold text-white">Studio</p>
                    <p>Ewa Block Industry, Alao Farm, Tanke Akata.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-base font-bold text-white mb-4">Hours</h4>
              <div
                className="space-y-2"
                style={{ color: "#6b7280", fontSize: "0.875rem" }}
              >
                <div className="flex justify-between">
                  <span>Studio</span>
                  <span className="font-semibold text-white">9 AM – 6 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile</span>
                  <span className="font-semibold text-white">7 AM – 12 AM</span>
                </div>
              </div>
            </div>
          </div>
          <div
            className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{
              borderTop: "1px solid #1e293b",
              color: "#4b5563",
              fontSize: "0.75rem",
            }}
          >
            <p>© 2026 Vivify Massage & Spa. All rights reserved.</p>
            <p>Payment via Paystack</p>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MOBILE BOTTOM NAV (fixed)                               */}
      {/* ═══════════════════════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: "rgba(12,74,110,0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="grid grid-cols-4">
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className="py-3 flex flex-col items-center gap-1 transition-all relative"
                style={{
                  color: active ? "white" : "rgba(255,255,255,0.5)",
                }}
              >
                {active && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                    style={{
                      background: "linear-gradient(90deg,#0891b2,#06b6d4)",
                    }}
                  />
                )}
                <span
                  className="text-xl transition-transform"
                  style={{
                    transform: active ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  {t.icon}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ fontSize: "0.65rem" }}
                >
                  {t.short}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default VivifySpaWebsite;
