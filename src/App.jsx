import React, { useState, useEffect } from "react";
import {
  Phone,
  MapPin,
  Sparkles,
  Shield,
  Star,
  Gift,
  Crown,
  Check,
  ArrowLeft,
  Repeat,
  Pause,
} from "lucide-react";

import {
  SERVICES,
  MEMBERSHIP_PLAN,
  fmt,
  disc10,
  getPrice,
  durList,
  LOCATION_LABEL,
} from "./config/services";

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
  window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// MICRO COMPONENTS
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
          className={`font-semibold text-right max-w-[58%] truncate ${l === hi ? "text-base sm:text-lg" : ""}`}
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

const SectionHeading = ({ number, title, hint }) => (
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-1">
      <span
        className="text-xs font-black tracking-widest"
        style={{ color: "#db2777" }}
      >
        {number}
      </span>
      <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">
        {title}
      </span>
    </div>
    {hint && <p className="text-xs text-gray-400">{hint}</p>}
  </div>
);

const SubLabel = ({ children }) => (
  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
    {children}
  </p>
);

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERSHIP
// ─────────────────────────────────────────────────────────────────────────────
const MembershipSection = ({ sendEmail }) => {
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
    const data = {
      name: mName,
      phone: mPhone,
      email: mEmail,
      plan: plan.name,
      service: svcObj?.name,
      location: LOCATION_LABEL[mSvcType],
      duration: `${mDur} minutes`,
      sessions: plan.sessions,
      normalPrice: mBase(),
      discountedPerSession: mTotal(),
      monthlyAmount: mTotal(),
      savedPerMonth: mSaved(),
    };
    paystackPay({
      amount: mTotal(),
      email: mEmail,
      meta: [
        { display_name: "Member", variable_name: "member", value: mName },
        { display_name: "Plan", variable_name: "plan", value: plan.name },
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
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold tracking-wider uppercase"
          style={{
            background: "rgba(253,230,138,0.15)",
            color: "#fde68a",
            border: "1px solid rgba(253,230,138,0.3)",
          }}
        >
          <Crown className="w-3.5 h-3.5" /> Monthly Wellness Membership
        </div>
        <h2
          className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight"
          style={{ fontFamily: "Cormorant Garamond" }}
        >
          One massage a month.
          <br />
          <span style={{ color: "#fde68a" }}>Every month.</span>
        </h2>
        <p className="text-cyan-200 text-sm max-w-md mx-auto leading-relaxed">
          A simple way to keep your body happy. Book your monthly session
          whenever it suits you — we'll always have a slot for you.
        </p>
      </div>

      <div
        className="rounded-3xl overflow-hidden mb-6 shadow-2xl"
        style={{
          background:
            "linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,249,255,0.98))",
          border: "2px solid #fde68a",
        }}
      >
        <div
          className="px-6 py-5"
          style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{plan.icon}</div>
              <div>
                <p
                  className="font-bold text-white leading-tight"
                  style={{
                    fontFamily: "Cormorant Garamond",
                    fontSize: "1.35rem",
                  }}
                >
                  {plan.name}
                </p>
                <p className="text-xs text-cyan-50 mt-0.5">{plan.tagline}</p>
              </div>
            </div>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0"
              style={{ background: "#fef3c7", color: "#92400e" }}
            >
              SAVE 10%
            </span>
          </div>
        </div>

        <div className="px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
            What's included
          </p>
          <ul className="space-y-3 mb-6">
            {plan.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: "#ecfeff" }}
                >
                  {b.icon}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed pt-1.5">
                  {b.text}
                </p>
              </li>
            ))}
          </ul>

          <div className="space-y-5 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Location
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "studio", l: LOCATION_LABEL.studio, s: "Pay online" },
                  {
                    id: "mobile",
                    l: LOCATION_LABEL.mobile,
                    s: "Pay online too",
                  },
                ].map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setMSvcType(o.id)}
                    className="p-3 rounded-2xl border-2 text-left transition-all"
                    style={{
                      borderColor: mSvcType === o.id ? "#06b6d4" : "#e5e7eb",
                      background: mSvcType === o.id ? "#f0f9ff" : "white",
                    }}
                  >
                    <p className="font-bold text-gray-900 text-xs leading-tight">
                      {o.l}
                    </p>
                    <p
                      className="text-xs mt-1 font-semibold"
                      style={{ color: "#0891b2" }}
                    >
                      {o.s}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                Your monthly massage
              </p>
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

            {mSvc && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Session length
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {durList(mSvc).map((m) => {
                    const base = getPrice(mSvcType, mSvc, m);
                    const dp = disc10(base);
                    const sel = mDur === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setMDur(m)}
                        className="p-3 rounded-2xl border-2 text-center transition-all"
                        style={{
                          borderColor: sel ? "#06b6d4" : "#e5e7eb",
                          background: sel ? "#f0f9ff" : "white",
                        }}
                      >
                        <p className="font-bold text-gray-900 text-sm">
                          {m} min
                        </p>
                        <p className="text-xs text-gray-400 line-through mt-1">
                          {fmt(base)}
                        </p>
                        <p className="text-sm font-bold text-cyan-600">
                          {fmt(dp)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mSvc && mDur && (
              <div
                className="rounded-2xl p-4 flex items-center justify-between gap-3"
                style={{
                  background: "linear-gradient(135deg,#ecfeff,#cffafe)",
                  border: "2px solid #a5f3fc",
                }}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-700 mb-0.5">
                    Your monthly fee
                  </p>
                  <p className="text-xs text-cyan-600">
                    Billed monthly · cancel anytime
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-3xl font-bold leading-none"
                    style={{
                      fontFamily: "Cormorant Garamond",
                      color: "#0891b2",
                    }}
                  >
                    {fmt(mTotal())}
                  </p>
                  <p className="text-xs text-emerald-600 font-bold mt-1">
                    You save {fmt(mSaved())}/mo
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Your details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
            <div>
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
          </div>

          <button
            onClick={handleMembership}
            disabled={!mDone}
            className="w-full mt-6 py-4 rounded-2xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2"
            style={{
              background: mDone
                ? "linear-gradient(135deg,#0891b2,#06b6d4)"
                : "#d1d5db",
              cursor: mDone ? "pointer" : "not-allowed",
              boxShadow: mDone ? "0 6px 20px rgba(6,182,212,0.35)" : "none",
            }}
          >
            <Crown className="w-4 h-4" />
            {mSvc && mDur
              ? `Start Membership — ${fmt(mTotal())}/mo`
              : "Start Membership"}
          </button>
          <p className="text-xs text-center text-gray-400 mt-3">
            🔒 Secure via Paystack · 256-bit SSL · Cancel anytime
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Repeat, l: "Auto-renews", s: "Monthly" },
          { icon: Pause, l: "Pause anytime", s: "No penalty" },
          { icon: Shield, l: "Secure billing", s: "Paystack" },
        ].map(({ icon: Icon, l, s }) => (
          <div
            key={l}
            className="rounded-2xl p-3 text-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Icon
              className="w-4 h-4 mx-auto mb-1.5"
              style={{ color: "#67e8f9" }}
            />
            <p className="text-xs font-bold text-white">{l}</p>
            <p className="text-xs text-cyan-200 mt-0.5">{s}</p>
          </div>
        ))}
      </div>

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
              style={{ border: "3px solid #e5e7eb", borderTopColor: "#06b6d4" }}
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
              ["Monthly massage", mDetails.service],
              ["Session", mDetails.duration],
              ["Location", mDetails.location],
              ["Monthly", fmt(mDetails.monthlyAmount)],
              ["You save", fmt(mDetails.savedPerMonth)],
              ["Ref", mDetails.ref],
            ]}
            hi="Monthly"
          />
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-4 text-xs text-amber-800 leading-relaxed">
            <b>What's next?</b> We'll reach out on WhatsApp to schedule your
            first monthly session.
          </div>
          <button
            onClick={() =>
              sendWA(
                `Hello Vivify! 👑\n\nI just joined ${mDetails.plan}!\n\n👤 ${mDetails.name}\n📱 ${mDetails.phone}\n💆 ${mDetails.service} (${mDetails.duration})\n📍 ${mDetails.location}\n💰 ${fmt(mDetails.monthlyAmount)}/month\n🔗 ${mDetails.ref}\n\nPlease help me schedule my first session.`,
              )
            }
            className="w-full py-3 rounded-xl font-semibold text-sm text-white mb-2"
            style={{ background: "#25D366" }}
          >
            💬 Send Details via WhatsApp
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
// GIFT CARD
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
      location: LOCATION_LABEL[gSvcType],
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
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold tracking-wider uppercase"
          style={{
            background: "rgba(252,231,243,0.15)",
            color: "#fbcfe8",
            border: "1px solid rgba(252,231,243,0.3)",
          }}
        >
          <Gift className="w-3.5 h-3.5" /> Spa Gift Card
        </div>
        <h2
          className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight"
          style={{ fontFamily: "Cormorant Garamond" }}
        >
          Give the Gift
          <br />
          <span style={{ color: "#fbcfe8" }}>of Wellness.</span>
        </h2>
        <p className="text-cyan-200 text-sm max-w-md mx-auto leading-relaxed">
          A beautiful, personalised gift. We'll reach out to both of you to
          arrange the session.
        </p>
      </div>

      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-200 mb-3 px-1">
          Live preview
        </p>
        <div
          className="rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(135deg,#db2777,#9d174d,#831843)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -60,
              left: -40,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(255,255,255,0.08) 0%,transparent 70%)",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <Sparkles className="w-4 h-4 text-pink-100" />
                </div>
                <div>
                  <p
                    className="font-bold text-sm leading-tight"
                    style={{ fontFamily: "Cormorant Garamond" }}
                  >
                    Vivify Massage & Spa
                  </p>
                  <p
                    className="text-xs leading-tight"
                    style={{ color: "#fbcfe8" }}
                  >
                    Gift Card
                  </p>
                </div>
              </div>
              <Gift className="w-5 h-5 text-pink-200" />
            </div>
            <p
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: "#fbcfe8" }}
            >
              A gift for
            </p>
            <p
              className="text-2xl sm:text-3xl font-bold mb-1"
              style={{ fontFamily: "Cormorant Garamond" }}
            >
              {gRName || "Their Name"}
            </p>
            <p
              className="text-sm italic mb-6 mt-3 px-4 py-3 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "#fce7f3",
                borderLeft: "3px solid #f9a8d4",
              }}
            >
              "{gCaption || "Wishing you pure relaxation 💆"}"
            </p>
            <div className="flex justify-between items-end pt-4 border-t border-white/20">
              <div>
                <p className="text-xs" style={{ color: "#fbcfe8" }}>
                  {gSvc
                    ? SERVICES.find((s) => s.id === gSvc)?.name
                    : "Select a service"}
                </p>
                {gDur && (
                  <p className="text-xs mt-0.5" style={{ color: "#fbcfe8" }}>
                    {gDur} minutes ·{" "}
                    {gSvcType === "studio"
                      ? "Our Home Studio"
                      : "Your Home or Hotel"}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: "#f9a8d4" }}>
                  From {gBName || "Your Name"}
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-xs uppercase tracking-wider"
                  style={{ color: "#fbcfe8" }}
                >
                  Value
                </p>
                <p
                  className="text-3xl sm:text-4xl font-bold leading-none"
                  style={{ fontFamily: "Cormorant Garamond" }}
                >
                  {gPrice() ? fmt(gPrice()) : "₦—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FC>
        <SectionHeading
          number="01"
          title="Design the gift"
          hint="Choose the treatment you'd like to give"
        />
        <div className="mb-5">
          <SubLabel>Location</SubLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: "studio", l: LOCATION_LABEL.studio },
              { id: "mobile", l: LOCATION_LABEL.mobile },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => setGSvcType(o.id)}
                className="p-4 rounded-2xl border-2 text-left transition-all"
                style={{
                  borderColor: gSvcType === o.id ? "#db2777" : "#e5e7eb",
                  background: gSvcType === o.id ? "#fdf2f8" : "white",
                }}
              >
                <span className="font-bold text-gray-900 text-sm">{o.l}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <SubLabel>Massage</SubLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SERVICES.map((svc) => (
              <button
                key={svc.id}
                onClick={() => setGSvc(svc.id)}
                className="p-3 rounded-2xl border-2 flex items-center gap-3 text-left transition-all"
                style={{
                  borderColor: gSvc === svc.id ? "#db2777" : "#e5e7eb",
                  background: gSvc === svc.id ? "#fdf2f8" : "white",
                }}
              >
                <span className="text-xl">{svc.icon}</span>
                <span className="font-semibold text-gray-900 text-sm flex-1">
                  {svc.name}
                </span>
                {gSvc === svc.id && (
                  <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        {gSvc && (
          <div className="mb-5">
            <SubLabel>Duration</SubLabel>
            <div className="grid grid-cols-3 gap-2">
              {durList(gSvc).map((m) => (
                <button
                  key={m}
                  onClick={() => setGDur(m)}
                  className="p-3 rounded-2xl border-2 text-center transition-all"
                  style={{
                    borderColor: gDur === m ? "#db2777" : "#e5e7eb",
                    background: gDur === m ? "#fdf2f8" : "white",
                  }}
                >
                  <p className="font-bold text-gray-900 text-sm">{m} min</p>
                  <p className="text-sm font-bold text-pink-600 mt-1">
                    {fmt(getPrice(gSvcType, gSvc, m))}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <SubLabel>Personal message</SubLabel>
          <textarea
            value={gCaption}
            onChange={(e) => setGCaption(e.target.value)}
            rows={3}
            placeholder="Wishing you a year of calm and strength 💆"
            className="w-full p-4 rounded-2xl text-sm resize-none border-2 border-gray-200 focus:border-pink-400 transition-all"
          />
          <p className="text-xs text-gray-400 mt-2">
            This message appears on the gift card the recipient receives.
          </p>
        </div>
      </FC>

      <div className="mt-5">
        <FC>
          <SectionHeading
            number="02"
            title="Your details"
            hint="So we can send you the receipt"
          />
          <div className="space-y-4">
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
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Email *
              </label>
              <input
                type="email"
                value={gBEmail}
                onChange={(e) => setGBEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full p-4 rounded-2xl text-sm border-2 transition-all"
                style={{
                  borderColor: gBEmail ? "#db2777" : "#e5e7eb",
                  background: gBEmail ? "#fdf2f8" : "white",
                }}
              />
            </div>
          </div>
        </FC>
      </div>

      <div className="mt-5">
        <FC>
          <SectionHeading
            number="03"
            title="Who's receiving it?"
            hint="Provide at least one way for us to reach them"
          />
          <div className="space-y-4">
            <TF
              label="Recipient's Full Name *"
              value={gRName}
              onChange={setGRName}
              placeholder="Their name"
            />
            <PF
              label="Recipient's Phone"
              value={gRPhone}
              error={gRPhoneErr}
              onChange={(v) => onPhone(v, setGRPhone, setGRPhoneErr)}
            />
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Recipient's Email
              </label>
              <input
                type="email"
                value={gREmail}
                onChange={(e) => setGREmail(e.target.value)}
                placeholder="recipient@email.com"
                className="w-full p-4 rounded-2xl text-sm border-2 transition-all"
                style={{
                  borderColor: gREmail ? "#db2777" : "#e5e7eb",
                  background: gREmail ? "#fdf2f8" : "white",
                }}
              />
              <p className="text-xs text-gray-400 mt-2">
                If you provide their email, we'll send them a beautiful gift
                notification directly.
              </p>
            </div>
          </div>
        </FC>
      </div>

      <div className="mt-5">
        <FC>
          {gSvc && gPrice() > 0 && (
            <div
              className="rounded-2xl p-4 mb-5 flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg,#fdf2f8,#fce7f3)",
                border: "2px solid #fbcfe8",
              }}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-pink-700 mb-0.5">
                  Gift value
                </p>
                <p className="text-sm text-gray-700">
                  {SERVICES.find((s) => s.id === gSvc)?.name} · {gDur} min
                </p>
              </div>
              <p
                className="text-3xl font-bold leading-none"
                style={{ fontFamily: "Cormorant Garamond", color: "#db2777" }}
              >
                {fmt(gPrice())}
              </p>
            </div>
          )}
          <button
            onClick={handleGift}
            disabled={!gDone}
            className="w-full py-4 rounded-2xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2"
            style={{
              background: gDone
                ? "linear-gradient(135deg,#db2777,#ec4899)"
                : "#d1d5db",
              cursor: gDone ? "pointer" : "not-allowed",
              boxShadow: gDone ? "0 6px 20px rgba(219,39,119,0.35)" : "none",
            }}
          >
            <Gift className="w-4 h-4" />
            {gPrice() > 0
              ? `Purchase Gift Card — ${fmt(gPrice())}`
              : "Purchase Gift Card"}
          </button>
          <p className="text-xs text-center text-gray-400 mt-3">
            🔒 Secure via Paystack · Confirmation emails to you
            {gREmail ? " and the recipient" : ""}
          </p>
        </FC>
      </div>

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
              style={{ border: "3px solid #e5e7eb", borderTopColor: "#db2777" }}
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
              Confirmation sent to <b>{gDetails.buyerEmail}</b>
              {gDetails.recipientEmail ? (
                <>
                  {" "}
                  and <b>{gDetails.recipientEmail}</b>
                </>
              ) : null}
            </p>
          </div>
          <div
            className="rounded-2xl p-5 mb-4 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#db2777,#9d174d)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-pink-200" />
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
            <p className="text-xs italic mb-3" style={{ color: "#fbcfe8" }}>
              "{gDetails.caption}"
            </p>
            <div className="flex justify-between items-end pt-3 border-t border-white/20">
              <div>
                <p className="text-xs" style={{ color: "#fbcfe8" }}>
                  {gDetails.service}
                </p>
                <p className="text-xs" style={{ color: "#f9a8d4" }}>
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
              ["Recipient", gDetails.recipientName],
              ["Value", fmt(gDetails.amount)],
            ]}
            hi="Value"
          />
          <div className="rounded-xl bg-pink-50 border border-pink-200 p-3 mb-4 text-xs text-pink-800 leading-relaxed">
            <b>What's next?</b> We'll reach out to {gDetails.recipientName} to
            arrange their session. You'll both get an email confirmation.
          </div>
          <button
            onClick={() =>
              sendWA(
                `Hello Vivify! 🎁\n\nGift card:\n👤 Buyer: ${gDetails.buyerName}\n🎁 Recipient: ${gDetails.recipientName}\n💆 ${gDetails.service}\n💰 ${fmt(gDetails.amount)}\n💬 "${gDetails.caption}"\n🔗 ${gDetails.ref}`,
              )
            }
            className="w-full py-3 rounded-xl font-semibold text-sm text-white mb-2"
            style={{ background: "#25D366" }}
          >
            💬 Send Details via WhatsApp
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

  const [bookingCity, setBookingCity] = useState(null);
  const [preselectedService, setPreselectedService] = useState("");

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
    }
  };

  const switchTab = (id) => {
    setActiveTab(id);
    if (id === "booking" && bookingCity === "ilorin") {
      // Keep ilorin state
    } else if (id === "booking") {
      setBookingCity(null);
    }
    // FIX: Scroll window to the very top on tab switch
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectService = (serviceId) => {
    setPreselectedService(serviceId);
    document
      .getElementById("wizard-start")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const hideHero =
    activeTab === "sports" || (activeTab === "booking" && !bookingCity);

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
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideInFromBottom { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .animate-in { animation: fadeIn 0.5s ease-out; }
        .slide-in-from-bottom-4 { animation: slideInFromBottom 0.5s cubic-bezier(.16,1,.3,1); }
        input,textarea,select,button { outline:none; font-family:inherit }
        button { -webkit-tap-highlight-color:transparent }
        * { box-sizing:border-box }
        @media (max-width:768px){ input, textarea, select { font-size: 16px !important; } }
      `}</style>

      <header
        className="hidden md:block sticky top-0 z-40"
        style={{
          background: "rgba(12,74,110,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
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
              <Star className="w-3.5 h-3.5" fill="currentColor" /> Where
              Recovery Meets Convenience
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

      <div id="main" className="min-h-screen">
        {activeTab === "booking" && (
          <div className="px-4 sm:px-6">
            {!bookingCity && <LocationGate onSelectCity={setBookingCity} />}

            {bookingCity === "ilorin" && (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-center mb-6">
                  <button
                    onClick={() => setBookingCity(null)}
                    className="text-xs font-semibold text-cyan-200 hover:text-white transition-colors flex items-center gap-1"
                  >
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
                style={{ color: active ? "white" : "rgba(255,255,255,0.5)" }}
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
                  style={{ transform: active ? "scale(1.15)" : "scale(1)" }}
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
