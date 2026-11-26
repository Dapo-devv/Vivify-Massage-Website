import React from "react";
import { Check } from "lucide-react";

export default function SlotGrid({ available = [], loading, selected, onSelect, serviceType }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (!available || available.length === 0) {
    return (
      <div className="text-center p-6 bg-amber-50 rounded-2xl border-2 border-amber-100">
        <p className="text-sm text-amber-800 font-medium">
          No slots available for this date. Please select another day.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {available.map((time) => {
        const isSelected = selected === time;
        return (
          <button
            key={time}
            onClick={() => onSelect(time)}
            className={`relative p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1
              ${isSelected
                ? "border-teal-500 bg-teal-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-teal-300 hover:bg-gray-50"
              }
            `}
          >
            <span className={`text-xs font-bold ${isSelected ? "text-teal-700" : "text-gray-700"}`}>
              {time}
            </span>
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}