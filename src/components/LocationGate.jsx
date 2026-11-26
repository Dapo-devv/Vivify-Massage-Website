import { MapPin, MessageCircle, ArrowRight, Sparkles } from "lucide-react";

const WA_NUMBER = "2347040723894";
const LAGOS_WA_MSG = encodeURIComponent(
  "Hello Vivify! I'm in Lagos and I want to book a massage. Can we arrange a session?",
);

export default function LocationGate({ onSelectCity }) {
  return (
    <div className="max-w-4xl mx-auto py-16 sm:py-24 px-4 animate-luxe">
      <div className="text-center mb-12">
        <h2
          className="text-4xl sm:text-5xl font-medium text-[#2C3531] mb-4"
          style={{ fontFamily: "Cormorant Garamond" }}
        >
          Where are you located?
        </h2>
        <p className="text-[#5A6B5D] text-lg font-light max-w-md mx-auto">
          To give you the best experience, please select your city.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ilorin Card */}
        <button
          onClick={() => onSelectCity("ilorin")}
          className="group relative overflow-hidden rounded-[2.5rem] p-8 sm:p-10 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-white border-2 border-[#E8EDE6] shadow-xl shadow-[#4A5D4E]/5 hover:border-[#4A5D4E]/30"
        >
          <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-[#F9F6F0] border border-[#E8EDE6] text-[#4A5D4E] group-hover:scale-110 transition-transform duration-300">
            <MapPin className="w-8 h-8" />
          </div>
          <h3
            className="text-3xl font-medium text-[#2C3531] mb-2"
            style={{ fontFamily: "Cormorant Garamond" }}
          >
            Ilorin
          </h3>
          <p className="text-sm text-[#5A6B5D] mb-8 leading-relaxed">
            Book instantly online. Choose your massage, date, and therapist right now.
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-[#F4F1E9]">
            <span className="font-bold text-[#4A5D4E] text-sm uppercase tracking-wider">
              Book Online
            </span>
            <div className="w-10 h-10 rounded-full bg-[#F9F6F0] flex items-center justify-center group-hover:bg-[#4A5D4E] group-hover:text-white transition-colors duration-300">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Lagos Card */}
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${LAGOS_WA_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative overflow-hidden rounded-[2.5rem] p-8 sm:p-10 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] bg-[#F9F6F0] border-2 border-[#E8EDE6] shadow-xl shadow-[#4A5D4E]/5 hover:border-[#25D366]/30"
        >
          <div className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-white border border-[#E8EDE6] text-[#25D366] group-hover:scale-110 transition-transform duration-300">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h3
            className="text-3xl font-medium text-[#2C3531] mb-2"
            style={{ fontFamily: "Cormorant Garamond" }}
          >
            Lagos
          </h3>
          <p className="text-sm text-[#5A6B5D] mb-8 leading-relaxed">
            We currently accept Lagos bookings via WhatsApp so we can arrange a dedicated specialist for you.
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-[#E8EDE6]">
            <span className="font-bold text-[#25D366] text-sm uppercase tracking-wider">
              Message Us
            </span>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors duration-300 shadow-sm">
              <ArrowRight className="w-4 h-4 text-[#25D366] group-hover:text-white" />
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}