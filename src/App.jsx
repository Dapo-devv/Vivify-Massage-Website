import React, { useState, useEffect } from "react";
import {
  Phone, Clock, MapPin, Sparkles, Home, Building2, User,
  Check, X, AlertCircle, Shield, Star, Gift, Crown, Calendar,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────
const PAYSTACK_KEY = "pk_live_915663b76742c16f999c99e6251596ee7c5c9584";
const BOOKING_URL  = "https://vivifymassageandspa.online";
const WA_NUMBER    = "2347040723894";

const pricing = {
  studio: {
    swedish:       { 60: 25000, 90: 35000, 120: 50000 },
    "deep-tissue": { 60: 30000, 90: 40000, 120: 50000 },
    "full-body":   { 60: 30000, 90: 40000, 120: 50000 },
    sports:        { 60: 50000 },
  },
  mobile: {
    swedish:       { 60: 35000, 90: 45000, 120: 65000 },
    "deep-tissue": { 60: 40000, 90: 55000, 120: 70000 },
    "full-body":   { 60: 40000, 90: 55000, 120: 70000 },
    sports:        { 60: 70000 },
  },
};

const services = [
  { id:"swedish",     name:"Swedish Relaxation",    description:"Gentle, flowing strokes to promote relaxation and improve circulation.",  image:"/assets/swedish_massage.jpg",                  badge:"Popular",  badgeColor:"bg-emerald-100 text-emerald-700", icon:"🌿" },
  { id:"deep-tissue", name:"Deep Tissue Recovery",  description:"Targeted pressure to release chronic muscle tension and aid recovery.",    image:"/assets/deep_tissue.jpg",                      badge:"Standard", badgeColor:"bg-amber-100 text-amber-700",   icon:"💪" },
  { id:"full-body",   name:"Full Body Rejuvenation", description:"A comprehensive head-to-toe treatment combining multiple techniques.",     image:"/assets/engin_akyurt-massage-7452918_1920.jpg", badge:"Premium",  badgeColor:"bg-violet-100 text-violet-700",  icon:"✨" },
  { id:"sports",      name:"Sports Massage",         description:"Enhances performance, reduces injury risk and speeds up recovery.",        image:"/assets/sport_massage.jpg",                    badge:"Athletic", badgeColor:"bg-cyan-100 text-cyan-700",      icon:"⚡", maleOnly:true },
];

const studioSlots = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"];
const mobileSlots = ["7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM","9:00 PM","10:00 PM","11:00 PM","12:00 AM"];

const fmt  = (n) => `₦${Number(n).toLocaleString()}`;
const disc = (n) => Math.round(n * 0.9);

// ── Main Component ────────────────────────────────────────────────────────────
const VivifySpaWebsite = () => {
  const [activeTab, setActiveTab] = useState("booking");

  // Booking
  const [emailJsReady, setEmailJsReady] = useState(false);
  const [selService,   setSelService]   = useState("");
  const [svcType,      setSvcType]      = useState("studio");
  const [therapist,    setTherapist]    = useState("");
  const [duration,     setDuration]     = useState("");
  const [apptDate,     setApptDate]     = useState("");
  const [apptTime,     setApptTime]     = useState("");
  const [custName,     setCustName]     = useState("");
  const [custPhone,    setCustPhone]    = useState("");
  const [phoneErr,     setPhoneErr]     = useState("");
  const [payOpt,       setPayOpt]       = useState("full");
  const [loading,      setLoading]      = useState(false);
  const [showSuccess,  setShowSuccess]  = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [bkgDetails,   setBkgDetails]   = useState(null);
  const [countdown,    setCountdown]    = useState(5);

  // Membership
  const [memSvcType,  setMemSvcType]  = useState("studio");
  const [memService,  setMemService]  = useState("");
  const [memDuration, setMemDuration] = useState("");
  const [memPlan,     setMemPlan]     = useState("single");
  const [memName,     setMemName]     = useState("");
  const [memPhone,    setMemPhone]    = useState("");
  const [memPhoneErr, setMemPhoneErr] = useState("");
  const [memLoading,  setMemLoading]  = useState(false);
  const [memSuccess,  setMemSuccess]  = useState(false);
  const [memDetails,  setMemDetails]  = useState(null);

  // Gift Card
  const [gcSvcType,    setGcSvcType]    = useState("studio");
  const [gcService,    setGcService]    = useState("");
  const [gcDuration,   setGcDuration]   = useState("");
  const [gcCaption,    setGcCaption]    = useState("");
  const [gcBuyerName,  setGcBuyerName]  = useState("");
  const [gcBuyerPhone, setGcBuyerPhone] = useState("");
  const [gcBuyerEmail, setGcBuyerEmail] = useState("");
  const [gcRecpName,   setGcRecpName]   = useState("");
  const [gcRecpPhone,  setGcRecpPhone]  = useState("");
  const [gcRecpEmail,  setGcRecpEmail]  = useState("");
  const [gcBPhoneErr,  setGcBPhoneErr]  = useState("");
  const [gcRPhoneErr,  setGcRPhoneErr]  = useState("");
  const [gcLoading,    setGcLoading]    = useState(false);
  const [gcSuccess,    setGcSuccess]    = useState(false);
  const [gcDetails,    setGcDetails]    = useState(null);

  // ── Helpers ──────────────────────────────────────────────────────
  const availDurations  = (svc) => svc ? Object.keys(pricing.studio[svc] || {}).map(Number) : [60,90,120];
  const getPrice        = (type, svc, dur) => pricing[type]?.[svc]?.[dur] || 0;
  const today           = () => new Date().toISOString().split("T")[0];
  const maxDate         = () => { const d = new Date(); d.setMonth(d.getMonth()+3); return d.toISOString().split("T")[0]; };
  const bookingPrice    = () => getPrice(svcType, selService, duration);
  const bookingPay      = () => svcType==="studio" && payOpt==="deposit" ? bookingPrice()*0.5 : bookingPrice();
  const memBasePrice    = () => getPrice(memSvcType, memService, memDuration);
  const memMonthly      = () => { const base = disc(memBasePrice()); return memPlan==="single" ? base : base*2; };
  const gcPrice         = () => getPrice(gcSvcType, gcService, gcDuration);
  const bookingDone     = !!(selService && svcType && therapist && duration && apptDate && apptTime && custName && custPhone && custPhone.replace(/\D/g,"").length>=11);
  const memDone         = !!(memService && memSvcType && memName && memPhone && memPhone.replace(/\D/g,"").length>=11 && memDuration);
  const gcDone          = !!(gcService && gcSvcType && gcDuration && gcBuyerName && gcBuyerPhone && gcBuyerPhone.replace(/\D/g,"").length>=11 && gcBuyerEmail && gcRecpName && (gcRecpPhone||gcRecpEmail));
  const completedSteps  = [!!svcType,!!selService,!!therapist,!!duration,!!apptDate,!!apptTime,!!(custName&&custPhone&&custPhone.replace(/\D/g,"").length>=11),true].filter(Boolean).length;

  // ── Scripts ──────────────────────────────────────────────────────
  useEffect(() => {
    const s1 = document.createElement("script");
    s1.src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"; s1.async=true;
    s1.onload=()=>{ window.emailjs.init("0n5VR5rLZ4B0HrtlN"); setEmailJsReady(true); };
    document.body.appendChild(s1);
    const s2 = document.createElement("script");
    s2.src="https://js.paystack.co/v1/inline.js"; s2.async=true;
    document.head.appendChild(s2);
    return ()=>{ document.body.contains(s1)&&document.body.removeChild(s1); document.head.contains(s2)&&document.head.removeChild(s2); };
  }, []);

  useEffect(() => {
    if (selService==="sports") { setTherapist("male"); setDuration(60); }
    else if (selService && duration && !availDurations(selService).includes(Number(duration))) setDuration("");
  }, [selService]);

  useEffect(() => {
    if (memService==="sports") setMemDuration(60);
    else if (memService && memDuration && !availDurations(memService).includes(Number(memDuration))) setMemDuration("");
  }, [memService]);

  useEffect(() => {
    if (gcService==="sports") setGcDuration(60);
    else if (gcService && gcDuration && !availDurations(gcService).includes(Number(gcDuration))) setGcDuration("");
  }, [gcService]);

  useEffect(() => {
    let t;
    if (showSuccess && svcType==="studio" && bkgDetails) {
      t = setInterval(()=>setCountdown(p=>{ if(p<=1){ clearInterval(t); redirectConfirm(bkgDetails); return 0; } return p-1; }),1000);
    }
    return ()=>t&&clearInterval(t);
  }, [showSuccess, svcType, bkgDetails]);

  const redirectConfirm = (d) => {
    const p = new URLSearchParams({ booking_id: d.paymentReference||`VMS_${Date.now()}`, customer_name: d.customerName, status:"confirmed" });
    window.location.href = `${BOOKING_URL}/confirmation?${p}`;
  };

  // ── Notifications ─────────────────────────────────────────────────
  const sendWA = (msg) => window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,"_blank");

  const waBooking = (d) => sendWA(`*🌟 NEW BOOKING — Vivify*\n\n👤 ${d.customerName} | 📱 ${d.customerPhone}\n💆 ${d.service} | 📍 ${d.serviceType}\n👥 ${d.therapist} | ⏱️ ${d.duration}\n📅 ${d.appointmentDate} at ${d.appointmentTime}\n💰 Total: ${fmt(d.totalAmount)} | Paid: ${fmt(d.paymentAmount)}\n📝 ${d.paymentType} | ✅ ${d.paymentStatus||"Paid"}\n🔗 Ref: ${d.paymentReference||"N/A"}`);
  const waMembership = (d) => sendWA(`*👑 NEW MEMBERSHIP — Vivify*\n\n👤 ${d.name} | 📱 ${d.phone}\n📋 Plan: ${d.plan}\n💆 ${d.service} | 📍 ${d.location} | ⏱️ ${d.duration}\n💰 Monthly: ${fmt(d.monthlyAmount)}\n🔗 Ref: ${d.ref}`);
  const waGiftCard   = (d) => sendWA(`*🎁 NEW GIFT CARD — Vivify*\n\n*Buyer:* ${d.buyerName} | 📱 ${d.buyerPhone} | ✉️ ${d.buyerEmail}\n*Recipient:* ${d.recipientName} | 📱 ${d.recipientPhone||"—"} | ✉️ ${d.recipientEmail||"—"}\n\n💆 ${d.service} | 📍 ${d.location} | ⏱️ ${d.duration}\n💬 Caption: "${d.caption}"\n💰 ${fmt(d.amount)} | 🔗 Ref: ${d.ref}`);

  // ── Paystack ──────────────────────────────────────────────────────
  const paystackPay = ({ amount, meta, onSuccess }) => {
    if (!window.PaystackPop) { alert("Payment loading. Please try again."); return; }
    window.PaystackPop.setup({
      key: PAYSTACK_KEY, email:"customer@vivifymassageandspa.online",
      amount: amount*100, currency:"NGN",
      ref:`VMS_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
      metadata:{ custom_fields: meta },
      callback: (res)=>onSuccess(res),
      onClose: ()=>alert("Payment cancelled. Contact 07040723894 for help."),
    }).openIframe();
  };

  // ── Booking submit ────────────────────────────────────────────────
  const handleBooking = async () => {
    if (!bookingDone) { alert("Please fill all fields."); return; }
    setLoading(true);
    const svcObj = services.find(s=>s.id===selService);
    const data = { customerName:custName, customerPhone:custPhone, service:svcObj?.name, serviceType:svcType==="studio"?"Home Studio":"Mobile Service", therapist:therapist==="male"?"Male":therapist==="female"?"Female":"No Preference", duration:`${duration} minutes`, appointmentDate:apptDate, appointmentTime:apptTime, totalAmount:bookingPrice(), paymentAmount:bookingPay(), paymentType:svcType==="studio"?(payOpt==="full"?"Full Payment":"50% Deposit"):"Pay After Session", bookingDate:new Date().toISOString() };
    await new Promise(r=>setTimeout(r,1200));
    if (svcType==="studio") { setLoading(false); setBkgDetails(data); setShowPayModal(true); return; }
    waBooking(data); setBkgDetails(data); setLoading(false); setShowSuccess(true); setCountdown(5);
  };

  const handlePaystackBooking = (data) => paystackPay({ amount:data.paymentAmount, meta:[{display_name:"Customer",variable_name:"customer",value:data.customerName},{display_name:"Service",variable_name:"service",value:data.service}], onSuccess:(res)=>{ const u={...data,paymentReference:res.reference,paymentStatus:"Paid"}; waBooking(u); setBkgDetails(u); setShowPayModal(false); setShowSuccess(true); setCountdown(5); } });

  // ── Membership submit ─────────────────────────────────────────────
  const handleMembership = async () => {
    if (!memDone) { alert("Please fill all fields."); return; }
    setMemLoading(true);
    const svcObj = services.find(s=>s.id===memService);
    const data = { name:memName, phone:memPhone, plan:memPlan==="single"?"Single Session / Month":"Double Session / Month", service:svcObj?.name, location:memSvcType==="studio"?"Home Studio":"Mobile Service", duration:`${memDuration} minutes`, normalPrice:memBasePrice(), discountedPrice:disc(memBasePrice()), monthlyAmount:memMonthly(), sessions:memPlan==="single"?1:2 };
    await new Promise(r=>setTimeout(r,1000));
    paystackPay({ amount:memMonthly(), meta:[{display_name:"Member",variable_name:"member",value:memName},{display_name:"Plan",variable_name:"plan",value:data.plan}], onSuccess:(res)=>{ const u={...data,ref:res.reference}; waMembership(u); setMemDetails(u); setMemLoading(false); setMemSuccess(true); } });
    setMemLoading(false);
  };

  // ── Gift Card submit ──────────────────────────────────────────────
  const handleGiftCard = async () => {
    if (!gcDone) { alert("Please fill all required fields."); return; }
    setGcLoading(true);
    const svcObj = services.find(s=>s.id===gcService);
    const data = { buyerName:gcBuyerName, buyerPhone:gcBuyerPhone, buyerEmail:gcBuyerEmail, recipientName:gcRecpName, recipientPhone:gcRecpPhone, recipientEmail:gcRecpEmail, service:svcObj?.name, location:gcSvcType==="studio"?"Home Studio":"Mobile Service", duration:gcService==="sports"?"60 minutes":`${gcDuration} minutes`, caption:gcCaption||"Wishing you pure relaxation 💆", amount:gcPrice() };
    await new Promise(r=>setTimeout(r,1000));
    paystackPay({ amount:gcPrice(), meta:[{display_name:"Buyer",variable_name:"buyer",value:gcBuyerName},{display_name:"Recipient",variable_name:"recipient",value:gcRecpName},{display_name:"Service",variable_name:"service",value:svcObj?.name}], onSuccess:(res)=>{ const u={...data,ref:res.reference}; waGiftCard(u); setGcDetails(u); setGcLoading(false); setGcSuccess(true); } });
    setGcLoading(false);
  };

  const handlePhoneChange = (val, setter, errSetter) => { setter(val); const d=val.replace(/\D/g,""); errSetter(d.length>0&&d.length<11?"Must be 11 digits":""); };

  const resetBooking = () => { setSelService(""); setTherapist(""); setDuration(""); setApptDate(""); setApptTime(""); setCustName(""); setCustPhone(""); setPhoneErr(""); setPayOpt("full"); setBkgDetails(null); };
  const closeBooking = () => { setShowSuccess(false); setShowPayModal(false); resetBooking(); };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:"smooth" });

  return (
    <div className="min-h-screen" style={{ background:"linear-gradient(160deg,#0c4a6e 0%,#0e7490 40%,#164e63 100%)", backgroundAttachment:"fixed", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');
        @keyframes scale-in{from{opacity:0;transform:scale(0.94) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .modal-enter{animation:scale-in 0.25s cubic-bezier(.16,1,.3,1)}
        .card-hover{transition:all 0.2s ease}.card-hover:hover{transform:translateY(-2px)}
        .btn-glow{transition:all 0.18s ease}.btn-glow:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(6,182,212,0.4)}
        .tab-pill{transition:all 0.2s ease}
        input[type=date]::-webkit-calendar-picker-indicator{opacity:0.6;cursor:pointer}
      `}</style>

      {/* Spinner */}
      {(loading||memLoading||gcLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)"}}>
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full mx-auto mb-4" style={{border:"3px solid #e5e7eb",borderTopColor:"#06b6d4",animation:"spin 0.8s linear infinite"}}></div>
            <p className="font-bold text-gray-900" style={{fontFamily:"Cormorant Garamond"}}>Processing…</p>
          </div>
        </div>
      )}

      {/* Booking Payment Modal */}
      {showPayModal && bkgDetails && svcType==="studio" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)"}}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl modal-enter relative">
            <button onClick={()=>setShowPayModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"><X className="w-4 h-4"/></button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{background:"linear-gradient(135deg,#0891b2,#06b6d4)"}}><span className="text-2xl">💳</span></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1" style={{fontFamily:"Cormorant Garamond"}}>Complete Payment</h3>
              <p className="text-sm text-gray-500">Pay {payOpt==="deposit"?"50% deposit":"in full"} to lock your session</p>
            </div>
            <SummaryBox rows={[["Name",bkgDetails.customerName],["Service",bkgDetails.service],["Duration",bkgDetails.duration],["Date & Time",`${bkgDetails.appointmentDate} · ${bkgDetails.appointmentTime}`],["Amount to Pay",fmt(bkgDetails.paymentAmount)]]} highlight="Amount to Pay" />
            <button onClick={()=>handlePaystackBooking(bkgDetails)} className="w-full py-4 rounded-xl font-bold text-white btn-glow" style={{background:"linear-gradient(135deg,#059669,#10b981)"}}>Pay Securely with Paystack →</button>
            <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1"><Shield className="w-3 h-3"/>256-bit SSL · Powered by Paystack</p>
          </div>
        </div>
      )}

      {/* Booking Success Modal */}
      {showSuccess && bkgDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)"}}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl modal-enter">
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{background:"#d1fae5"}}><Check className="w-8 h-8 text-emerald-600"/></div>
              <h3 className="text-2xl font-bold text-gray-900" style={{fontFamily:"Cormorant Garamond"}}>{svcType==="studio"?"Payment Confirmed!":"Booking Confirmed!"}</h3>
            </div>
            <SummaryBox rows={[["Ref",bkgDetails.paymentReference||`VMS_${Date.now().toString().slice(-8)}`],["Name",bkgDetails.customerName],["Service",bkgDetails.service],["Date & Time",`${bkgDetails.appointmentDate} · ${bkgDetails.appointmentTime}`],["Amount",fmt(bkgDetails.paymentAmount)]]} highlight="Amount" />
            {svcType==="studio" ? (
              <div>
                <p className="text-center text-sm text-gray-500 mb-3">Redirecting in <span className="font-bold" style={{color:"#0891b2"}}>{countdown}s</span>…</p>
                <button onClick={()=>redirectConfirm(bkgDetails)} className="w-full py-3 rounded-xl font-semibold text-white mb-2 btn-glow" style={{background:"#0891b2"}}>Go to Confirmation →</button>
                <button onClick={closeBooking} className="w-full py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Stay Here</button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2 rounded-xl p-3 mb-4 text-xs" style={{background:"#eff6ff",border:"1px solid #bfdbfe",color:"#1d4ed8"}}><Phone className="w-4 h-4 flex-shrink-0"/><span>Our team will call to confirm. Payment collected after session.</span></div>
                <button onClick={closeBooking} className="w-full py-3 rounded-xl font-semibold text-white btn-glow" style={{background:"#06b6d4"}}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Membership Success Modal */}
      {memSuccess && memDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)"}}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl modal-enter">
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{background:"#fef9c3"}}><Crown className="w-8 h-8 text-yellow-500"/></div>
              <h3 className="text-2xl font-bold text-gray-900" style={{fontFamily:"Cormorant Garamond"}}>Welcome, Member!</h3>
              <p className="text-sm text-gray-500 mt-1">Your membership is now active.</p>
            </div>
            <SummaryBox rows={[["Member",memDetails.name],["Plan",memDetails.plan],["Service",memDetails.service],["Location",memDetails.location],["Duration",memDetails.duration],["Monthly",fmt(memDetails.monthlyAmount)],["Ref",memDetails.ref]]} highlight="Monthly" />
            <div className="flex gap-2 rounded-xl p-3 mb-4 text-xs" style={{background:"#fef9c3",border:"1px solid #fde68a",color:"#92400e"}}><Crown className="w-4 h-4 flex-shrink-0 text-yellow-600"/><span>We'll call to schedule your first session and set up your monthly calendar.</span></div>
            <button onClick={()=>{setMemSuccess(false);setMemName("");setMemPhone("");setMemService("");setMemDuration("");setMemDetails(null);}} className="w-full py-3 rounded-xl font-semibold text-white btn-glow" style={{background:"#0891b2"}}>Done</button>
          </div>
        </div>
      )}

      {/* Gift Card Success Modal */}
      {gcSuccess && gcDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)"}}>
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl modal-enter">
            <div className="text-center mb-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{background:"#fce7f3"}}><Gift className="w-8 h-8 text-pink-500"/></div>
              <h3 className="text-2xl font-bold text-gray-900" style={{fontFamily:"Cormorant Garamond"}}>Gift Card Sent! 🎁</h3>
              <p className="text-sm text-gray-500 mt-1">We'll reach out to both buyer and recipient shortly.</p>
            </div>
            {/* Gift card visual */}
            <div className="rounded-2xl p-5 mb-5 text-white relative overflow-hidden" style={{background:"linear-gradient(135deg,#0c4a6e,#0e7490)"}}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10" style={{background:"white",transform:"translate(30%,-30%)"}}></div>
              <div className="flex items-center gap-2 mb-4"><Sparkles className="w-4 h-4 text-cyan-300"/><span className="font-bold text-sm" style={{fontFamily:"Cormorant Garamond"}}>Vivify Massage & Spa</span></div>
              <p className="text-lg font-bold mb-1" style={{fontFamily:"Cormorant Garamond"}}>For {gcDetails.recipientName}</p>
              <p className="text-xs text-cyan-200 italic mb-4">"{gcDetails.caption}"</p>
              <div className="flex justify-between items-end">
                <div><p className="text-xs text-cyan-300">{gcDetails.service} · {gcDetails.duration}</p><p className="text-xs text-cyan-300">From {gcDetails.buyerName}</p></div>
                <p className="text-2xl font-bold" style={{fontFamily:"Cormorant Garamond"}}>{fmt(gcDetails.amount)}</p>
              </div>
            </div>
            <SummaryBox rows={[["Ref",gcDetails.ref],["Buyer",gcDetails.buyerName],["Recipient",gcDetails.recipientName],["Value",fmt(gcDetails.amount)]]} highlight="Value" />
            <div className="flex gap-2 rounded-xl p-3 mb-4 text-xs" style={{background:"#fce7f3",border:"1px solid #fbcfe8",color:"#9d174d"}}><Phone className="w-4 h-4 flex-shrink-0"/><span>We'll call {gcDetails.buyerName} to confirm, and notify {gcDetails.recipientName} with their gift details.</span></div>
            <button onClick={()=>{setGcSuccess(false);setGcBuyerName("");setGcBuyerPhone("");setGcBuyerEmail("");setGcRecpName("");setGcRecpPhone("");setGcRecpEmail("");setGcService("");setGcDuration("");setGcCaption("");setGcDetails(null);}} className="w-full py-3 rounded-xl font-semibold text-white btn-glow" style={{background:"#0891b2"}}>Done</button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="sticky top-0 z-40" style={{background:"rgba(12,74,110,0.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#0891b2,#06b6d4)"}}><Sparkles className="w-5 h-5 text-white"/></div>
            <h1 className="text-lg sm:text-xl font-bold text-white" style={{fontFamily:"Cormorant Garamond"}}>Vivify Massage & Spa</h1>
          </div>
          <div className="hidden sm:flex items-center gap-1 rounded-xl p-1" style={{background:"rgba(255,255,255,0.1)"}}>
            {[["booking","📅 Book Session"],["membership","👑 Membership"],["giftcard","🎁 Gift Card"]].map(([id,label])=>(
              <button key={id} onClick={()=>{setActiveTab(id);scrollTo("main-section");}} className="px-4 py-2 rounded-lg text-sm font-semibold tab-pill"
                style={{background:activeTab===id?"white":"transparent",color:activeTab===id?"#0891b2":"rgba(255,255,255,0.8)"}}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={()=>{setActiveTab("booking");scrollTo("main-section");}} className="sm:hidden text-white px-4 py-2 rounded-xl font-semibold text-sm btn-glow" style={{background:"linear-gradient(135deg,#0891b2,#06b6d4)"}}>Book Now</button>
        </div>
        {/* Mobile tabs */}
        <div className="sm:hidden flex" style={{borderTop:"1px solid rgba(255,255,255,0.1)"}}>
          {[["booking","📅 Book"],["membership","👑 Members"],["giftcard","🎁 Gift"]].map(([id,label])=>(
            <button key={id} onClick={()=>{setActiveTab(id);scrollTo("main-section");}} className="flex-1 py-2.5 text-xs font-semibold tab-pill"
              style={{background:activeTab===id?"rgba(255,255,255,0.15)":"transparent",color:activeTab===id?"white":"rgba(255,255,255,0.6)",borderBottom:activeTab===id?"2px solid #06b6d4":"2px solid transparent"}}>
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="py-14 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 20% 80%,#fff 0%,transparent 50%),radial-gradient(circle at 80% 20%,#fff 0%,transparent 50%)"}}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5 text-xs font-semibold" style={{background:"rgba(255,255,255,0.15)",color:"#bae6fd",border:"1px solid rgba(255,255,255,0.2)"}}>
            <Star className="w-3.5 h-3.5" fill="currentColor"/> Where Recovery Meets Convenience
          </div>
          <h2 className="text-4xl sm:text-6xl font-bold text-white mb-4" style={{fontFamily:"Cormorant Garamond",lineHeight:1.1}}>
            Relax. Restore.<br/><span style={{color:"#67e8f9"}}>Renew.</span>
          </h2>
          <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto" style={{color:"#bae6fd"}}>Expert massage therapy — at our studio or your doorstep. Book, subscribe, or gift wellness.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[["📅 Book a Session","booking"],["👑 Monthly Membership","membership"],["🎁 Send a Gift Card","giftcard"]].map(([label,tab])=>(
              <button key={tab} onClick={()=>{setActiveTab(tab);scrollTo("main-section");}} className="px-6 py-3 rounded-xl font-semibold text-sm btn-glow"
                style={{background:activeTab===tab?"white":"rgba(255,255,255,0.15)",color:activeTab===tab?"#0891b2":"white",border:"1px solid rgba(255,255,255,0.3)"}}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main ── */}
      <div id="main-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* ══ BOOKING TAB ══ */}
        {activeTab==="booking" && (
          <div>
            <div className="mb-6 rounded-2xl p-5 shadow-sm" style={{background:"rgba(255,255,255,0.95)"}}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Booking Progress</p>
                <p className="text-sm font-bold" style={{color:"#0891b2"}}>{completedSteps}/8 steps</p>
              </div>
              <div className="h-2 rounded-full" style={{background:"#e5e7eb"}}>
                <div className="h-2 rounded-full" style={{width:`${(completedSteps/8)*100}%`,background:"linear-gradient(90deg,#0891b2,#06b6d4)",transition:"width 0.4s ease"}}></div>
              </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                {/* Step 1 */}
                <FormCard>
                  <SH n={1} title="Choose Location" done={!!svcType}/>
                  <div className="grid sm:grid-cols-2 gap-3 mt-4">
                    {[{id:"studio",label:"Home Studio",sub:"Private, premium studio",note:"💳 Online payment required",icon:<Building2 className="w-4 h-4"/>},{id:"mobile",label:"Mobile Service",sub:"Your home or hotel",note:"💰 Pay after session",icon:<Home className="w-4 h-4"/>}].map(opt=>(
                      <SelCard key={opt.id} selected={svcType===opt.id} onClick={()=>setSvcType(opt.id)}>
                        <div className="flex items-center gap-2 mb-1"><span className="text-gray-400">{opt.icon}</span><span className="font-bold text-gray-900 text-sm">{opt.label}</span></div>
                        <p className="text-xs text-gray-500 mb-1">{opt.sub}</p>
                        <p className="text-xs font-semibold" style={{color:"#0891b2"}}>{opt.note}</p>
                      </SelCard>
                    ))}
                  </div>
                </FormCard>
                {/* Step 2 */}
                <FormCard>
                  <SH n={2} title="Choose Therapy" done={!!selService}/>
                  <div className="space-y-3 mt-4">
                    {services.map(svc=>(
                      <div key={svc.id} onClick={()=>setSelService(svc.id)} className={`p-4 rounded-xl cursor-pointer card-hover border-2 flex items-start gap-4 ${selService===svc.id?"border-cyan-500 bg-cyan-50":"border-gray-200 hover:border-gray-300"}`}>
                        <img src={svc.image} alt={svc.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0"/>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1"><span>{svc.icon}</span><span className="font-bold text-gray-900 text-sm">{svc.name}</span><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${svc.badgeColor}`}>{svc.badge}</span></div>
                          <p className="text-xs text-gray-500 mb-2">{svc.description}</p>
                          {svc.maleOnly && <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700">👨 Male therapist only</span>}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {Object.entries(pricing[svcType][svc.id]).map(([m,p])=>{ const multi=Object.keys(pricing[svcType][svc.id]).length>1; return <span key={m} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{background:"#f0f9ff",color:"#0891b2",border:"1px solid #bae6fd"}}>{multi?`${m}min · `:""}{fmt(p)}</span>; })}
                          </div>
                        </div>
                        {selService===svc.id && <Tick/>}
                      </div>
                    ))}
                  </div>
                </FormCard>
                {/* Step 3 */}
                <FormCard>
                  <SH n={3} title="Therapist Preference" done={!!therapist}/>
                  {selService==="sports" && <InfoBox color="blue" text="Sports Massage is performed by male therapists only."/>}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
                    {[{id:"any",label:"No Preference",sub:"Earliest available"},{id:"female",label:"Female",sub:"Specific request"},{id:"male",label:"Male",sub:"Specific request"}].map(opt=>{
                      const disabled=selService==="sports"&&opt.id!=="male";
                      return <button key={opt.id} onClick={()=>!disabled&&setTherapist(opt.id)} disabled={disabled} className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-all ${therapist===opt.id?"border-cyan-500 bg-cyan-50":disabled?"border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed":"border-gray-200 hover:border-gray-300"}`}><User className="w-5 h-5 mx-auto mb-1.5 text-gray-500"/><p className="text-xs sm:text-sm font-bold text-gray-900">{opt.label}</p><p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{opt.sub}</p></button>;
                    })}
                  </div>
                </FormCard>
                {/* Step 4 */}
                <FormCard>
                  <SH n={4} title="Session Duration" done={!!duration}/>
                  {selService==="sports" ? (
                    <div className="mt-4 p-4 rounded-xl border-2" style={{borderColor:"#06b6d4",background:"#f0f9ff"}}><p className="text-xs font-semibold text-gray-500 mb-1">Fixed Rate</p><p className="text-2xl font-bold" style={{fontFamily:"Cormorant Garamond",color:"#0891b2"}}>{fmt(pricing[svcType]["sports"][60])}</p></div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {availDurations(selService).map(m=>{ const p=selService?pricing[svcType][selService]?.[m]:null; return <div key={m} onClick={()=>setDuration(m)} className={`p-4 rounded-xl cursor-pointer card-hover border-2 text-center ${duration===m?"border-cyan-500 bg-cyan-50":"border-gray-200 hover:border-gray-300"}`}>{duration===m&&<span className="text-xs font-bold px-2 py-0.5 rounded-full text-white mb-2 inline-block" style={{background:"#0891b2"}}>SELECTED</span>}<div className="text-2xl sm:text-3xl font-bold text-gray-900" style={{fontFamily:"Cormorant Garamond"}}>{m}</div><div className="text-xs text-gray-500 mb-1">MINUTES</div>{p&&<div className="text-sm font-bold" style={{color:"#0891b2"}}>{fmt(p)}</div>}</div>; })}
                    </div>
                  )}
                </FormCard>
                {/* Step 5 */}
                <FormCard>
                  <SH n={5} title="Select Date" done={!!apptDate}/>
                  <div className="mt-4 p-4 rounded-xl" style={{border:"2px solid #bae6fd",background:"#f0f9ff"}}>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">Appointment Date</label>
                    <input type="date" value={apptDate} onChange={e=>setApptDate(e.target.value)} min={today()} max={maxDate()} className="w-full p-3 rounded-lg font-semibold text-gray-900 text-sm focus:outline-none" style={{border:"2px solid #bae6fd",background:"white"}}/>
                    <p className="text-xs text-gray-400 mt-2">Bookable up to 3 months in advance</p>
                  </div>
                </FormCard>
                {/* Step 6 */}
                <FormCard>
                  <SH n={6} title="Select Time" done={!!apptTime}/>
                  {svcType==="mobile"&&<InfoBox color="blue" text="Mobile service available 7 AM – 12 AM, 7 days a week"/>}
                  <div className={`grid gap-2 mt-4 ${svcType==="mobile"?"grid-cols-3 sm:grid-cols-6":"grid-cols-3 sm:grid-cols-5"}`}>
                    {(svcType==="mobile"?mobileSlots:studioSlots).map(t=>(
                      <button key={t} onClick={()=>setApptTime(t)} className={`p-2 rounded-lg text-xs sm:text-sm font-semibold transition-all border-2 ${apptTime===t?"text-white border-cyan-500":"text-gray-700 border-gray-200 hover:border-gray-300"}`} style={apptTime===t?{background:"#0891b2"}:{}}>{t}</button>
                    ))}
                  </div>
                </FormCard>
                {/* Step 7 */}
                <FormCard>
                  <SH n={7} title="Your Information" done={!!(custName&&custPhone&&custPhone.replace(/\D/g,"").length>=11)}/>
                  <div className="space-y-4 mt-4">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-2">Full Name *</label><input type="text" value={custName} onChange={e=>setCustName(e.target.value)} placeholder="Enter your full name" className="w-full p-3 rounded-lg text-sm focus:outline-none" style={{border:`2px solid ${custName?"#06b6d4":"#e5e7eb"}`}}/></div>
                    <PhoneField label="Phone Number *" value={custPhone} error={phoneErr} onChange={v=>handlePhoneChange(v,setCustPhone,setPhoneErr)}/>
                  </div>
                </FormCard>
                {/* Step 8 */}
                <FormCard>
                  <SH n={8} title="Payment Option" done={true}/>
                  {svcType==="studio" ? (
                    <div className="mt-4">
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[{id:"full",label:"Pay in Full",sub:"Complete payment now",amt:bookingPrice()},{id:"deposit",label:"50% Deposit",sub:"Balance paid at studio",amt:bookingPrice()*0.5}].map(opt=>(
                          <SelCard key={opt.id} selected={payOpt===opt.id} onClick={()=>setPayOpt(opt.id)}><p className="font-bold text-gray-900 text-sm mb-0.5">{opt.label}</p><p className="text-xs text-gray-500 mb-2">{opt.sub}</p><p className="text-base font-bold" style={{color:"#0891b2"}}>{duration?fmt(opt.amt):"—"}</p></SelCard>
                        ))}
                      </div>
                      <InfoBox color="blue" text="Secure online payment required for studio bookings. Powered by Paystack."/>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 rounded-xl border-2" style={{borderColor:"#34d399",background:"#ecfdf5"}}><p className="font-bold text-gray-900 text-sm">Pay After Session</p><p className="text-xs text-gray-500 mt-0.5">Payment collected upon completion of your mobile session.</p></div>
                  )}
                </FormCard>
                <div className="lg:hidden"><FormCard><BookSummary selService={selService} services={services} duration={duration} svcType={svcType} therapist={therapist} apptDate={apptDate} apptTime={apptTime} custName={custName} custPhone={custPhone} payOpt={payOpt} bookingPrice={bookingPrice} bookingPay={bookingPay} bookingDone={bookingDone} handleBooking={handleBooking}/></FormCard></div>
              </div>
              <div className="hidden lg:block"><div className="sticky top-24"><FormCard><div className="flex items-center gap-2 mb-5"><div className="w-2 h-5 rounded-full" style={{background:"#06b6d4"}}></div><h4 className="font-bold text-gray-900">Booking Summary</h4></div><BookSummary selService={selService} services={services} duration={duration} svcType={svcType} therapist={therapist} apptDate={apptDate} apptTime={apptTime} custName={custName} custPhone={custPhone} payOpt={payOpt} bookingPrice={bookingPrice} bookingPay={bookingPay} bookingDone={bookingDone} handleBooking={handleBooking}/></FormCard></div></div>
            </div>
          </div>
        )}

        {/* ══ MEMBERSHIP TAB ══ */}
        {activeTab==="membership" && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold" style={{background:"rgba(255,255,255,0.15)",color:"#fde68a",border:"1px solid rgba(255,255,255,0.2)"}}><Crown className="w-3.5 h-3.5"/> Monthly Wellness Membership</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3" style={{fontFamily:"Cormorant Garamond"}}>Commit to Your Wellbeing</h2>
              <p className="text-cyan-200 max-w-lg mx-auto text-sm">Choose a monthly plan and enjoy 10% off every session. Stay consistent, feel the difference.</p>
            </div>

            {/* Plan Cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[{id:"single",label:"Solo Wellness",sessions:1,desc:"One premium session per month.",icon:"🌿",popular:false},{id:"double",label:"Duo Wellness",sessions:2,desc:"Two sessions per month for deeper, consistent recovery.",icon:"⚡",popular:true}].map(plan=>(
                <div key={plan.id} onClick={()=>setMemPlan(plan.id)} className="rounded-2xl p-6 cursor-pointer card-hover relative overflow-hidden"
                  style={{background:memPlan===plan.id?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.08)",border:memPlan===plan.id?"2px solid #06b6d4":"2px solid rgba(255,255,255,0.15)"}}>
                  {plan.popular&&<span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full" style={{background:"#06b6d4",color:"white"}}>Best Value</span>}
                  <div className="text-3xl mb-3">{plan.icon}</div>
                  <h3 className="text-lg font-bold mb-1" style={{color:memPlan===plan.id?"#0891b2":"white",fontFamily:"Cormorant Garamond"}}>{plan.label}</h3>
                  <p className="text-sm mb-3" style={{color:memPlan===plan.id?"#6b7280":"rgba(255,255,255,0.7)"}}>{plan.desc}</p>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" style={{color:memPlan===plan.id?"#0891b2":"#67e8f9"}}/><span className="text-sm font-semibold" style={{color:memPlan===plan.id?"#0891b2":"#67e8f9"}}>{plan.sessions} session{plan.sessions>1?"s":""}/month</span></div>
                  {memPlan===plan.id&&memService&&memDuration&&(
                    <div className="mt-4 pt-4" style={{borderTop:"1px solid #e5e7eb"}}>
                      <div className="flex justify-between text-sm mb-1"><span className="text-gray-400 line-through">{fmt(plan.sessions===1?memBasePrice():memBasePrice()*2)}</span><span className="text-xs font-semibold text-emerald-600">10% OFF</span></div>
                      <p className="text-2xl font-bold" style={{color:"#0891b2",fontFamily:"Cormorant Garamond"}}>{fmt(memMonthly())}<span className="text-sm font-normal text-gray-500">/month</span></p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <FormCard>
              <h4 className="font-bold text-gray-900 mb-5" style={{fontFamily:"Cormorant Garamond",fontSize:"1.125rem"}}>Customise Your Plan</h4>
              {/* Location */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Service Location</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{id:"studio",label:"Home Studio",icon:<Building2 className="w-4 h-4"/>},{id:"mobile",label:"Mobile Service",icon:<Home className="w-4 h-4"/>}].map(opt=>(
                    <SelCard key={opt.id} selected={memSvcType===opt.id} onClick={()=>setMemSvcType(opt.id)}><div className="flex items-center gap-2"><span className="text-gray-400">{opt.icon}</span><span className="font-semibold text-gray-900 text-sm">{opt.label}</span></div></SelCard>
                  ))}
                </div>
              </div>
              {/* Service */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Choose Service</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {services.map(svc=>(
                    <div key={svc.id} onClick={()=>setMemService(svc.id)} className={`p-3 rounded-xl cursor-pointer card-hover border-2 flex items-center gap-3 ${memService===svc.id?"border-cyan-500 bg-cyan-50":"border-gray-200 hover:border-gray-300"}`}>
                      <span className="text-xl">{svc.icon}</span><div className="flex-1"><p className="font-semibold text-gray-900 text-sm">{svc.name}</p></div>{memService===svc.id&&<Tick/>}
                    </div>
                  ))}
                </div>
              </div>
              {/* Duration */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Session Duration</label>
                {memService==="sports" ? (
                  <div className="p-3 rounded-xl border-2" style={{borderColor:"#06b6d4",background:"#f0f9ff"}}><p className="text-sm font-bold" style={{color:"#0891b2"}}>Fixed Rate · {fmt(pricing[memSvcType]["sports"][60])}<span className="text-xs font-normal text-gray-500 ml-2 line-through">{fmt(pricing[memSvcType]["sports"][60]/0.9)}</span><span className="text-xs font-semibold text-emerald-600 ml-1">10% off</span></p></div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availDurations(memService).map(m=>{ const base=getPrice(memSvcType,memService,m); const dp=disc(base); return <div key={m} onClick={()=>setMemDuration(m)} className={`p-3 rounded-xl cursor-pointer card-hover border-2 text-center ${memDuration===m?"border-cyan-500 bg-cyan-50":"border-gray-200 hover:border-gray-300"}`}><p className="font-bold text-gray-900 text-sm">{m} min</p><p className="text-xs text-gray-400 line-through">{fmt(base)}</p><p className="text-sm font-bold" style={{color:"#0891b2"}}>{fmt(dp)}</p><p className="text-xs text-emerald-600 font-semibold">10% off</p></div>; })}
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <div><label className="block text-xs font-semibold text-gray-600 mb-2">Full Name *</label><input type="text" value={memName} onChange={e=>setMemName(e.target.value)} placeholder="Your name" className="w-full p-3 rounded-lg text-sm focus:outline-none" style={{border:`2px solid ${memName?"#06b6d4":"#e5e7eb"}`}}/></div>
                <PhoneField label="Phone Number *" value={memPhone} error={memPhoneErr} onChange={v=>handlePhoneChange(v,setMemPhone,setMemPhoneErr)}/>
              </div>
              {/* Price summary */}
              {memService&&memDuration&&(
                <div className="rounded-xl p-4 mb-5" style={{background:"#f0f9ff",border:"2px solid #bae6fd"}}>
                  <div className="flex justify-between items-center">
                    <div><p className="text-sm font-semibold text-gray-700">{memPlan==="single"?"Single Session / Month":"Double Session / Month"}</p><p className="text-xs text-gray-400 mt-0.5">Billed monthly · 10% member discount applied</p></div>
                    <div className="text-right"><p className="text-2xl font-bold" style={{fontFamily:"Cormorant Garamond",color:"#0891b2"}}>{fmt(memMonthly())}</p><p className="text-xs text-gray-400">/month</p></div>
                  </div>
                </div>
              )}
              <button onClick={handleMembership} disabled={!memDone} className="w-full py-4 rounded-xl font-bold text-white btn-glow" style={{background:memDone?"linear-gradient(135deg,#0891b2,#06b6d4)":"#e5e7eb",color:memDone?"white":"#9ca3af",cursor:memDone?"pointer":"not-allowed"}}>
                <Crown className="w-4 h-4 inline mr-2"/>Start My Membership →
              </button>
              <InfoBox color="blue" text="Secure payment via Paystack. We'll call to schedule your first session and set up your monthly calendar."/>
            </FormCard>
          </div>
        )}

        {/* ══ GIFT CARD TAB ══ */}
        {activeTab==="giftcard" && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-semibold" style={{background:"rgba(255,255,255,0.15)",color:"#fbcfe8",border:"1px solid rgba(255,255,255,0.2)"}}><Gift className="w-3.5 h-3.5"/> Massage Gift Card</div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3" style={{fontFamily:"Cormorant Garamond"}}>Give the Gift of Wellness</h2>
              <p className="text-cyan-200 max-w-lg mx-auto text-sm">Gift a premium massage experience. We'll personally contact both you and your recipient with all details.</p>
            </div>

            {/* Live preview */}
            <div className="rounded-2xl p-6 mb-8 text-white relative overflow-hidden" style={{background:"linear-gradient(135deg,#0c4a6e,#0e7490,#164e63)",border:"1px solid rgba(255,255,255,0.2)"}}>
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10" style={{background:"white",transform:"translate(30%,-30%)"}}></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-5" style={{background:"white",transform:"translate(-30%,30%)"}}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6"><div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-cyan-300"/><span className="font-bold" style={{fontFamily:"Cormorant Garamond"}}>Vivify Massage & Spa</span></div><Gift className="w-6 h-6 text-cyan-300"/></div>
                <p className="text-xs text-cyan-300 mb-1">A special gift for</p>
                <p className="text-2xl font-bold mb-1" style={{fontFamily:"Cormorant Garamond"}}>{gcRecpName||"Your Recipient"}</p>
                <p className="text-sm text-cyan-200 italic mb-6">"{gcCaption||"Wishing you pure relaxation 💆"}"</p>
                <div className="flex justify-between items-end">
                  <div><p className="text-xs text-cyan-300">{gcService?services.find(s=>s.id===gcService)?.name:"Select a service"}</p><p className="text-xs text-cyan-300">{gcSvcType==="studio"?"Home Studio":"Mobile Service"}</p><p className="text-xs text-cyan-300 mt-0.5">From {gcBuyerName||"Your Name"}</p></div>
                  <p className="text-3xl font-bold" style={{fontFamily:"Cormorant Garamond"}}>{gcPrice()?fmt(gcPrice()):"₦—"}</p>
                </div>
              </div>
            </div>

            <FormCard>
              {/* Location */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Service Location</label>
                <div className="grid grid-cols-2 gap-3">{[{id:"studio",label:"Home Studio",icon:<Building2 className="w-4 h-4"/>},{id:"mobile",label:"Mobile Service",icon:<Home className="w-4 h-4"/>}].map(opt=>(<SelCard key={opt.id} selected={gcSvcType===opt.id} onClick={()=>setGcSvcType(opt.id)}><div className="flex items-center gap-2"><span className="text-gray-400">{opt.icon}</span><span className="font-semibold text-gray-900 text-sm">{opt.label}</span></div></SelCard>))}</div>
              </div>
              {/* Service */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Choose Service</label>
                <div className="grid sm:grid-cols-2 gap-2">{services.map(svc=>(<div key={svc.id} onClick={()=>setGcService(svc.id)} className={`p-3 rounded-xl cursor-pointer card-hover border-2 flex items-center gap-3 ${gcService===svc.id?"border-cyan-500 bg-cyan-50":"border-gray-200 hover:border-gray-300"}`}><span className="text-xl">{svc.icon}</span><div className="flex-1"><p className="font-semibold text-gray-900 text-sm">{svc.name}</p></div>{gcService===svc.id&&<Tick/>}</div>))}</div>
              </div>
              {/* Duration */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Session Duration</label>
                {gcService==="sports" ? (
                  <div className="p-3 rounded-xl border-2" style={{borderColor:"#06b6d4",background:"#f0f9ff"}}><p className="text-sm font-bold" style={{color:"#0891b2"}}>Fixed Rate · {fmt(pricing[gcSvcType]["sports"][60])}</p></div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">{availDurations(gcService).map(m=>{ const p=getPrice(gcSvcType,gcService,m); return <div key={m} onClick={()=>setGcDuration(m)} className={`p-3 rounded-xl cursor-pointer card-hover border-2 text-center ${gcDuration===m?"border-cyan-500 bg-cyan-50":"border-gray-200 hover:border-gray-300"}`}><p className="font-bold text-gray-900 text-sm">{m} min</p><p className="text-sm font-bold mt-1" style={{color:"#0891b2"}}>{fmt(p)}</p></div>; })}</div>
                )}
              </div>
              {/* Caption */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-600 mb-2">Personal Message <span className="font-normal text-gray-400">(optional)</span></label>
                <textarea value={gcCaption} onChange={e=>setGcCaption(e.target.value)} rows={3} placeholder="Wishing you pure relaxation 💆 — write something personal for your recipient…" className="w-full p-3 rounded-lg text-sm focus:outline-none resize-none" style={{border:"2px solid #e5e7eb"}}/>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-5">
                {/* Buyer */}
                <div>
                  <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm pb-2" style={{borderBottom:"1px solid #f3f4f6"}}><User className="w-4 h-4 text-cyan-600"/>You (Buying)</h5>
                  <div className="space-y-3">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label><input type="text" value={gcBuyerName} onChange={e=>setGcBuyerName(e.target.value)} placeholder="Your name" className="w-full p-3 rounded-lg text-sm focus:outline-none" style={{border:`2px solid ${gcBuyerName?"#06b6d4":"#e5e7eb"}`}}/></div>
                    <PhoneField label="Phone *" value={gcBuyerPhone} error={gcBPhoneErr} onChange={v=>handlePhoneChange(v,setGcBuyerPhone,setGcBPhoneErr)}/>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label><input type="email" value={gcBuyerEmail} onChange={e=>setGcBuyerEmail(e.target.value)} placeholder="your@email.com" className="w-full p-3 rounded-lg text-sm focus:outline-none" style={{border:`2px solid ${gcBuyerEmail?"#06b6d4":"#e5e7eb"}`}}/></div>
                  </div>
                </div>
                {/* Recipient */}
                <div>
                  <h5 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm pb-2" style={{borderBottom:"1px solid #fce7f3"}}><Gift className="w-4 h-4 text-pink-500"/>Recipient</h5>
                  <div className="space-y-3">
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label><input type="text" value={gcRecpName} onChange={e=>setGcRecpName(e.target.value)} placeholder="Recipient's name" className="w-full p-3 rounded-lg text-sm focus:outline-none" style={{border:`2px solid ${gcRecpName?"#06b6d4":"#e5e7eb"}`}}/></div>
                    <PhoneField label="Phone" value={gcRecpPhone} error={gcRPhoneErr} onChange={v=>handlePhoneChange(v,setGcRecpPhone,setGcRPhoneErr)} placeholder="08012345678"/>
                    <div><label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label><input type="email" value={gcRecpEmail} onChange={e=>setGcRecpEmail(e.target.value)} placeholder="recipient@email.com" className="w-full p-3 rounded-lg text-sm focus:outline-none" style={{border:`2px solid ${gcRecpEmail?"#06b6d4":"#e5e7eb"}`}}/></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-5">* Provide at least one contact (phone or email) for the recipient so we can deliver their gift.</p>

              {gcService&&gcPrice()>0&&(
                <div className="rounded-xl p-4 mb-5" style={{background:"#fce7f3",border:"2px solid #fbcfe8"}}>
                  <div className="flex justify-between items-center">
                    <div><p className="text-sm font-semibold text-gray-700">Gift Card Value</p><p className="text-xs text-gray-400 mt-0.5">{services.find(s=>s.id===gcService)?.name} · {gcSvcType==="studio"?"Home Studio":"Mobile Service"}</p></div>
                    <p className="text-2xl font-bold" style={{fontFamily:"Cormorant Garamond",color:"#db2777"}}>{fmt(gcPrice())}</p>
                  </div>
                </div>
              )}

              <button onClick={handleGiftCard} disabled={!gcDone} className="w-full py-4 rounded-xl font-bold text-white btn-glow" style={{background:gcDone?"linear-gradient(135deg,#db2777,#ec4899)":"#e5e7eb",color:gcDone?"white":"#9ca3af",cursor:gcDone?"pointer":"not-allowed"}}>
                <Gift className="w-4 h-4 inline mr-2"/>Purchase Gift Card →
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-3"><Shield className="w-3.5 h-3.5"/><span>Secure via Paystack · We'll personally contact both buyer and recipient</span></div>
            </FormCard>
          </div>
        )}
      </div>

      {/* ── Testimonials ── */}
      <section className="py-14 sm:py-20" style={{background:"rgba(255,255,255,0.05)",backdropFilter:"blur(4px)"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10"><h3 className="text-2xl sm:text-3xl font-bold text-white" style={{fontFamily:"Cormorant Garamond"}}>What Our Clients Say</h3></div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[{name:"Abu M.",text:"Had chronic shoulder pain for 6 months. After 3 sessions with Vivify, I'm back to training pain-free.",rating:5},{name:"Adeola O.",text:"Having a professional therapist come to my home was incredible. No rushing through traffic, just pure relaxation in my own space.",rating:5},{name:"Kareem J.",text:"Deep tissue massage that delivered real results. My back pain is significantly better and the staff was incredibly professional.",rating:5}].map((t,i)=>(
              <div key={i} className="rounded-2xl p-6" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)"}}>
                <div className="flex gap-0.5 mb-3">{Array(t.rating).fill(0).map((_,j)=><Star key={j} className="w-4 h-4 text-amber-400" fill="currentColor"/>)}</div>
                <p className="text-sm mb-4 italic leading-relaxed" style={{color:"#bae6fd"}}>"{t.text}"</p>
                <p className="text-sm font-bold text-white">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 sm:py-14" style={{background:"#0c1a2e"}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div><div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:"linear-gradient(135deg,#0891b2,#06b6d4)"}}><Sparkles className="w-4 h-4 text-white"/></div><h4 className="text-lg font-bold text-white" style={{fontFamily:"Cormorant Garamond"}}>Vivify Massage & Spa</h4></div><p style={{color:"#6b7280",fontSize:"0.875rem"}}>Your sanctuary for relaxation and rejuvenation.</p></div>
            <div><h4 className="text-base font-bold text-white mb-4">Contact</h4><div className="space-y-3" style={{color:"#6b7280",fontSize:"0.875rem"}}><div className="flex items-start gap-3"><Phone className="w-4 h-4 mt-0.5 flex-shrink-0" style={{color:"#06b6d4"}}/><div><p className="font-semibold text-white">07040723894</p><p>Available for bookings</p></div></div><div className="flex items-start gap-3"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{color:"#06b6d4"}}/><div><p className="font-semibold text-white">Studio Location</p><p>Ewa Block Industry, Alao Farm, Tanke Akata.</p></div></div></div></div>
            <div><h4 className="text-base font-bold text-white mb-4">Hours</h4><div className="space-y-2" style={{color:"#6b7280",fontSize:"0.875rem"}}><div className="flex justify-between"><span>Studio</span><span className="font-semibold text-white">9:00 AM – 6:00 PM</span></div><div className="flex justify-between"><span>Mobile</span><span className="font-semibold text-white">7:00 AM – 12:00 AM</span></div></div></div>
          </div>
          <div className="pt-8 flex items-center justify-between flex-wrap gap-4" style={{borderTop:"1px solid #1e293b",color:"#4b5563",fontSize:"0.75rem"}}>
            <p>© 2026 Vivify Massage & Spa. All rights reserved.</p>
            <p>Payment processing by Paystack</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ── Shared Sub-components ─────────────────────────────────────────────────────
const FormCard = ({children}) => <div className="bg-white rounded-2xl p-5 sm:p-7 shadow-sm" style={{border:"1px solid #e5e7eb"}}>{children}</div>;

const SH = ({n,title,done}) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0" style={{background:done?"#0891b2":"#f3f4f6",color:done?"white":"#374151"}}>
      {done?<Check className="w-4 h-4"/>:n}
    </div>
    <h4 className="text-base sm:text-lg font-bold text-gray-900" style={{fontFamily:"Cormorant Garamond"}}>{title}</h4>
    {done&&<span className="text-xs font-semibold px-2 py-0.5 rounded-full ml-auto" style={{background:"#d1fae5",color:"#065f46"}}>Done ✓</span>}
  </div>
);

const SelCard = ({selected,onClick,children}) => (
  <div onClick={onClick} className={`p-4 rounded-xl cursor-pointer card-hover border-2 ${selected?"border-cyan-500 bg-cyan-50":"border-gray-200 hover:border-gray-300"}`}>
    <div className="flex items-start justify-between gap-2">{children}{selected&&<Tick/>}</div>
  </div>
);

const Tick = () => <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{background:"#0891b2"}}><Check className="w-3 h-3 text-white"/></div>;

const InfoBox = ({color,text}) => {
  const c = {blue:{bg:"#eff6ff",border:"#bfdbfe",col:"#1d4ed8"}}[color]||{bg:"#eff6ff",border:"#bfdbfe",col:"#1d4ed8"};
  return <div className="flex items-center gap-2 mt-3 p-3 rounded-lg text-xs" style={{background:c.bg,border:`1px solid ${c.border}`,color:c.col}}><Shield className="w-3.5 h-3.5 flex-shrink-0"/>{text}</div>;
};

const PhoneField = ({label,value,error,onChange,placeholder="08012345678"}) => {
  const d = value.replace(/\D/g,"");
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label} <span className="font-normal text-gray-400">(11 digits)</span></label>
      <input type="tel" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} maxLength={14} className="w-full p-3 rounded-lg text-sm focus:outline-none" style={{border:`2px solid ${error?"#ef4444":d.length===11?"#06b6d4":"#e5e7eb"}`}}/>
      {error&&<div className="flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5 text-red-500"/><p className="text-xs text-red-500">{error}</p></div>}
      {!error&&d.length>0&&<p className="text-xs mt-1" style={{color:d.length===11?"#059669":"#6b7280"}}>{d.length}/11 {d.length===11&&"✓"}</p>}
    </div>
  );
};

const SummaryBox = ({rows,highlight}) => (
  <div className="rounded-xl p-4 mb-5 space-y-2.5" style={{background:"#f0f9ff"}}>
    {rows.map(([label,val])=>(
      <div key={label} className="flex justify-between text-sm">
        <span className="text-gray-500">{label}</span>
        <span className={`font-semibold text-right max-w-[60%] truncate ${label===highlight?"text-lg":""}`} style={label===highlight?{color:"#0891b2",fontFamily:"Cormorant Garamond"}:{color:"#111827"}}>{val}</span>
      </div>
    ))}
  </div>
);

const BookSummary = ({selService,services,duration,svcType,therapist,apptDate,apptTime,custName,custPhone,payOpt,bookingPrice,bookingPay,bookingDone,handleBooking}) => {
  const svcObj = services.find(s=>s.id===selService);
  return (
    <div>
      <div className="space-y-2.5 mb-5">
        {[["Service",svcObj?.name||"—"],["Location",svcType==="studio"?"Home Studio":"Mobile Service"],["Duration",duration?`${duration} min`:"—"],["Therapist",therapist==="male"?"Male":therapist==="female"?"Female":therapist==="any"?"Any":"—"],["Date",apptDate||"—"],["Time",apptTime||"—"],["Name",custName||"—"],["Phone",custPhone||"—"]].map(([l,v])=>(
          <div key={l} className="flex justify-between text-sm"><span className="text-gray-400">{l}</span><span className="font-semibold text-gray-900 text-right max-w-[55%] truncate">{v}</span></div>
        ))}
      </div>
      <div className="pt-4 mb-5" style={{borderTop:"1px solid #e5e7eb"}}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-gray-600">{svcType==="studio"&&payOpt==="deposit"?"Pay Now (50%)":svcType==="studio"?"Pay Now":"Total Due"}</span>
          <span className="text-2xl font-bold" style={{fontFamily:"Cormorant Garamond",color:"#0891b2"}}>{duration?`₦${Number(bookingPay()).toLocaleString()}`:"—"}</span>
        </div>
        {svcType==="studio"&&payOpt==="deposit"&&duration&&<p className="text-xs text-right text-gray-400">Balance ₦{Number(bookingPrice()*0.5).toLocaleString()} at studio</p>}
        <p className="text-xs text-right mt-0.5 text-gray-400">*All taxes included</p>
      </div>
      <button onClick={handleBooking} disabled={!bookingDone} className="w-full py-3.5 rounded-xl font-bold text-sm btn-glow" style={{background:bookingDone?"linear-gradient(135deg,#0891b2,#06b6d4)":"#e5e7eb",color:bookingDone?"white":"#9ca3af",cursor:bookingDone?"pointer":"not-allowed"}}>
        {svcType==="studio"?"Proceed to Payment →":"Confirm Booking →"}
      </button>
      {bookingDone&&<p className="text-xs text-center mt-2.5 text-gray-400">{svcType==="studio"?"🔒 Secure via Paystack":"✓ Pay after your session"}</p>}
    </div>
  );
};

export default VivifySpaWebsite;