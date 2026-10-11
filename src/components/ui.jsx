import { Check, Shield, AlertCircle, X } from "lucide-react";

export const Tick = () => (
  <div
    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
    style={{ background: "#0891b2" }}
  >
    <Check className="w-3 h-3 text-white" />
  </div>
);

export const IB = ({ text }) => (
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

export const TF = ({ label, value, onChange, placeholder }) => (
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

export const PF = ({
  label,
  value,
  error,
  onChange,
  placeholder = "08012345678",
}) => {
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

export const SC = ({ sel, onClick, children }) => (
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

export const Modal = ({ children, onClose }) => (
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

export const SuccessIcon = () => (
  <div className="text-center mb-4">
    <div
      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3"
      style={{ background: "#d1fae5" }}
    >
      <Check className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
    </div>
  </div>
);

export const Btn = ({ children, onClick, color }) => {
  const s = {
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
    amber: {
      background: "linear-gradient(135deg,#d97706,#f59e0b)",
      color: "white",
    },
    ghost: { background: "#f3f4f6", color: "#374151" },
    whatsapp: { background: "#25D366", color: "white" },
  };
  return (
    <button
      onClick={onClick}
      className="w-full py-3 rounded-xl font-semibold text-sm mb-2 transition-all hover:opacity-90"
      style={s[color] || s.blue}
    >
      {children}
    </button>
  );
};
