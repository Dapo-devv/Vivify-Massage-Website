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

// Config (single source of truth)
import {
  PRICING,
  SERVICES,
  MEM_PLANS,
  fmt,
  disc10,
  getPrice,
  durList,
} from "./config/services";

// Shared UI primitives
import { Tick, IB, TF, PF, SC, Modal, Btn } from "./components/ui";

// Feature components
import BookingWizard from "./components/BookingWizard";
import SportsMassage from "./components/SportsMassage";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const PAYSTACK_KEY = "pk_live_915663b76742c16f999c99e6251596ee7c5c9584";
const WA_NUMBER = "2347040723894";

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
// INLINE MICRO-COMPONENTS (used only by Membership & GiftCard)
// ─────────────────────────────────────────────────────────────────────────────
const FC = ({ children }) => (
  <div
    className="bg-white rounded-2xl p-4 sm:p-6 lg:p-7 shadow-sm"
    style={{ border: "1px solid #e5e7eb" }}
  >
    {children}
  </div>
);

const SBox = ({ rows, hi }) => (
  <div
    className="rounded-xl p-3 sm:p-4 mb-4 space-y-2"
    style={{ background: "#f0f9ff" }}
  >
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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8 sm:mb-10 px-2">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fde68a",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <Crown className="w-3.5 h-3.5" /> Monthly Wellness Membership
        </div>
        <h2
          className="text-2xl sm:text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "Cormorant Garamond" }}
        >
          Commit to Your Wellbeing
        </h2>
        <p className="text-cyan-200 text-sm max-w-md mx-auto">
          Choose a monthly plan with 10% off every session. Real commitment,
          real results.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {MEM_PLANS.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setMPlan(plan.id)}
            className="rounded-2xl p-5 sm:p-6 cursor-pointer ch relative overflow-hidden"
            style={{
              background:
                mPlan === plan.id
                  ? "rgba(255,255,255,0.97)"
                  : "rgba(255,255,255,0.08)",
              border:
                mPlan === plan.id
                  ? "2px solid #06b6d4"
                  : "2px solid rgba(255,255,255,0.15)",
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
            <div className="flex items-center gap-2 mb-2">
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
              <div
                className="mt-3 pt-3"
                style={{ borderTop: "1px solid #e5e7eb" }}
              >
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400 line-through">
                    {fmt(plan.sessions * mBase())}
                  </span>
                  <span className="font-semibold text-emerald-600">
                    10% OFF
                  </span>
                </div>
                <p
                  className="text-xl font-bold"
                  style={{ color: "#0891b2", fontFamily: "Cormorant Garamond" }}
                >
                  {fmt(mTotal())}
                  <span className="text-sm font-normal text-gray-500">
                    /month
                  </span>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <FC>
        <h4
          className="font-bold text-gray-900 mb-5"
          style={{ fontFamily: "Cormorant Garamond", fontSize: "1.1rem" }}
        >
          Customise Your Plan
        </h4>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Service Location
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "studio", l: "Home Studio" },
              { id: "mobile", l: "Mobile Service" },
            ].map((o) => (
              <SC
                key={o.id}
                sel={mSvcType === o.id}
                onClick={() => setMSvcType(o.id)}
              >
                <span className="font-semibold text-gray-900 text-sm">
                  {o.l}
                </span>
              </SC>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Choose Massage
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SERVICES.map((svc) => (
              <div
                key={svc.id}
                onClick={() => setMSvc(svc.id)}
                className={`p-3 rounded-xl cursor-pointer ch border-2 flex items-center gap-3 ${
                  mSvc === svc.id
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">{svc.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {svc.name}
                  </p>
                </div>
                {mSvc === svc.id && <Tick />}
              </div>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Session Duration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {durList(mSvc).map((m) => {
              const base = getPrice(mSvcType, mSvc, m),
                dp = disc10(base);
              return (
                <div
                  key={m}
                  onClick={() => setMDur(m)}
                  className={`p-3 rounded-xl cursor-pointer ch border-2 text-center ${
                    mDur === m
                      ? "border-cyan-500 bg-cyan-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-bold text-gray-900 text-sm">{m} min</p>
                  <p className="text-xs text-gray-400 line-through">
                    {fmt(base)}
                  </p>
                  <p className="text-sm font-bold" style={{ color: "#0891b2" }}>
                    {fmt(dp)}
                  </p>
                  <p className="text-xs text-emerald-600 font-semibold">
                    10% off
                  </p>
                </div>
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
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Email Address *{" "}
            <span className="font-normal text-gray-400">
              (for confirmation)
            </span>
          </label>
          <input
            type="email"
            value={mEmail}
            onChange={(e) => setMEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full p-3 rounded-lg text-sm"
            style={{ border: `2px solid ${mEmail ? "#06b6d4" : "#e5e7eb"}` }}
          />
        </div>
        {mSvc && mDur && (
          <div
            className="rounded-xl p-4 mb-5"
            style={{ background: "#f0f9ff", border: "2px solid #bae6fd" }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  {MEM_PLANS.find((p) => p.id === mPlan)?.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {planSess()} sessions/month · 10% off per session
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-2xl font-bold"
                  style={{ fontFamily: "Cormorant Garamond", color: "#0891b2" }}
                >
                  {fmt(mTotal())}
                </p>
                <p className="text-xs text-gray-400">/month</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleMembership}
          disabled={!mDone}
          className="w-full py-4 rounded-xl font-bold text-white bg"
          style={{
            background: mDone
              ? "linear-gradient(135deg,#0891b2,#06b6d4)"
              : "#e5e7eb",
            color: mDone ? "white" : "#9ca3af",
            cursor: mDone ? "pointer" : "not-allowed",
          }}
        >
          <Crown className="w-4 h-4 inline mr-2" />
          Start My Membership →
        </button>
        <IB text="Secure payment via Paystack. Confirmation sent to you by email. We'll call to schedule." />
      </FC>

      {mLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
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

      {mSuccess && mDetails && (
        <Modal onClose={resetMembership}>
          <div className="text-center mb-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: "#fef9c3" }}
            >
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <h3
            className="text-2xl font-bold text-gray-900 text-center mb-1"
            style={{ fontFamily: "Cormorant Garamond" }}
          >
            Welcome, Member!
          </h3>
          <p className="text-center text-sm text-gray-500 mb-5">
            A confirmation has been sent to <b>{mDetails.email}</b>
          </p>
          <SBox
            rows={[
              ["Member", mDetails.name],
              ["Plan", mDetails.plan],
              ["Service", mDetails.service],
              ["Location", mDetails.location],
              ["Sessions/Month", `${mDetails.sessions} sessions`],
              ["Monthly", fmt(mDetails.monthlyAmount)],
              ["Ref", mDetails.ref],
            ]}
            hi="Monthly"
          />
          <div
            className="flex gap-2 rounded-xl p-3 mb-4 text-xs"
            style={{
              background: "#fef9c3",
              border: "1px solid #fde68a",
              color: "#92400e",
            }}
          >
            <Crown className="w-4 h-4 flex-shrink-0" />
            <span>
              We'll call to schedule your first session and set up your monthly
              calendar.
            </span>
          </div>
          <Btn
            color="whatsapp"
            onClick={() =>
              sendWA(
                `Hello Vivify Massage & Spa! 👑\n\nMy membership details:\n👤 Name: ${mDetails.name}\n📱 Phone: ${mDetails.phone}\n✉️ Email: ${mDetails.email}\n📋 Plan: ${mDetails.plan}\n💆 Service: ${mDetails.service}\n📍 Location: ${mDetails.location}\n⏱️ Duration: ${mDetails.duration}\n📅 Sessions: ${mDetails.sessions}/month\n💰 Monthly Fee: ${fmt(mDetails.monthlyAmount)}\n🔗 Ref: ${mDetails.ref}\n\nPlease contact me to schedule my first session. Thank you!`,
              )
            }
          >
            💬 Send Details via WhatsApp
          </Btn>
          <Btn color="blue" onClick={resetMembership}>
            Done
          </Btn>
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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8 sm:mb-10 px-2">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fbcfe8",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <Gift className="w-3.5 h-3.5" /> Vivify Spa Gift Card
        </div>
        <h2
          className="text-2xl sm:text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "Cormorant Garamond" }}
        >
          Give the Gift of Wellness
        </h2>
        <p className="text-cyan-200 text-sm max-w-md mx-auto">
          Gift a premium massage experience. We'll personally contact both buyer
          and recipient.
        </p>
      </div>

      <div
        className="rounded-2xl p-5 sm:p-6 mb-6 text-white relative overflow-hidden"
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
            className="text-xl sm:text-2xl font-bold mb-1"
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
              <p className="text-xs" style={{ color: "#bae6fd" }}>
                {gSvcType === "studio"
                  ? "Home Studio"
                  : "Mobile (Home / Hotel)"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                From {gBName || "Your Name"}
              </p>
            </div>
            <p
              className="text-2xl sm:text-3xl font-bold"
              style={{ fontFamily: "Cormorant Garamond" }}
            >
              {gPrice() ? fmt(gPrice()) : "₦—"}
            </p>
          </div>
        </div>
      </div>

      <FC>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Service Location
          </label>
          <div className="grid grid-cols-2 gap-3">
            <SC
              sel={gSvcType === "studio"}
              onClick={() => setGSvcType("studio")}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-gray-900 text-sm">
                  Home Studio
                </span>
              </div>
            </SC>
            <SC
              sel={gSvcType === "mobile"}
              onClick={() => setGSvcType("mobile")}
            >
              <div className="flex items-center gap-2 mb-0.5">
                <Home className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-gray-900 text-sm">
                  Mobile Service
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Home or Hotel Service
              </p>
            </SC>
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Choose Massage
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SERVICES.map((svc) => (
              <div
                key={svc.id}
                onClick={() => setGSvc(svc.id)}
                className={`p-3 rounded-xl cursor-pointer ch border-2 flex items-center gap-3 ${
                  gSvc === svc.id
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">{svc.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">
                    {svc.name}
                  </p>
                </div>
                {gSvc === svc.id && <Tick />}
              </div>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Session Duration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {durList(gSvc).map((m) => {
              const p = getPrice(gSvcType, gSvc, m);
              return (
                <div
                  key={m}
                  onClick={() => setGDur(m)}
                  className={`p-3 rounded-xl cursor-pointer ch border-2 text-center ${
                    gDur === m
                      ? "border-cyan-500 bg-cyan-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-bold text-gray-900 text-sm">{m} min</p>
                  <p
                    className="text-sm font-bold mt-1"
                    style={{ color: "#0891b2" }}
                  >
                    {fmt(p)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Personal Message{" "}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            value={gCaption}
            onChange={(e) => setGCaption(e.target.value)}
            rows={3}
            placeholder="Write something personal for the recipient…"
            className="w-full p-3 rounded-lg text-sm resize-none"
            style={{ border: "2px solid #e5e7eb" }}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <h5
              className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm pb-2"
              style={{ borderBottom: "1px solid #f3f4f6" }}
            >
              <User className="w-4 h-4 text-cyan-600" />
              You (Buying)
            </h5>
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
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={gBEmail}
                  onChange={(e) => setGBEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-3 rounded-lg text-sm"
                  style={{
                    border: `2px solid ${gBEmail ? "#06b6d4" : "#e5e7eb"}`,
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <h5
              className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm pb-2"
              style={{ borderBottom: "1px solid #fce7f3" }}
            >
              <Gift className="w-4 h-4 text-pink-500" />
              Recipient
            </h5>
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
                placeholder="08012345678"
              />
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={gREmail}
                  onChange={(e) => setGREmail(e.target.value)}
                  placeholder="recipient@email.com"
                  className="w-full p-3 rounded-lg text-sm"
                  style={{
                    border: `2px solid ${gREmail ? "#06b6d4" : "#e5e7eb"}`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          * Provide at least one contact for the recipient (phone or email) so
          we can deliver their gift.
        </p>
        {gSvc && gPrice() > 0 && (
          <div
            className="rounded-xl p-4 mb-5"
            style={{ background: "#fdf2f8", border: "2px solid #fbcfe8" }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Spa Gift Card Value
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {SERVICES.find((s) => s.id === gSvc)?.name} ·{" "}
                  {gSvcType === "studio" ? "Home Studio" : "Mobile Service"}
                </p>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ fontFamily: "Cormorant Garamond", color: "#db2777" }}
              >
                {fmt(gPrice())}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleGift}
          disabled={!gDone}
          className="w-full py-4 rounded-xl font-bold text-white bg"
          style={{
            background: gDone
              ? "linear-gradient(135deg,#db2777,#ec4899)"
              : "#e5e7eb",
            color: gDone ? "white" : "#9ca3af",
            cursor: gDone ? "pointer" : "not-allowed",
          }}
        >
          <Gift className="w-4 h-4 inline mr-2" />
          Purchase Spa Gift Card →
        </button>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-3">
          <Shield className="w-3.5 h-3.5" />
          <span>
            Secure via Paystack · Confirmation emails sent to buyer
            {gREmail ? " and recipient" : ""}
          </span>
        </div>
      </FC>

      {gLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
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

      {gSuccess && gDetails && (
        <Modal onClose={resetGift}>
          <div className="text-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: "#fce7f3" }}
            >
              <Gift className="w-8 h-8 text-pink-500" />
            </div>
          </div>
          <h3
            className="text-2xl font-bold text-gray-900 text-center mb-1"
            style={{ fontFamily: "Cormorant Garamond" }}
          >
            Spa Gift Card Sent! 🎁
          </h3>
          <p className="text-center text-sm text-gray-500 mb-4">
            Confirmation sent to {gDetails.buyerEmail}
            {gDetails.recipientEmail ? ` and ${gDetails.recipientEmail}` : ""}
          </p>
          <div
            className="rounded-2xl p-5 mb-4 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#0c4a6e,#0e7490)" }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                transform: "translate(30%,-30%)",
              }}
            />
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span
                className="font-bold text-sm"
                style={{ fontFamily: "Cormorant Garamond" }}
              >
                Vivify Massage & Spa
              </span>
            </div>
            <p
              className="text-lg font-bold mb-1"
              style={{ fontFamily: "Cormorant Garamond" }}
            >
              For {gDetails.recipientName}
            </p>
            <p className="text-xs italic mb-4" style={{ color: "#bae6fd" }}>
              "{gDetails.caption}"
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs" style={{ color: "#bae6fd" }}>
                  {gDetails.service}
                </p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  From {gDetails.buyerName}
                </p>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ fontFamily: "Cormorant Garamond" }}
              >
                {fmt(gDetails.amount)}
              </p>
            </div>
          </div>
          <SBox
            rows={[
              ["Ref", gDetails.ref],
              ["Buyer", gDetails.buyerName],
              ["Recipient", gDetails.recipientName],
              ["Value", fmt(gDetails.amount)],
            ]}
            hi="Value"
          />
          <div
            className="flex gap-2 rounded-xl p-3 mb-4 text-xs"
            style={{
              background: "#fce7f3",
              border: "1px solid #fbcfe8",
              color: "#9d174d",
            }}
          >
            <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              We'll contact {gDetails.buyerName} to confirm and reach out to{" "}
              {gDetails.recipientName} with their gift.
            </span>
          </div>
          <Btn
            color="whatsapp"
            onClick={() =>
              sendWA(
                `Hello Vivify Massage & Spa! 🎁\n\nGift card purchase details:\n👤 Buyer: ${gDetails.buyerName}\n📱 Buyer Phone: ${gDetails.buyerPhone}\n🎁 Recipient: ${gDetails.recipientName}\n💆 Service: ${gDetails.service}\n📍 Location: ${gDetails.location}\n⏱️ Duration: ${gDetails.duration}\n💰 Value: ${fmt(gDetails.amount)}\n💬 Message: "${gDetails.caption}"\n🔗 Ref: ${gDetails.ref}\n\nPlease contact the recipient to coordinate their session. Thank you!`,
              )
            }
          >
            💬 Send Details via WhatsApp
          </Btn>
          <Btn color="pink" onClick={resetGift}>
            Done
          </Btn>
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

  // ───────────────────────────────────────────────────────────────────────
  // Paystack inline script.
  // NOTE: no cleanup — leaving the script attached forever avoids the
  // StrictMode double-mount churn (mount → unmount → mount) that would
  // otherwise remove and re-add the script and leave window.PaystackPop
  // undefined when the user hits "Pay".
  // ───────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (window.PaystackPop) return; // already loaded
    if (document.querySelector('script[src*="paystack"]')) return; // loading
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    document.head.appendChild(s);
    // intentionally no cleanup
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

  const TABS = [
    ["booking", "📅 Book Session"],
    ["sports", "🏃 Sports Massage"],
    ["membership", "👑 Membership"],
    ["giftcard", "🎁 Spa Gift Card"],
  ];

  const hideHero = activeTab === "sports";

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg,#0c4a6e 0%,#0e7490 40%,#164e63 100%)",
        backgroundAttachment: "fixed",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');
        @keyframes scale-in { from{opacity:0;transform:scale(0.94) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes slideInFwd{ from{opacity:0;transform:translateX(38px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInBck{ from{opacity:0;transform:translateX(-38px)} to{opacity:1;transform:translateX(0)} }
        .m-enter { animation:scale-in 0.25s cubic-bezier(.16,1,.3,1) }
        .sfwd    { animation:slideInFwd 0.28s cubic-bezier(.16,1,.3,1) }
        .sbck    { animation:slideInBck 0.28s cubic-bezier(.16,1,.3,1) }
        .ch  { transition:all 0.2s ease } .ch:hover  { transform:translateY(-2px) }
        .bg  { transition:all 0.18s ease} .bg:hover  { transform:translateY(-1px);box-shadow:0 8px 24px rgba(6,182,212,0.4) }
        .tp  { transition:all 0.2s ease }
        input,textarea,select { outline:none }
        input[type=date]::-webkit-calendar-picker-indicator { opacity:0.6;cursor:pointer }
        * { box-sizing:border-box }
      `}</style>

      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "rgba(12,74,110,0.96)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)" }}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1
              className="text-base sm:text-xl font-bold text-white"
              style={{ fontFamily: "Cormorant Garamond" }}
            >
              Vivify Massage & Spa
            </h1>
          </div>

          <div
            className="hidden md:flex items-center gap-1 rounded-xl p-1"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            {TABS.map(([id, label]) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  scrollTo("main");
                }}
                className="px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-semibold tp"
                style={{
                  background: activeTab === id ? "white" : "transparent",
                  color:
                    activeTab === id ? "#0891b2" : "rgba(255,255,255,0.85)",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setActiveTab("booking");
              scrollTo("main");
            }}
            className="md:hidden text-white px-3 py-2 rounded-lg font-semibold text-xs bg"
            style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)" }}
          >
            Book Now
          </button>
        </div>

        {/* Mobile tab strip */}
        <div
          className="md:hidden flex overflow-x-auto"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          {TABS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                scrollTo("main");
              }}
              className="flex-shrink-0 px-4 py-2 text-xs font-semibold tp"
              style={{
                background:
                  activeTab === id ? "rgba(255,255,255,0.12)" : "transparent",
                color: activeTab === id ? "white" : "rgba(255,255,255,0.55)",
                borderBottom:
                  activeTab === id
                    ? "2px solid #06b6d4"
                    : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Hero (hidden for Sports Massage) ── */}
      {!hideHero && (
        <section className="py-12 sm:py-20 relative overflow-hidden">
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.08,
              backgroundImage:
                "radial-gradient(circle at 20% 80%,#fff 0%,transparent 50%),radial-gradient(circle at 80% 20%,#fff 0%,transparent 50%)",
            }}
          />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#bae6fd",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Star className="w-3.5 h-3.5" fill="currentColor" /> Where
              Recovery Meets Convenience
            </div>
            <h2
              className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
              style={{ fontFamily: "Cormorant Garamond", lineHeight: 1.1 }}
            >
              Relax. Restore.
              <br />
              <span style={{ color: "#67e8f9" }}>Renew.</span>
            </h2>
            <p
              className="text-sm sm:text-lg mb-8 max-w-xl mx-auto px-4"
              style={{ color: "#bae6fd" }}
            >
              Expert massage therapy — at our studio or your doorstep.
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-4">
              {[
                ["📅 Book a Session", "booking"],
                ["🏃 Sports Massage", "sports"],
                ["👑 Monthly Membership", "membership"],
                ["🎁 Spa Gift Card", "giftcard"],
              ].map(([label, tab]) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    scrollTo("main");
                  }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm bg"
                  style={{
                    background:
                      activeTab === tab ? "white" : "rgba(255,255,255,0.15)",
                    color: activeTab === tab ? "#0891b2" : "white",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Main content ── */}
      <div id="main">
        {activeTab === "booking" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
            <BookingWizard />
          </div>
        )}

        {activeTab === "sports" && (
          <div className="pb-16">
            <SportsMassage />
          </div>
        )}

        {activeTab === "membership" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
            <MembershipSection sendEmail={sendEmail} />
          </div>
        )}

        {activeTab === "giftcard" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
            <GiftCardSection sendEmail={sendEmail} />
          </div>
        )}
      </div>

      {/* ── Testimonials ── */}
      <section
        className="py-12 sm:py-20"
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(4px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h3
              className="text-2xl sm:text-3xl font-bold text-white"
              style={{ fontFamily: "Cormorant Garamond" }}
            >
              What Our Clients Say
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
                className="rounded-2xl p-5 sm:p-6"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
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

      {/* ── Footer ── */}
      <footer className="py-10 sm:py-14" style={{ background: "#0c1a2e" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
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
                Your sanctuary for relaxation and rejuvenation. Book online or
                call us today.
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
                    <p className="font-semibold text-white">Studio Location</p>
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
                  <span className="font-semibold text-white">
                    9:00 AM – 6:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Mobile</span>
                  <span className="font-semibold text-white">
                    7:00 AM – 12:00 AM
                  </span>
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
            <p>Payment processing by Paystack</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VivifySpaWebsite;
