import React, { useState, useEffect } from "react";
import {
  Phone,
  MapPin,
  Sparkles,
  Home,
  Building2,
  User,
  Check,
  X,
  AlertCircle,
  Shield,
  Star,
  Gift,
  Crown,
  Clock,
  Calendar,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "vivifymassageandspa@gmail.com";
const PAYSTACK_KEY = "pk_live_915663b76742c16f999c99e6251596ee7c5c9584";
const BOOKING_URL = "https://vivifymassageandspa.online";
const WA_NUMBER = "2347040723894";

// ─────────────────────────────────────────────────────────────────────────────
// PRICING
// ─────────────────────────────────────────────────────────────────────────────
const PRICING = {
  studio: {
    swedish: { 60: 25000, 90: 35000, 120: 50000 },
    "deep-tissue": { 60: 30000, 90: 40000, 120: 50000 },
    "full-body": { 60: 30000, 90: 40000, 120: 50000 },
    sports: { 60: 50000 },
  },
  mobile: {
    swedish: { 60: 35000, 90: 45000, 120: 65000 },
    "deep-tissue": { 60: 40000, 90: 55000, 120: 70000 },
    "full-body": { 60: 40000, 90: 55000, 120: 70000 },
    sports: { 60: 70000 },
  },
};

const SERVICES = [
  {
    id: "swedish",
    name: "Swedish Relaxation",
    desc: "Gentle, flowing strokes for relaxation and improved circulation.",
    image: "/assets/swedish_massage.jpg",
    badge: "Popular",
    bc: "bg-emerald-100 text-emerald-700",
    icon: "🌿",
  },
  {
    id: "deep-tissue",
    name: "Deep Tissue Recovery",
    desc: "Targeted pressure to release chronic tension and aid recovery.",
    image: "/assets/deep_tissue.jpg",
    badge: "Standard",
    bc: "bg-amber-100 text-amber-700",
    icon: "💪",
  },
  {
    id: "full-body",
    name: "Full Body Rejuvenation",
    desc: "Head-to-toe treatment combining multiple techniques for total renewal.",
    image: "/assets/engin_akyurt-massage-7452918_1920.jpg",
    badge: "Premium",
    bc: "bg-violet-100 text-violet-700",
    icon: "✨",
  },
  {
    id: "sports",
    name: "Sports Massage",
    desc: "Enhances performance, reduces injury risk and speeds up recovery.",
    image: "/assets/sport_massage.jpg",
    badge: "Athletic",
    bc: "bg-cyan-100 text-cyan-700",
    icon: "⚡",
    maleOnly: true,
  },
];

const STUDIO_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];
const MOBILE_SLOTS = [
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
  "11:00 PM",
  "12:00 AM",
];

const MEM_PLANS = [
  {
    id: "duo",
    label: "Duo Renewal",
    sessions: 2,
    desc: "Two sessions per month — same or mix different services. Ideal for consistent maintenance.",
    icon: "🌿",
    tag: "Popular",
  },
  {
    id: "quad",
    label: "Quad Transformation",
    sessions: 4,
    desc: "Four sessions per month for serious recovery, performance, and total body transformation.",
    icon: "⚡",
    tag: "Best Value",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (n) => `₦${Number(n).toLocaleString()}`;
const disc10 = (n) => Math.round(n * 0.9);
const getPrice = (type, svc, dur) => PRICING[type]?.[svc]?.[dur] || 0;
const durList = (svc) =>
  svc ? Object.keys(PRICING.studio[svc] || {}).map(Number) : [60, 90, 120];
const todayStr = () => new Date().toISOString().split("T")[0];
const maxStr = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const VivifySpaWebsite = () => {
  const [activeTab, setActiveTab] = useState("booking");

  // Booking
  const [selSvc, setSelSvc] = useState("");
  const [svcType, setSvcType] = useState("studio");
  const [therapist, setTherapist] = useState("");
  const [dur, setDur] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cPhoneErr, setCPhoneErr] = useState("");
  const [payOpt, setPayOpt] = useState("full");
  const [bLoading, setBLoading] = useState(false);
  const [bSuccess, setBSuccess] = useState(false);
  const [bPayModal, setBPayModal] = useState(false);
  const [bDetails, setBDetails] = useState(null);
  const [countdown, setCountdown] = useState(5);

  // Membership
  const [mSvcType, setMSvcType] = useState("studio");
  const [mSvc, setMSvc] = useState("");
  const [mDur, setMDur] = useState("");
  const [mPlan, setMPlan] = useState("duo");
  const [mName, setMName] = useState("");
  const [mPhone, setMPhone] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mPhoneErr, setMPhoneErr] = useState("");
  const [mLoading, setMLoading] = useState(false);
  const [mSuccess, setMSuccess] = useState(false);
  const [mDetails, setMDetails] = useState(null);

  // Gift Card
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

  // ── Derived ──────────────────────────────────────────────────────
  const bPrice = () => getPrice(svcType, selSvc, dur);
  const bPay = () =>
    svcType === "studio" && payOpt === "deposit" ? bPrice() * 0.5 : bPrice();
  const mBase = () => getPrice(mSvcType, mSvc, mDur);
  const planSess = () => MEM_PLANS.find((p) => p.id === mPlan)?.sessions || 2;
  const mTotal = () => planSess() * disc10(mBase());
  const gPrice = () => getPrice(gSvcType, gSvc, gDur);

  const bDone = !!(
    selSvc &&
    svcType &&
    therapist &&
    dur &&
    date &&
    time &&
    cName &&
    cPhone &&
    cPhone.replace(/\D/g, "").length >= 11
  );
  const mDone = !!(
    mSvc &&
    mSvcType &&
    mName &&
    mPhone &&
    mPhone.replace(/\D/g, "").length >= 11 &&
    mEmail &&
    mDur
  );
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
  const steps = [
    !!svcType,
    !!selSvc,
    !!therapist,
    !!dur,
    !!date,
    !!time,
    !!(cName && cPhone && cPhone.replace(/\D/g, "").length >= 11),
    true,
  ].filter(Boolean).length;

  // ── Paystack script ─────────────────────────────────────────────
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    document.head.appendChild(s);
    return () => {
      document.head.contains(s) && document.head.removeChild(s);
    };
  }, []);

  useEffect(() => {
    if (selSvc === "sports") {
      setTherapist("male");
      setDur(60);
    } else if (selSvc && dur && !durList(selSvc).includes(Number(dur)))
      setDur("");
  }, [selSvc, dur]);

  useEffect(() => {
    if (mSvc === "sports") setMDur(60);
    else if (mSvc && mDur && !durList(mSvc).includes(Number(mDur))) setMDur("");
  }, [mSvc, mDur]);

  useEffect(() => {
    if (gSvc === "sports") setGDur(60);
    else if (gSvc && gDur && !durList(gSvc).includes(Number(gDur))) setGDur("");
  }, [gSvc, gDur]);

  useEffect(() => {
    let t;
    if (bSuccess && svcType === "studio" && bDetails) {
      t = setInterval(
        () =>
          setCountdown((p) => {
            if (p <= 1) {
              clearInterval(t);
              doRedirect(bDetails);
              return 0;
            }
            return p - 1;
          }),
        1000,
      );
    }
    return () => t && clearInterval(t);
  }, [bSuccess, svcType, bDetails]);

  const doRedirect = (d) => {
    const p = new URLSearchParams({
      booking_id: d.ref || `VMS_${Date.now()}`,
      customer_name: d.customerName,
      status: "confirmed",
    });
    window.location.href = `${BOOKING_URL}/confirmation?${p}`;
  };

  // ── Send email via Resend serverless function ────────────────────
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
        "Booking confirmed, but email notification to admin could not be sent. WhatsApp sent.",
      );
    }
  };

  // ── WhatsApp – opens in same tab (no popup) ─────────────────────
  const sendWA = (msg) => {
    window.location.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  // ── Fire emails (booking, membership, gift) ─────────────────────
  const fireBookingEmails = async (d) => {
    await sendEmail("booking", d);
  };

  const fireMembershipEmails = async (d) => {
    await sendEmail("membership", d);
  };

  const fireGiftEmails = async (d) => {
    await sendEmail("gift", d);
  };

  // ── Paystack ──────────────────────────────────────────────────────
  const paystackPay = ({ amount, meta, onSuccess }) => {
    if (!window.PaystackPop) {
      alert("Payment system loading. Please try again in a moment.");
      return;
    }
    window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: "customer@vivifymassageandspa.online",
      amount: amount * 100,
      currency: "NGN",
      ref: `VMS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      metadata: { custom_fields: meta },
      callback: (res) => onSuccess(res),
      onClose: () => alert("Payment cancelled. Contact us at 07040723894."),
    }).openIframe();
  };

  // ── Booking submit ────────────────────────────────────────────────
  const handleBooking = async () => {
    if (!bDone) {
      alert("Please complete all fields.");
      return;
    }
    setBLoading(true);
    const svcObj = SERVICES.find((s) => s.id === selSvc);
    const data = {
      customerName: cName,
      customerPhone: cPhone,
      service: svcObj?.name,
      serviceType: svcType === "studio" ? "Home Studio" : "Mobile Service",
      therapist:
        therapist === "male"
          ? "Male"
          : therapist === "female"
            ? "Female"
            : "No Preference",
      duration: `${dur} minutes`,
      appointmentDate: date,
      appointmentTime: time,
      totalAmount: bPrice(),
      paymentAmount: bPay(),
      paymentType:
        svcType === "studio"
          ? payOpt === "full"
            ? "Full Payment"
            : "50% Deposit"
          : "Pay After Session",
    };
    await new Promise((r) => setTimeout(r, 800));
    if (svcType === "studio") {
      setBLoading(false);
      setBDetails(data);
      setBPayModal(true);
      return;
    }
    // Mobile service: send admin email immediately
    await fireBookingEmails({ ...data, ref: "—" });
    setBDetails(data);
    setBLoading(false);
    setBSuccess(true);
    setCountdown(5);
  };

  const handlePaystackBooking = (d) =>
    paystackPay({
      amount: d.paymentAmount,
      meta: [
        {
          display_name: "Customer",
          variable_name: "customer",
          value: d.customerName,
        },
        { display_name: "Service", variable_name: "service", value: d.service },
      ],
      onSuccess: async (res) => {
        const u = { ...d, ref: res.reference, paymentStatus: "Paid" };
        await fireBookingEmails(u);
        setBDetails(u);
        setBPayModal(false);
        setBSuccess(true);
        setCountdown(5);
      },
    });

  // ── Membership submit ─────────────────────────────────────────────
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
      meta: [
        { display_name: "Member", variable_name: "member", value: mName },
        { display_name: "Plan", variable_name: "plan", value: plan?.label },
      ],
      onSuccess: async (res) => {
        const u = { ...data, ref: res.reference };
        await fireMembershipEmails(u);
        setMDetails(u);
        setMLoading(false);
        setMSuccess(true);
      },
    });
    setMLoading(false);
  };

  // ── Gift Card submit ──────────────────────────────────────────────
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
      duration: gSvc === "sports" ? "60 minutes" : `${gDur} minutes`,
      caption: gCaption || "Wishing you pure relaxation 💆",
      amount: gPrice(),
    };
    paystackPay({
      amount: gPrice(),
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
        await fireGiftEmails(u);
        setGDetails(u);
        setGLoading(false);
        setGSuccess(true);
      },
    });
    setGLoading(false);
  };

  const onPhone = (v, set, setErr) => {
    set(v);
    const d = v.replace(/\D/g, "");
    setErr(d.length > 0 && d.length < 11 ? "Must be 11 digits" : "");
  };
  const resetB = () => {
    setSelSvc("");
    setTherapist("");
    setDur("");
    setDate("");
    setTime("");
    setCName("");
    setCPhone("");
    setCPhoneErr("");
    setPayOpt("full");
    setBDetails(null);
  };
  const closeB = () => {
    setBSuccess(false);
    setBPayModal(false);
    resetB();
  };
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
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
        @keyframes scale-in{from{opacity:0;transform:scale(0.94) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .m-enter{animation:scale-in 0.25s cubic-bezier(.16,1,.3,1)}
        .ch{transition:all 0.2s ease}.ch:hover{transform:translateY(-2px)}
        .bg{transition:all 0.18s ease}.bg:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(6,182,212,0.4)}
        .tp{transition:all 0.2s ease}
        input,textarea,select{outline:none}
        input[type=date]::-webkit-calendar-picker-indicator{opacity:0.6;cursor:pointer}
        *{box-sizing:border-box}
      `}</style>

      {/* ── Spinner ── */}
      {(bLoading || mLoading || gLoading) && (
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
            ></div>
            <p
              className="font-bold text-gray-900"
              style={{ fontFamily: "Cormorant Garamond", fontSize: 18 }}
            >
              Processing…
            </p>
          </div>
        </div>
      )}

      {/* ── Booking: Pay Modal ── */}
      {bPayModal && bDetails && svcType === "studio" && (
        <Modal onClose={() => setBPayModal(false)}>
          <ModalHeader
            icon="💳"
            title="Complete Payment"
            sub={`Pay ${payOpt === "deposit" ? "50% deposit" : "in full"} to lock your session`}
          />
          <SBox
            rows={[
              ["Name", bDetails.customerName],
              ["Service", bDetails.service],
              ["Duration", bDetails.duration],
              [
                "Date & Time",
                `${bDetails.appointmentDate} · ${bDetails.appointmentTime}`,
              ],
              ["Amount to Pay", fmt(bDetails.paymentAmount)],
            ]}
            hi="Amount to Pay"
          />
          <Btn color="green" onClick={() => handlePaystackBooking(bDetails)}>
            Pay Securely with Paystack →
          </Btn>
          <SecureNote />
        </Modal>
      )}

      {/* ── Booking: Success ── */}
      {bSuccess && bDetails && (
        <Modal onClose={closeB}>
          <SuccessIcon />
          <h3
            className="text-2xl font-bold text-gray-900 text-center mb-1"
            style={{ fontFamily: "Cormorant Garamond" }}
          >
            {svcType === "studio" ? "Payment Confirmed!" : "Booking Confirmed!"}
          </h3>
          <SBox
            rows={[
              ["Ref", bDetails.ref || `VMS_${Date.now().toString().slice(-8)}`],
              ["Name", bDetails.customerName],
              ["Service", bDetails.service],
              [
                "Date & Time",
                `${bDetails.appointmentDate} · ${bDetails.appointmentTime}`,
              ],
              ["Amount", fmt(bDetails.paymentAmount)],
            ]}
            hi="Amount"
          />
          {svcType === "studio" ? (
            <div>
              <p className="text-center text-sm text-gray-500 mb-3">
                Redirecting in <b style={{ color: "#0891b2" }}>{countdown}s</b>…
              </p>
              <Btn color="blue" onClick={() => doRedirect(bDetails)}>
                Go to Confirmation →
              </Btn>
              {/* ── WhatsApp button (same tab) ── */}
              <Btn
                color="whatsapp"
                onClick={() =>
                  sendWA(
                    `Hello Vivify Massage & Spa! 🌟\n\nMy booking details:\n👤 Name: ${bDetails.customerName}\n📱 Phone: ${bDetails.customerPhone}\n💆 Service: ${bDetails.service}\n📍 Location: ${bDetails.serviceType}\n👥 Therapist: ${bDetails.therapist}\n⏱️ Duration: ${bDetails.duration}\n📅 Date: ${bDetails.appointmentDate}\n🕐 Time: ${bDetails.appointmentTime}\n💰 Amount: ${fmt(bDetails.paymentAmount)}\n🔗 Ref: ${bDetails.ref || "—"}\n\nPlease confirm my appointment. Thank you!`,
                  )
                }
              >
                💬 Send Details via WhatsApp
              </Btn>
              <Btn color="ghost" onClick={closeB}>
                Stay Here
              </Btn>
            </div>
          ) : (
            <div>
              <div
                className="flex gap-2 rounded-xl p-3 mb-3 text-xs"
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1e40af",
                }}
              >
                <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Our team will call to confirm. Payment is collected after your
                  session.
                </span>
              </div>
              {/* ── WhatsApp button (same tab) ── */}
              <Btn
                color="whatsapp"
                onClick={() =>
                  sendWA(
                    `Hello Vivify Massage & Spa! 🌟\n\nMy booking details:\n👤 Name: ${bDetails.customerName}\n📱 Phone: ${bDetails.customerPhone}\n💆 Service: ${bDetails.service}\n📍 Location: ${bDetails.serviceType}\n👥 Therapist: ${bDetails.therapist}\n⏱️ Duration: ${bDetails.duration}\n📅 Date: ${bDetails.appointmentDate}\n🕐 Time: ${bDetails.appointmentTime}\n💰 Amount: ${fmt(bDetails.paymentAmount)} (Pay after session)\n🔗 Ref: ${bDetails.ref || "—"}\n\nPlease confirm my appointment. Thank you!`,
                  )
                }
              >
                💬 Send Details via WhatsApp
              </Btn>
              <Btn color="blue" onClick={closeB}>
                Done
              </Btn>
            </div>
          )}
        </Modal>
      )}

      {/* ── Membership: Success ── */}
      {mSuccess && mDetails && (
        <Modal
          onClose={() => {
            setMSuccess(false);
            setMName("");
            setMPhone("");
            setMEmail("");
            setMSvc("");
            setMDur("");
            setMDetails(null);
          }}
        >
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
          {/* ── WhatsApp button (same tab) ── */}
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
          <Btn
            color="blue"
            onClick={() => {
              setMSuccess(false);
              setMName("");
              setMPhone("");
              setMEmail("");
              setMSvc("");
              setMDur("");
              setMDetails(null);
            }}
          >
            Done
          </Btn>
        </Modal>
      )}

      {/* ── Gift Card: Success ── */}
      {gSuccess && gDetails && (
        <Modal
          onClose={() => {
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
          }}
        >
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
          {/* Gift card visual */}
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
            ></div>
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
          {/* ── WhatsApp button (same tab) ── */}
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
          <Btn
            color="pink"
            onClick={() => {
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
            }}
          >
            Done
          </Btn>
        </Modal>
      )}

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
            {[
              ["booking", "📅 Book Session"],
              ["membership", "👑 Membership"],
              ["giftcard", "🎁 Spa Gift Card"],
            ].map(([id, label]) => (
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
        {/* Mobile tabs */}
        <div
          className="md:hidden flex"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          {[
            ["booking", "📅 Book"],
            ["membership", "👑 Members"],
            ["giftcard", "🎁 Gift"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                scrollTo("main");
              }}
              className="flex-1 py-2 text-xs font-semibold tp"
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

      {/* ── Hero ── */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              "radial-gradient(circle at 20% 80%,#fff 0%,transparent 50%),radial-gradient(circle at 80% 20%,#fff 0%,transparent 50%)",
          }}
        ></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#bae6fd",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Star className="w-3.5 h-3.5" fill="currentColor" /> Where Recovery
            Meets Convenience
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

      {/* ── Main ── */}
      <div id="main" className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        {/* ════════════ BOOKING ════════════ */}
        {activeTab === "booking" && (
          <div>
            {/* Progress */}
            <div
              className="mb-5 rounded-2xl p-4 sm:p-5"
              style={{ background: "rgba(255,255,255,0.95)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Booking Progress
                </p>
                <p
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: "#0891b2" }}
                >
                  {steps}/8 steps
                </p>
              </div>
              <div
                className="h-2 rounded-full"
                style={{ background: "#e5e7eb" }}
              >
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(steps / 8) * 100}%`,
                    background: "linear-gradient(90deg,#0891b2,#06b6d4)",
                    transition: "width 0.4s ease",
                  }}
                ></div>
              </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-5 sm:gap-6">
              <div className="lg:col-span-2 space-y-4 sm:space-y-5">
                {/* 1 Location */}
                <FC>
                  <SH n={1} title="Choose Location" done={!!svcType} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {[
                      {
                        id: "studio",
                        label: "Home Studio",
                        sub: "Private, premium studio space",
                        note: "💳 Online payment required",
                        icon: <Building2 className="w-4 h-4" />,
                      },
                      {
                        id: "mobile",
                        label: "Mobile Service",
                        sub: "Your home or hotel",
                        note: "💰 Pay after session",
                        icon: <Home className="w-4 h-4" />,
                      },
                    ].map((o) => (
                      <SC
                        key={o.id}
                        sel={svcType === o.id}
                        onClick={() => setSvcType(o.id)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-400">{o.icon}</span>
                          <span className="font-bold text-gray-900 text-sm">
                            {o.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{o.sub}</p>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: "#0891b2" }}
                        >
                          {o.note}
                        </p>
                      </SC>
                    ))}
                  </div>
                </FC>

                {/* 2 Service */}
                <FC>
                  <SH n={2} title="Choose Therapy" done={!!selSvc} />
                  <div className="space-y-3 mt-4">
                    {SERVICES.map((svc) => (
                      <div
                        key={svc.id}
                        onClick={() => setSelSvc(svc.id)}
                        className={`p-3 sm:p-4 rounded-xl cursor-pointer ch border-2 flex items-start gap-3 sm:gap-4 ${selSvc === svc.id ? "border-cyan-500 bg-cyan-50" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <img
                          src={svc.image}
                          alt={svc.name}
                          className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span>{svc.icon}</span>
                            <span className="font-bold text-gray-900 text-sm">
                              {svc.name}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${svc.bc}`}
                            >
                              {svc.badge}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                            {svc.desc}
                          </p>
                          {svc.maleOnly && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">
                              👨 Male therapist only
                            </span>
                          )}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {Object.entries(PRICING[svcType][svc.id]).map(
                              ([m, p]) => {
                                const multi =
                                  Object.keys(PRICING[svcType][svc.id]).length >
                                  1;
                                return (
                                  <span
                                    key={m}
                                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                      background: "#f0f9ff",
                                      color: "#0891b2",
                                      border: "1px solid #bae6fd",
                                    }}
                                  >
                                    {multi ? `${m}min · ` : ""}
                                    {fmt(p)}
                                  </span>
                                );
                              },
                            )}
                          </div>
                        </div>
                        {selSvc === svc.id && <Tick />}
                      </div>
                    ))}
                  </div>
                </FC>

                {/* 3 Therapist */}
                <FC>
                  <SH n={3} title="Therapist Preference" done={!!therapist} />
                  {selSvc === "sports" && (
                    <IB text="Sports Massage is performed by male therapists only." />
                  )}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
                    {[
                      {
                        id: "any",
                        l: "No Preference",
                        s: "Earliest available",
                      },
                      { id: "female", l: "Female", s: "Specific request" },
                      { id: "male", l: "Male", s: "Specific request" },
                    ].map((o) => {
                      const dis = selSvc === "sports" && o.id !== "male";
                      return (
                        <button
                          key={o.id}
                          onClick={() => !dis && setTherapist(o.id)}
                          disabled={dis}
                          className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-all ${therapist === o.id ? "border-cyan-500 bg-cyan-50" : dis ? "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <User className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1.5 text-gray-500" />
                          <p className="text-xs font-bold text-gray-900 leading-tight">
                            {o.l}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">
                            {o.s}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </FC>

                {/* 4 Duration */}
                <FC>
                  <SH n={4} title="Session Duration" done={!!dur} />
                  {selSvc === "sports" ? (
                    <div
                      className="mt-4 p-4 rounded-xl border-2"
                      style={{ borderColor: "#06b6d4", background: "#f0f9ff" }}
                    >
                      <p className="text-xs font-semibold text-gray-500 mb-1">
                        Fixed Rate
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{
                          fontFamily: "Cormorant Garamond",
                          color: "#0891b2",
                        }}
                      >
                        {fmt(PRICING[svcType]["sports"][60])}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
                      {durList(selSvc).map((m) => {
                        const p = selSvc ? PRICING[svcType][selSvc]?.[m] : null;
                        return (
                          <div
                            key={m}
                            onClick={() => setDur(m)}
                            className={`p-3 sm:p-4 rounded-xl cursor-pointer ch border-2 text-center ${dur === m ? "border-cyan-500 bg-cyan-50" : "border-gray-200 hover:border-gray-300"}`}
                          >
                            {dur === m && (
                              <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full text-white mb-2 inline-block"
                                style={{ background: "#0891b2" }}
                              >
                                SELECTED
                              </span>
                            )}
                            <div
                              className="text-xl sm:text-3xl font-bold text-gray-900"
                              style={{ fontFamily: "Cormorant Garamond" }}
                            >
                              {m}
                            </div>
                            <div className="text-xs text-gray-500 mb-1">
                              MINUTES
                            </div>
                            {p && (
                              <div
                                className="text-xs sm:text-sm font-bold"
                                style={{ color: "#0891b2" }}
                              >
                                {fmt(p)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </FC>

                {/* 5 Date */}
                <FC>
                  <SH n={5} title="Select Date" done={!!date} />
                  <div
                    className="mt-4 p-4 rounded-xl"
                    style={{
                      border: "2px solid #bae6fd",
                      background: "#f0f9ff",
                    }}
                  >
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Appointment Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={todayStr()}
                      max={maxStr()}
                      className="w-full p-3 rounded-lg font-semibold text-gray-900 text-sm"
                      style={{
                        border: "2px solid #bae6fd",
                        background: "white",
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Bookable up to 3 months ahead
                    </p>
                  </div>
                </FC>

                {/* 6 Time */}
                <FC>
                  <SH n={6} title="Select Time" done={!!time} />
                  {svcType === "mobile" && (
                    <IB text="Mobile service available 7 AM – 12 AM, 7 days a week" />
                  )}
                  <div
                    className={`grid gap-2 mt-4 ${svcType === "mobile" ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-3 sm:grid-cols-5"}`}
                  >
                    {(svcType === "mobile" ? MOBILE_SLOTS : STUDIO_SLOTS).map(
                      (t) => (
                        <button
                          key={t}
                          onClick={() => setTime(t)}
                          className={`p-2 rounded-lg text-xs font-semibold transition-all border-2 ${time === t ? "text-white border-cyan-500" : "text-gray-700 border-gray-200 hover:border-gray-300"}`}
                          style={time === t ? { background: "#0891b2" } : {}}
                        >
                          {t}
                        </button>
                      ),
                    )}
                  </div>
                </FC>

                {/* 7 Info */}
                <FC>
                  <SH
                    n={7}
                    title="Your Information"
                    done={
                      !!(
                        cName &&
                        cPhone &&
                        cPhone.replace(/\D/g, "").length >= 11
                      )
                    }
                  />
                  <div className="space-y-4 mt-4">
                    <TF
                      label="Full Name *"
                      value={cName}
                      onChange={setCName}
                      placeholder="Your full name"
                    />
                    <PF
                      label="Phone Number *"
                      value={cPhone}
                      error={cPhoneErr}
                      onChange={(v) => onPhone(v, setCPhone, setCPhoneErr)}
                    />
                  </div>
                </FC>

                {/* 8 Payment */}
                <FC>
                  <SH n={8} title="Payment Option" done={true} />
                  {svcType === "studio" ? (
                    <div className="mt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          {
                            id: "full",
                            l: "Pay in Full",
                            s: "Complete payment now",
                            a: bPrice(),
                          },
                          {
                            id: "deposit",
                            l: "50% Deposit",
                            s: "Balance paid at studio",
                            a: bPrice() * 0.5,
                          },
                        ].map((o) => (
                          <SC
                            key={o.id}
                            sel={payOpt === o.id}
                            onClick={() => setPayOpt(o.id)}
                          >
                            <p className="font-bold text-gray-900 text-sm mb-0.5">
                              {o.l}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">{o.s}</p>
                            <p
                              className="text-base font-bold"
                              style={{ color: "#0891b2" }}
                            >
                              {dur ? fmt(o.a) : "—"}
                            </p>
                          </SC>
                        ))}
                      </div>
                      <IB text="Secure online payment required for studio bookings. Powered by Paystack." />
                    </div>
                  ) : (
                    <div
                      className="mt-4 p-4 rounded-xl border-2"
                      style={{ borderColor: "#34d399", background: "#ecfdf5" }}
                    >
                      <p className="font-bold text-gray-900 text-sm">
                        Pay After Session
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Payment collected after your mobile session is complete.
                      </p>
                    </div>
                  )}
                </FC>

                {/* Mobile submit */}
                <div className="lg:hidden">
                  <FC>
                    <BSummary
                      SERVICES={SERVICES}
                      selSvc={selSvc}
                      dur={dur}
                      svcType={svcType}
                      therapist={therapist}
                      date={date}
                      time={time}
                      cName={cName}
                      cPhone={cPhone}
                      payOpt={payOpt}
                      bPrice={bPrice}
                      bPay={bPay}
                      done={bDone}
                      onBook={handleBooking}
                    />
                  </FC>
                </div>
              </div>
              {/* Desktop summary */}
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <FC>
                    <div className="flex items-center gap-2 mb-5">
                      <div
                        className="w-2 h-5 rounded-full"
                        style={{ background: "#06b6d4" }}
                      ></div>
                      <h4 className="font-bold text-gray-900">
                        Booking Summary
                      </h4>
                    </div>
                    <BSummary
                      SERVICES={SERVICES}
                      selSvc={selSvc}
                      dur={dur}
                      svcType={svcType}
                      therapist={therapist}
                      date={date}
                      time={time}
                      cName={cName}
                      cPhone={cPhone}
                      payOpt={payOpt}
                      bPrice={bPrice}
                      bPay={bPay}
                      done={bDone}
                      onBook={handleBooking}
                    />
                  </FC>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ MEMBERSHIP ════════════ */}
        {activeTab === "membership" && (
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
                Choose a multi-session monthly plan with 10% off every session.
                Real commitment, real results.
              </p>
            </div>

            {/* Plan cards */}
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
                        mPlan === plan.id
                          ? "#0891b2"
                          : "rgba(255,255,255,0.15)",
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
                      color:
                        mPlan === plan.id ? "#6b7280" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    {plan.desc}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar
                      className="w-4 h-4"
                      style={{
                        color: mPlan === plan.id ? "#0891b2" : "#67e8f9",
                      }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color: mPlan === plan.id ? "#0891b2" : "#67e8f9",
                      }}
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
                        style={{
                          color: "#0891b2",
                          fontFamily: "Cormorant Garamond",
                        }}
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
                  Choose Service
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SERVICES.map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => setMSvc(svc.id)}
                      className={`p-3 rounded-xl cursor-pointer ch border-2 flex items-center gap-3 ${mSvc === svc.id ? "border-cyan-500 bg-cyan-50" : "border-gray-200 hover:border-gray-300"}`}
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
                {mSvc === "sports" ? (
                  <div
                    className="p-3 rounded-xl border-2"
                    style={{ borderColor: "#06b6d4", background: "#f0f9ff" }}
                  >
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#0891b2" }}
                    >
                      Fixed Rate · {fmt(PRICING[mSvcType]["sports"][60])} ·{" "}
                      <span className="text-emerald-600 text-xs">
                        10% off = {fmt(disc10(PRICING[mSvcType]["sports"][60]))}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {durList(mSvc).map((m) => {
                      const base = getPrice(mSvcType, mSvc, m),
                        dp = disc10(base);
                      return (
                        <div
                          key={m}
                          onClick={() => setMDur(m)}
                          className={`p-3 rounded-xl cursor-pointer ch border-2 text-center ${mDur === m ? "border-cyan-500 bg-cyan-50" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <p className="font-bold text-gray-900 text-sm">
                            {m} min
                          </p>
                          <p className="text-xs text-gray-400 line-through">
                            {fmt(base)}
                          </p>
                          <p
                            className="text-sm font-bold"
                            style={{ color: "#0891b2" }}
                          >
                            {fmt(dp)}
                          </p>
                          <p className="text-xs text-emerald-600 font-semibold">
                            10% off
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                  style={{
                    border: `2px solid ${mEmail ? "#06b6d4" : "#e5e7eb"}`,
                  }}
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
                        style={{
                          fontFamily: "Cormorant Garamond",
                          color: "#0891b2",
                        }}
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
          </div>
        )}

        {/* ════════════ SPA GIFT CARD ════════════ */}
        {activeTab === "giftcard" && (
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
                Gift a premium massage experience. We'll personally contact both
                buyer and recipient.
              </p>
            </div>

            {/* Live preview */}
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
              ></div>
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
              {/* Location */}
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

              {/* Service */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Choose Service
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SERVICES.map((svc) => (
                    <div
                      key={svc.id}
                      onClick={() => setGSvc(svc.id)}
                      className={`p-3 rounded-xl cursor-pointer ch border-2 flex items-center gap-3 ${gSvc === svc.id ? "border-cyan-500 bg-cyan-50" : "border-gray-200 hover:border-gray-300"}`}
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

              {/* Duration */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Session Duration
                </label>
                {gSvc === "sports" ? (
                  <div
                    className="p-3 rounded-xl border-2"
                    style={{ borderColor: "#06b6d4", background: "#f0f9ff" }}
                  >
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#0891b2" }}
                    >
                      Fixed Rate · {fmt(PRICING[gSvcType]["sports"][60])}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {durList(gSvc).map((m) => {
                      const p = getPrice(gSvcType, gSvc, m);
                      return (
                        <div
                          key={m}
                          onClick={() => setGDur(m)}
                          className={`p-3 rounded-xl cursor-pointer ch border-2 text-center ${gDur === m ? "border-cyan-500 bg-cyan-50" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <p className="font-bold text-gray-900 text-sm">
                            {m} min
                          </p>
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
                )}
              </div>

              {/* Caption */}
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

              {/* Buyer + Recipient */}
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
                * Provide at least one contact for the recipient (phone or
                email) so we can deliver their gift.
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
                        {gSvcType === "studio"
                          ? "Home Studio"
                          : "Mobile Service"}
                      </p>
                    </div>
                    <p
                      className="text-2xl font-bold"
                      style={{
                        fontFamily: "Cormorant Garamond",
                        color: "#db2777",
                      }}
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

// ─────────────────────────────────────────────────────────────────────────────
// SHARED MICRO-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const FC = ({ children }) => (
  <div
    className="bg-white rounded-2xl p-4 sm:p-6 lg:p-7 shadow-sm"
    style={{ border: "1px solid #e5e7eb" }}
  >
    {children}
  </div>
);
const SH = ({ n, title, done }) => (
  <div className="flex items-center gap-3">
    <div
      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0"
      style={{
        background: done ? "#0891b2" : "#f3f4f6",
        color: done ? "white" : "#374151",
      }}
    >
      {done ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : n}
    </div>
    <h4
      className="text-sm sm:text-lg font-bold text-gray-900"
      style={{ fontFamily: "Cormorant Garamond" }}
    >
      {title}
    </h4>
    {done && (
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full ml-auto"
        style={{ background: "#d1fae5", color: "#065f46" }}
      >
        Done ✓
      </span>
    )}
  </div>
);
const SC = ({ sel, onClick, children }) => (
  <div
    onClick={onClick}
    className={`p-3 sm:p-4 rounded-xl cursor-pointer ch border-2 ${sel ? "border-cyan-500 bg-cyan-50" : "border-gray-200 hover:border-gray-300"}`}
  >
    <div className="flex items-start justify-between gap-2">
      {children}
      {sel && <Tick />}
    </div>
  </div>
);
const Tick = () => (
  <div
    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
    style={{ background: "#0891b2" }}
  >
    <Check className="w-3 h-3 text-white" />
  </div>
);
const IB = ({ text }) => (
  <div
    className="flex items-center gap-2 mt-3 p-3 rounded-lg text-xs"
    style={{
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      color: "#1d4ed8",
    }}
  >
    <Shield className="w-3.5 h-3.5 flex-shrink-0" />
    {text}
  </div>
);
const TF = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 rounded-lg text-sm"
      style={{ border: `2px solid ${value ? "#06b6d4" : "#e5e7eb"}` }}
    />
  </div>
);
const PF = ({ label, value, error, onChange, placeholder = "08012345678" }) => {
  const d = value.replace(/\D/g, "");
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label} <span className="font-normal text-gray-400">(11 digits)</span>
      </label>
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={14}
        className="w-full p-3 rounded-lg text-sm"
        style={{
          border: `2px solid ${error ? "#ef4444" : d.length === 11 ? "#06b6d4" : "#e5e7eb"}`,
        }}
      />
      {error && (
        <div className="flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}
      {!error && d.length > 0 && (
        <p
          className="text-xs mt-1"
          style={{ color: d.length === 11 ? "#059669" : "#6b7280" }}
        >
          {d.length}/11 {d.length === 11 && "✓"}
        </p>
      )}
    </div>
  );
};
const SBox = ({ rows, hi }) => (
  <div
    className="rounded-xl p-3 sm:p-4 mb-4 space-y-2"
    style={{ background: "#f0f9ff" }}
  >
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
const Modal = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
    style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
  >
    <div className="bg-white rounded-2xl p-5 sm:p-8 max-w-md w-full shadow-2xl m-enter relative max-h-[90vh] overflow-y-auto">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  </div>
);
const ModalHeader = ({ icon, title, sub }) => (
  <div className="text-center mb-5">
    <div
      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
      style={{ background: "linear-gradient(135deg,#0891b2,#06b6d4)" }}
    >
      <span className="text-xl sm:text-2xl">{icon}</span>
    </div>
    <h3
      className="text-xl sm:text-2xl font-bold text-gray-900 mb-1"
      style={{ fontFamily: "Cormorant Garamond" }}
    >
      {title}
    </h3>
    <p className="text-xs sm:text-sm text-gray-500">{sub}</p>
  </div>
);
const SuccessIcon = () => (
  <div className="text-center mb-4">
    <div
      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3"
      style={{ background: "#d1fae5" }}
    >
      <Check className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
    </div>
  </div>
);
const SecureNote = () => (
  <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
    <Shield className="w-3 h-3" />
    256-bit SSL · Powered by Paystack
  </p>
);
const Btn = ({ children, onClick, color }) => {
  const styles = {
    green: {
      background: "linear-gradient(135deg,#059669,#10b981)",
      color: "white",
    },
    blue: {
      background: "linear-gradient(135deg,#0891b2,#06b6d4)",
      color: "white",
    },
    pink: {
      background: "linear-gradient(135deg,#db2777,#ec4899)",
      color: "white",
    },
    ghost: { background: "#f3f4f6", color: "#374151" },
    whatsapp: { background: "#25D366", color: "white" },
  };
  return (
    <button
      onClick={onClick}
      className="w-full py-3 rounded-xl font-semibold text-sm mb-2 transition-all hover:opacity-90"
      style={styles[color] || styles.blue}
    >
      {children}
    </button>
  );
};
const BSummary = ({
  SERVICES,
  selSvc,
  dur,
  svcType,
  therapist,
  date,
  time,
  cName,
  cPhone,
  payOpt,
  bPrice,
  bPay,
  done,
  onBook,
}) => {
  const svc = SERVICES.find((s) => s.id === selSvc);
  return (
    <div>
      <div className="space-y-2 mb-4">
        {[
          ["Service", svc?.name || "—"],
          ["Location", svcType === "studio" ? "Home Studio" : "Mobile Service"],
          ["Duration", dur ? `${dur} min` : "—"],
          [
            "Therapist",
            therapist === "male"
              ? "Male"
              : therapist === "female"
                ? "Female"
                : therapist === "any"
                  ? "Any"
                  : "—",
          ],
          ["Date", date || "—"],
          ["Time", time || "—"],
          ["Name", cName || "—"],
          ["Phone", cPhone || "—"],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between text-xs sm:text-sm">
            <span className="text-gray-400">{l}</span>
            <span className="font-semibold text-gray-900 max-w-[55%] truncate text-right">
              {v}
            </span>
          </div>
        ))}
      </div>
      <div className="pt-3 mb-4" style={{ borderTop: "1px solid #e5e7eb" }}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs sm:text-sm font-semibold text-gray-600">
            {svcType === "studio" && payOpt === "deposit"
              ? "Pay Now (50%)"
              : svcType === "studio"
                ? "Pay Now"
                : "Total Due"}
          </span>
          <span
            className="text-xl sm:text-2xl font-bold"
            style={{ fontFamily: "Cormorant Garamond", color: "#0891b2" }}
          >
            {dur ? fmt(bPay()) : "—"}
          </span>
        </div>
        {svcType === "studio" && payOpt === "deposit" && dur && (
          <p className="text-xs text-right text-gray-400">
            Balance {fmt(bPrice() * 0.5)} at studio
          </p>
        )}
        <p className="text-xs text-right mt-0.5 text-gray-400">
          *All taxes included🧾
        </p>
      </div>
      <button
        onClick={onBook}
        disabled={!done}
        className="w-full py-3 sm:py-3.5 rounded-xl font-bold text-sm transition-all"
        style={{
          background: done
            ? "linear-gradient(135deg,#0891b2,#06b6d4)"
            : "#e5e7eb",
          color: done ? "white" : "#9ca3af",
          cursor: done ? "pointer" : "not-allowed",
          boxShadow: done ? "0 4px 14px rgba(8,145,178,0.3)" : "none",
        }}
      >
        {svcType === "studio" ? "Proceed to Payment →" : "Confirm Booking →"}
      </button>
      {done && (
        <p className="text-xs text-center mt-2 text-gray-400">
          {svcType === "studio"
            ? "🔒 Secure via Paystack"
            : "✓ Pay after your session"}
        </p>
      )}
    </div>
  );
};

export default VivifySpaWebsite;
