import { useMemo } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function DateStrip({ value, onChange, days = 14 }) {
  const dates = useMemo(() => {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push({
        iso: d.toISOString().split("T")[0],
        day: DAYS[d.getDay()],
        date: d.getDate(),
        month: MONTHS[d.getMonth()],
        isToday: i === 0,
      });
    }
    return arr;
  }, [days]);

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-2"
      style={{ scrollbarWidth: "thin" }}
    >
      {dates.map((d) => {
        const sel = value === d.iso;
        return (
          <button
            key={d.iso}
            onClick={() => onChange(d.iso)}
            className="flex-shrink-0 w-[68px] py-3 rounded-xl border-2 transition-all"
            style={{
              borderColor: sel ? "#06b6d4" : "#e5e7eb",
              background: sel ? "#f0f9ff" : "white",
            }}
          >
            <p className="text-xs font-semibold text-gray-400 mb-0.5">
              {d.isToday ? "Today" : d.day}
            </p>
            <p
              className="text-xl font-bold text-gray-900"
              style={{ fontFamily: "Cormorant Garamond" }}
            >
              {d.date}
            </p>
            <p className="text-xs text-gray-400">{d.month}</p>
          </button>
        );
      })}
    </div>
  );
}
