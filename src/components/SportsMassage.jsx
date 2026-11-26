import React, { useState } from "react";
import { Activity, Shield, AlertCircle, ArrowRight, Check, Target } from "lucide-react";
import { fmt } from "../config/services";

const PAYSTACK_KEY = "pk_live_915663b76742c16f999c99e6251596ee7c5c9584";
const WA_NUMBER = "2347040723894";

const TECHNIQUES = [
  { id: "met", name: "MET (Muscle Energy)", desc: "Active stretching to improve mobility and reduce stiffness." },
  { id: "pnf", name: "PNF (Proprioceptive)", desc: "Advanced stretching for maximum range of motion and recovery." },
  { id: "deep", name: "Deep Tissue Sports", desc: "Intense focus on specific sports-related knots and tension." },
];

const FOCUS_AREAS = [
  "Hamstrings", "Quads", "Calves", "Lower Back", "Glutes", "Shoulders", "Neck", "Full Body"
];

export default function SportsMassage() {
  const [technique, setTechnique] = useState("met");
  const [focus, setFocus] = useState([]);
  const [duration, setDuration] = useState(60);
  const [sport, setSport] = useState("");
  const [injuries, setInjuries] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  // Pricing logic for sports massage
  const getSportsPrice = () => {
    let base = 25000; // Base for 60 mins
    if (duration === 90) base = 35000;
    if (duration === 120) base = 45000;
    return base;
  };

  const total = getSportsPrice();

  const toggleFocus = (area) => {
    setFocus(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || phone.length < 11 || !email) {
      return setErrorMsg("Please complete all your personal details.");
    }

    setLoading(true);
    setErrorMsg("");
    const ref = `SPT-${Date.now()}`;

    try {
      if (!window.PaystackPop) throw new Error("Payment system loading. Please wait.");

      window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: email,
        amount: total * 100,
        currency: "NGN",
        ref: ref,
        metadata: {
          custom_fields: [
            { display_name: "Athlete", variable_name: "athlete", value: name },
            { display_name: "Technique", variable_name: "technique", value: technique },
          ],
        },
        callback: function (response) {
          // Send email via API
          fetch("/api/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "sports",
              data: {
                ref: response.reference,
                customerName: name,
                customerPhone: phone,
                email: email,
                technique: technique.toUpperCase(),
                techniqueFull: TECHNIQUES.find(t => t.id === technique)?.name,
                minutes: duration,
                focus: focus.length ? focus : ["Full Body"],
                sportType: sport || "General Fitness",
                injuries: injuries,
                price: total,
                paymentRef: response.reference,
                date: new Date().toLocaleDateString(),
                time: "TBD",
              },
            }),
          }).catch(console.error);

          setBookingRef(response.reference);
          setLoading(false);
          setSuccess(true);
        },
        onClose: function () {
          setLoading(false);
          setErrorMsg("Payment cancelled. You can try again.");
        },
      }).openIframe();
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || "Something went wrong.");
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 animate-luxe text-center">
        <div className="w-24 h-24 rounded-full bg-[#E8EDE6] mx-auto flex items-center justify-center mb-6">
          <Check className="w-12 h-12 text-[#4A5D4E]" />
        </div>
        <h2 className="text-4xl font-medium text-[#2C3531] mb-4" style={{ fontFamily: "Cormorant Garamond" }}>Recovery Session Confirmed</h2>
        <p className="text-[#5A6B5D] mb-8">Your sports massage is booked. Reference: <span className="font-mono bg-[#F9F6F0] px-2 py-1 rounded">{bookingRef}</span></p>
        <div className="bg-white p-6 rounded-3xl border border-[#E8EDE6] text-left mb-8 max-w-md mx-auto">
          <p className="text-sm text-[#5A6B5D] mb-2"><b className="text-[#2C3531]">Technique:</b> {TECHNIQUES.find(t => t.id === technique)?.name}</p>
          <p className="text-sm text-[#5A6B5D] mb-2"><b className="text-[#2C3531]">Duration:</b> {duration} mins</p>
          <p className="text-sm text-[#5A6B5D]"><b className="text-[#2C3531]">Amount Paid:</b> {fmt(total)}</p>
        </div>
        <button onClick={() => window.location.href = `https://wa.me/${WA_NUMBER}?text=Hello Vivify! I just booked a Sports Massage (${bookingRef}).`} className="px-8 py-4 rounded-full bg-[#25D366] text-white font-bold shadow-lg">
          Message Specialist on WhatsApp
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 animate-luxe">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold tracking-widest uppercase bg-[#E8EDE6] text-[#4A5D4E]">
          <Activity className="w-3.5 h-3.5" /> Athletic Recovery
        </div>
        <h2 className="text-4xl sm:text-5xl font-medium text-[#2C3531] mb-4" style={{ fontFamily: "Cormorant Garamond" }}>
          Sports Massage <span className="italic text-[#C8795D]">Therapy.</span>
        </h2>
        <p className="text-[#5A6B5D] max-w-md mx-auto text-lg font-light">Advanced stretching and deep tissue techniques designed for athletes and active lifestyles.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-[#E8EDE6]">
        {errorMsg && (
          <div className="mb-8 p-4 bg-[#FDF4F2] border border-[#E8C5BC] rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#C8795D] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#9B5C4A] font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Technique */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#4A5D4E] mb-4">1. Select Technique</label>
            <div className="grid grid-cols-1 gap-3">
              {TECHNIQUES.map((t) => (
                <button
                  key={t.id} type="button" onClick={() => setTechnique(t.id)}
                  className="p-4 rounded-2xl border-2 text-left transition-all"
                  style={{ borderColor: technique === t.id ? "#4A5D4E" : "#E8EDE6", background: technique === t.id ? "#F9F6F0" : "white" }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#2C3531] text-sm">{t.name}</span>
                    {technique === t.id && <Check className="w-4 h-4 text-[#4A5D4E]" />}
                  </div>
                  <p className="text-xs text-[#5A6B5D]">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#4A5D4E] mb-4">2. Target Areas (Optional)</label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_AREAS.map((area) => (
                <button
                  key={area} type="button" onClick={() => toggleFocus(area)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${focus.includes(area) ? "bg-[#4A5D4E] border-[#4A5D4E] text-white" : "bg-white border-[#E8EDE6] text-[#5A6B5D] hover:border-[#A3B19B]"}`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Sport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#4A5D4E] mb-4">3. Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {[60, 90, 120].map((m) => (
                  <button
                    key={m} type="button" onClick={() => setDuration(m)}
                    className="p-3 rounded-xl border-2 text-center transition-all"
                    style={{ borderColor: duration === m ? "#4A5D4E" : "#E8EDE6", background: duration === m ? "#F9F6F0" : "white" }}
                  >
                    <p className={`font-bold text-sm ${duration === m ? "text-[#2C3531]" : "text-[#5A6B5D]"}`}>{m} min</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#4A5D4E] mb-4">4. Primary Sport</label>
              <input type="text" value={sport} onChange={(e) => setSport(e.target.value)} placeholder="e.g. Football, Running" className="w-full px-4 py-3 rounded-xl text-sm font-medium border-2 border-[#E8EDE6] focus:border-[#4A5D4E] outline-none" />
            </div>
          </div>

          {/* Injuries */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#4A5D4E] mb-4">5. Injuries or Notes</label>
            <textarea value={injuries} onChange={(e) => setInjuries(e.target.value)} rows={2} placeholder="Any specific pain or injuries we should know about?" className="w-full p-4 rounded-xl text-sm font-medium border-2 border-[#E8EDE6] focus:border-[#4A5D4E] outline-none resize-none" />
          </div>

          <hr className="border-[#F4F1E9]" />

          {/* Personal Details */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-[#4A5D4E] mb-4">Your Details</label>
            <div className="space-y-4">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full px-4 py-3 rounded-xl text-sm font-medium border-2 border-[#E8EDE6] focus:border-[#4A5D4E] outline-none" required />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number (11 digits)" maxLength={14} className="w-full px-4 py-3 rounded-xl text-sm font-medium border-2 border-[#E8EDE6] focus:border-[#4A5D4E] outline-none" required />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full px-4 py-3 rounded-xl text-sm font-medium border-2 border-[#E8EDE6] focus:border-[#4A5D4E] outline-none" required />
            </div>
          </div>

          {/* Total & Submit */}
          <div className="bg-[#F9F6F0] p-6 rounded-2xl border border-[#E8EDE6] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#A3B19B]">Total</p>
              <p className="text-3xl font-bold text-[#4A5D4E]" style={{ fontFamily: "Cormorant Garamond" }}>{fmt(total)}</p>
            </div>
            <button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm text-white transition-all shadow-lg" style={{ background: "#4A5D4E" }}>
              {loading ? "Processing..." : "Book & Pay"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}