import { Loader2, Clock } from "lucide-react";

export default function SlotGrid({
  available,
  loading,
  selected,
  onSelect,
  serviceType,
}) {
  if (loading)
    return (
      <div className="flex items-center justify-center py-8 text-sm text-gray-400 gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Checking availability…
      </div>
    );

  if (!available?.length)
    return (
      <div
        className="flex items-center gap-2 p-4 rounded-xl text-sm"
        style={{
          background: "#fef3c7",
          border: "1px solid #fde68a",
          color: "#92400e",
        }}
      >
        <Clock className="w-4 h-4" /> No slots fit your duration on this day.
        Try another date.
      </div>
    );

  return (
    <div
      className={`grid gap-2 ${serviceType === "mobile" ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-3 sm:grid-cols-5"}`}
    >
      {available.map((t) => {
        const sel = selected === t;
        return (
          <button
            key={t}
            onClick={() => onSelect(t)}
            className="p-2 rounded-lg text-xs font-semibold transition-all border-2"
            style={{
              background: sel ? "#0891b2" : "white",
              color: sel ? "white" : "#374151",
              borderColor: sel ? "#06b6d4" : "#e5e7eb",
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
