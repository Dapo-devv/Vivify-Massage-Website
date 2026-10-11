import { ShoppingBag, X, Trash2, User, Sparkles } from "lucide-react";
import { ADDONS, fmt, getPrice, cartMinutes } from "../config/services";

export default function CartSidebar({
  items,
  onRemove,
  open,
  onClose,
  subtotal,
  onCheckout,
  canCheckout,
  customerName,
}) {
  // Determine button label from cart contents.
  // Studio → "Continue to Payment"
  // Mobile → "Book Appointment"
  // Empty → disabled "Add a service to continue"
  const allMobile =
    items.length > 0 && items.every((it) => it.svcType === "mobile");
  const allStudio =
    items.length > 0 && items.every((it) => it.svcType === "studio");

  let buttonLabel;
  if (items.length === 0) buttonLabel = "Add a service to continue";
  else if (!customerName) buttonLabel = "Enter your details first";
  else if (allMobile) buttonLabel = "Book Appointment →";
  else if (allStudio) buttonLabel = "Continue to Payment →";
  else buttonLabel = "Continue →"; // shouldn't happen — mixing is blocked upstream

  const content = (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between p-5"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-cyan-600" />
          <h4
            className="font-bold text-gray-900 text-sm"
            style={{ fontFamily: "Cormorant Garamond", fontSize: "1.05rem" }}
          >
            Your Session
          </h4>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"
          aria-label="Close cart"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-10 px-2">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: "#ecfeff" }}
            >
              <Sparkles className="w-6 h-6 text-cyan-500" />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              No services added yet
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Complete the wizard, then tap{" "}
              <b className="text-cyan-600">Add to Session</b> to build your
              booking.
            </p>
          </div>
        ) : (
          <>
            {customerName && (
              <div
                className="flex items-center gap-2 rounded-lg p-2 text-xs"
                style={{
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  color: "#0c4a6e",
                }}
              >
                <User className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  Booking for <b>{customerName}</b>
                </span>
              </div>
            )}

            {items.map((it, i) => {
              const base = getPrice(it.svcType, it.service, it.duration);
              const addons = (it.addons || [])
                .map((id) => ADDONS.find((a) => a.id === id))
                .filter(Boolean);
              const total = base + addons.reduce((a, x) => a + x.price, 0);
              return (
                <div
                  key={i}
                  className="rounded-xl p-3"
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {it.serviceName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {it.svcType === "studio" ? "Home Studio" : "Mobile"} ·{" "}
                        {it.duration} min
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(i)}
                      className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {addons.length > 0 && (
                    <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                      {addons.map((a) => (
                        <li key={a.id}>
                          {a.icon} {a.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p
                    className="text-sm font-bold mt-2"
                    style={{ color: "#0891b2" }}
                  >
                    {fmt(total)}
                  </p>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-5" style={{ borderTop: "1px solid #f1f5f9" }}>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Total duration</span>
          <span className="font-semibold">{cartMinutes(items)} min</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-semibold text-gray-700">Subtotal</span>
          <span
            className="text-2xl font-bold"
            style={{ fontFamily: "Cormorant Garamond", color: "#0891b2" }}
          >
            {fmt(subtotal)}
          </span>
        </div>
        <button
          onClick={onCheckout}
          disabled={!canCheckout}
          className="w-full py-3 rounded-xl font-bold text-sm"
          style={{
            background: canCheckout
              ? "linear-gradient(135deg,#0891b2,#06b6d4)"
              : "#e5e7eb",
            color: canCheckout ? "white" : "#9ca3af",
            cursor: canCheckout ? "pointer" : "not-allowed",
          }}
        >
          {buttonLabel}
        </button>
        {items.length > 0 && !canCheckout && (
          <p className="text-xs text-center mt-2 text-gray-400">
            Complete step 5 (name, phone, email) to continue.
          </p>
        )}
        {items.length > 0 && canCheckout && allMobile && (
          <p className="text-xs text-center mt-2 text-gray-400">
            💰 Pay your therapist after the session.
          </p>
        )}
        {items.length > 0 && canCheckout && allStudio && (
          <p className="text-xs text-center mt-2 text-gray-400">
            🔒 Secure online payment via Paystack.
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-80 flex-shrink-0">
        <div
          className="sticky top-24 bg-white rounded-2xl overflow-hidden shadow-sm"
          style={{
            border: "1px solid #e5e7eb",
            maxHeight: "calc(100vh - 7rem)",
          }}
        >
          {content}
        </div>
      </aside>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
        >
          <div
            className="ml-auto w-full max-w-sm bg-white h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
}
