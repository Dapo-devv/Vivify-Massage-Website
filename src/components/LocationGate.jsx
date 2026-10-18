import { MapPin, MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { LOCATION_LABEL } from "../config/services";

const WA_NUMBER = "2347040723894";
const LAGOS_WA_MSG = encodeURIComponent(
  "Hello Vivify! I'm in Lagos and I want to book a massage. Can we arrange a session?",
);

export default function LocationGate({ onSelectCity }) {
  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <h2
          className="text-3xl sm:text-4xl font-bold text-white mb-3"
          style={{ fontFamily: "Cormorant Garamond" }}
        >
          Where are you located?
        </h2>
        <p className="text-cyan-200 text-sm max-w-sm mx-auto">
          To give you the best experience, please select your city.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Ilorin Card */}
        <button
          onClick={() => onSelectCity("ilorin")}
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-8 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,249,255,0.95))",
            border: "2px solid #bae6fd",
            boxShadow: "0 12px 32px rgba(8,145,178,0.15)",
          }}
        >
          <div className="w-14 h-14 rounded-2xl mb-5 flex items-center justify-center bg-cyan-100 text-cyan-600">
            <MapPin className="w-7 h-7" />
          </div>
          <h3
            className="text-2xl font-bold text-gray-900 mb-1"
            style={{ fontFamily: "Cormorant Garamond" }}
          >
            Ilorin
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Book instantly online. Choose your massage, date, and therapist.
          </p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">
              Book Online
            </span>
            <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Lagos Card */}
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${LAGOS_WA_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden rounded-3xl p-6 sm:p-8 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            border: "2px solid rgba(255,255,255,0.1)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
          }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
          <div className="w-14 h-14 rounded-2xl mb-5 flex items-center justify-center bg-green-500/20 text-green-400">
            <MessageCircle className="w-7 h-7" />
          </div>
          <h3
            className="text-2xl font-bold text-white mb-1"
            style={{ fontFamily: "Cormorant Garamond" }}
          >
            Lagos
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            We're expanding! Message us on WhatsApp to arrange your session.
          </p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-green-400">
              Book via WhatsApp
            </span>
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
