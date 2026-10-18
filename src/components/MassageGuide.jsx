import { Sparkles, ArrowRight } from "lucide-react";
import { SERVICES, fmt, getPrice } from "../config/services";

export default function MassageGuide({ onSelectService }) {
  return (
    <div className="max-w-4xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold tracking-wider uppercase bg-white/10 text-white border border-white/20">
          <Sparkles className="w-3.5 h-3.5" /> Find Your Perfect Massage
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "Cormorant Garamond" }}>
          Not sure what to book?
        </h2>
        <p className="text-cyan-200 text-sm max-w-md mx-auto">
          Read about our treatments below to find the one that fits your body's needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SERVICES.map((svc) => (
          <div
            key={svc.id}
            className="rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div className="h-32 w-full relative">
              <img src={svc.image} alt={svc.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-4">
                <span className="text-2xl">{svc.icon}</span>
                <h3 className="text-lg font-bold text-white leading-tight" style={{ fontFamily: "Cormorant Garamond" }}>
                  {svc.name}
                </h3>
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <div className="mb-3">
                <p className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1">
                  Best for
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {svc.bestFor}
                </p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">
                {svc.longDesc}
              </p>
              
              <button
                onClick={() => onSelectService(svc.id)}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 group"
                style={{
                  background: "linear-gradient(135deg,#0891b2,#06b6d4)",
                }}
              >
                Book This — {fmt(getPrice("studio", svc.id, 60))}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}