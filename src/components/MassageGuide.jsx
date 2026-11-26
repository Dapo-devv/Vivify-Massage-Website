import React from "react";
import { SERVICES, fmt, getPrice } from "../config/services";
import { ArrowRight, Sparkles } from "lucide-react";

export default function MassageGuide({ onSelectService }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 animate-luxe">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EDE6] text-[#4A5D4E] text-xs font-bold tracking-widest uppercase mb-6">
          <Sparkles className="w-3 h-3" /> The Vivify Collection
        </div>
        <h2 className="text-4xl sm:text-5xl font-medium text-[#2C3531] leading-tight mb-6" style={{ fontFamily: "Cormorant Garamond" }}>
          Curated rituals for your <br className="hidden sm:block" />
          <span className="italic text-[#C8795D]">mind, body, and soul.</span>
        </h2>
        <p className="text-[#5A6B5D] text-lg max-w-xl mx-auto font-light">
          Select an experience below to begin your journey. Each session is tailored to your unique needs by our expert therapists.
        </p>
      </div>

      {/* Advanced Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {SERVICES.map((svc, index) => {
          const isFeatured = index === 0;
          return (
            <div
              key={svc.id}
              onClick={() => onSelectService(svc.id)}
              className={`group relative overflow-hidden rounded-[2rem] bg-white border border-[#E8EDE6] shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col
                ${isFeatured ? "md:col-span-2 lg:col-span-2 lg:flex-row" : ""}
              `}
            >
              {/* Image/Gradient Area */}
              <div className={`p-8 flex items-center justify-center relative overflow-hidden bg-[#F4F1E9] ${isFeatured ? "lg:w-1/2 min-h-[250px]" : "min-h-[200px]"}`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-[#E8EDE6]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="text-6xl sm:text-7xl transform group-hover:scale-110 transition-transform duration-500">{svc.icon}</span>
              </div>

              {/* Content Area */}
              <div className={`p-8 flex flex-col justify-between ${isFeatured ? "lg:w-1/2" : ""}`}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${svc.bc || "bg-[#E8EDE6] text-[#4A5D4E]"}`}>
                      {svc.badge}
                    </span>
                  </div>
                  <h3 className="text-2xl font-medium text-[#2C3531] mb-3" style={{ fontFamily: "Cormorant Garamond" }}>
                    {svc.name}
                  </h3>
                  <p className="text-sm text-[#5A6B5D] leading-relaxed mb-6 font-light">
                    {svc.benefit}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-[#F4F1E9] mt-auto">
                  <div>
                    <p className="text-xs text-[#A3B19B] uppercase tracking-wider mb-1">From</p>
                    <p className="text-lg font-bold text-[#2C3531]" style={{ fontFamily: "Cormorant Garamond" }}>
                      {fmt(getPrice("studio", svc.id, 60))}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#F4F1E9] flex items-center justify-center group-hover:bg-[#4A5D4E] group-hover:text-white transition-colors duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}