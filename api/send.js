/* eslint-env node */

import { Resend } from "resend";

const FROM_EMAIL =
  "Vivify Massage <booking@updates.vivifymassageandspa.online>";
const ADMIN_EMAIL = "vivifymassageandspa@gmail.com";

let _resend = null;
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to .env.local for local dev, " +
        "or to Vercel → Settings → Environment Variables for deployed builds. " +
        "Then restart `vercel dev` or redeploy.",
    );
  }
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

const fmt = (n) => `₦${Number(n).toLocaleString()}`;
const BASE_STYLE = `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f0f9ff;margin:0;padding:0;`;
const HEADER_HTML = (title, sub) => `
  <div style="background:linear-gradient(135deg,#0c4a6e,#0e7490);padding:36px 32px;border-radius:12px 12px 0 0;text-align:center;">
    <div style="font-size:28px;margin-bottom:8px;">✨</div>
    <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">${title}</h1>
    <p style="color:#bae6fd;margin:6px 0 0;font-size:13px;">${sub}</p>
  </div>`;
const HEADER_HTML_ATHLETE = (title, sub) => `
  <div style="background:linear-gradient(135deg,#0a0a0a,#1a1a1a);padding:36px 32px;border-radius:12px 12px 0 0;text-align:center;">
    <div style="font-size:28px;margin-bottom:8px;">🏃</div>
    <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">${title}</h1>
    <p style="color:#fb923c;margin:6px 0 0;font-size:13px;">${sub}</p>
  </div>`;
const ROW = (label, value, highlight) =>
  `<tr><td style="padding:10px 0;color:#64748b;font-size:13px;width:40%;">${label}</td><td style="padding:10px 0;font-weight:600;font-size:${
    highlight ? "16" : "13"
  }px;color:${highlight ? "#0891b2" : "#0f172a"};">${value}</td></tr>`;
const ROW_ATHLETE = (label, value, highlight) =>
  `<tr><td style="padding:10px 0;color:#737373;font-size:13px;width:40%;">${label}</td><td style="padding:10px 0;font-weight:600;font-size:${
    highlight ? "16" : "13"
  }px;color:${highlight ? "#f97316" : "#0f172a"};">${value}</td></tr>`;
const TABLE_WRAP = (rows) =>
  `<table style="width:100%;border-collapse:collapse;margin:16px 0;">${rows}</table>`;
const FOOTER_HTML = `<div style="text-align:center;padding:24px;color:#94a3b8;font-size:11px;">© 2026 Vivify Massage & Spa · 07040723894 · Tanke Akata, Ilorin</div>`;
const NEXT_STEPS = (text) =>
  `<div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin-top:16px;">
    <p style="color:#92400e;font-size:13px;margin:0;"><strong>What's next?</strong> ${text}</p>
  </div>`;

// ────────────────────────────────────────────────────────
// BOOKING — admin
// ────────────────────────────────────────────────────────
const buildBookingAdminHtml = (d) => {
  const items = Array.isArray(d.items) ? d.items : [];
  const itemRows = items
    .map((it, i) => {
      const addons = (it.addons || []).length
        ? `<div style="color:#64748b;font-size:11px;margin-top:4px;">+ ${
            it.addons.length
          } add-on${it.addons.length > 1 ? "s" : ""}: ${it.addons.join(
            ", ",
          )}</div>`
        : "";
      return `
      <tr>
        <td style="padding:12px 0;border-top:1px solid #e2e8f0;">
          <div style="font-weight:700;color:#0f172a;font-size:14px;">${
            i + 1
          }. ${it.serviceName || it.service || "Service"}</div>
          <div style="color:#64748b;font-size:12px;margin-top:2px;">
            ${
              it.svcType === "studio"
                ? "🏢 Our Home Studio"
                : "🏠 Your Home or Hotel"
            } · ⏱ ${it.duration} min · 👤 ${it.therapist || "any"}
          </div>
          ${addons}
          ${
            it.date
              ? `<div style="color:#64748b;font-size:12px;margin-top:2px;">📅 ${it.date} · 🕐 ${it.time}</div>`
              : ""
          }
        </td>
      </tr>`;
    })
    .join("");

  return `
<div style="${BASE_STYLE}">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    ${HEADER_HTML("🌟 New Booking", "Someone just booked a session")}
    <div style="padding:28px 32px;">
      <h2 style="color:#0f172a;font-size:16px;margin:0 0 4px;">Customer</h2>
      ${TABLE_WRAP(
        ROW("Name", d.customerName) +
          ROW("Phone", d.customerPhone) +
          ROW("Email", d.email || "—") +
          ROW("Reference", d.ref || "—"),
      )}

      <h2 style="color:#0f172a;font-size:16px;margin:20px 0 4px;">Services (${items.length})</h2>
      <table style="width:100%;border-collapse:collapse;margin:8px 0;">
        ${itemRows}
      </table>

      <h2 style="color:#0f172a;font-size:16px;margin:20px 0 4px;">Payment</h2>
      ${TABLE_WRAP(
        ROW("Subtotal", fmt(d.subtotal)) +
          ROW("Payment Type", d.paymentType || "—") +
          ROW("Payment Ref", d.paymentRef || "—") +
          ROW("Amount", fmt(d.subtotal), true),
      )}

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-top:8px;">
        <p style="color:#166534;font-size:13px;margin:0;">📞 <strong>Action needed:</strong> Call or WhatsApp the customer to confirm their appointment.</p>
      </div>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;
};

// ────────────────────────────────────────────────────────
// BOOKING — customer confirmation
// ────────────────────────────────────────────────────────
const buildBookingCustomerHtml = (d) => {
  const items = Array.isArray(d.items) ? d.items : [];
  const first = items[0] || {};
  const paidLabel =
    first.svcType === "mobile"
      ? "Pay after session"
      : d.paymentType === "Deposit"
        ? "50% deposit paid"
        : "Paid in full";

  const itemBlocks = items
    .map((it, i) => {
      const addons = (it.addons || []).length
        ? `<p style="color:#64748b;font-size:12px;margin:6px 0 0;">+ ${it.addons.join(
            ", ",
          )}</p>`
        : "";
      return `
      <div style="padding:14px 0;${
        i > 0 ? "border-top:1px solid #e2e8f0;" : ""
      }">
        <p style="font-weight:700;color:#0f172a;font-size:15px;margin:0 0 4px;">${
          it.serviceName || it.service
        }</p>
        <p style="color:#64748b;font-size:13px;margin:0;">
          ${
            it.svcType === "studio"
              ? "🏢 Our Home Studio"
              : "🏠 Your Home or Hotel"
          } · ⏱ ${it.duration} min
        </p>
        ${
          it.date
            ? `<p style="color:#64748b;font-size:13px;margin:4px 0 0;">📅 ${it.date} · 🕐 ${it.time}</p>`
            : ""
        }
        ${addons}
      </div>`;
    })
    .join("");

  return `
<div style="${BASE_STYLE}">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    ${HEADER_HTML("✅ Booking Confirmed", "Your appointment is locked in")}
    <div style="padding:28px 32px;">
      <p style="color:#334155;font-size:14px;margin:0 0 20px;">
        Hi <strong>${d.customerName}</strong>, thank you for booking with
        Vivify Massage &amp; Spa. Here's your confirmation.
      </p>

      <div style="background:#f0f9ff;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="color:#0891b2;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Booking Reference</p>
        <p style="color:#0f172a;font-size:18px;font-weight:700;font-family:monospace;margin:0;">${
          d.ref || "—"
        }</p>
      </div>

      <h2 style="color:#0f172a;font-size:16px;margin:20px 0 0;">Your session${items.length > 1 ? "s" : ""}</h2>
      ${itemBlocks}

      <h2 style="color:#0f172a;font-size:16px;margin:20px 0 4px;">Payment</h2>
      ${TABLE_WRAP(
        ROW("Amount", fmt(d.subtotal), true) +
          ROW("Status", paidLabel) +
          ROW("Ref", d.paymentRef || "—"),
      )}

      ${NEXT_STEPS(
        "Our team will reach out on WhatsApp shortly to confirm your therapist and finalise any details. Any questions? Call us at 07040723894.",
      )}

      <div style="text-align:center;margin-top:24px;">
        <a href="https://wa.me/2347040723894" style="display:inline-block;background:#25D366;color:white;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;">💬 Message us on WhatsApp</a>
      </div>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;
};

// ────────────────────────────────────────────────────────
// SPORTS — admin
// ────────────────────────────────────────────────────────
const buildSportsAdminHtml = (d) => {
  const focus = Array.isArray(d.focus) ? d.focus : [];
  const serviceType = d.serviceType || d.svcType || "studio";
  const locationLabel =
    serviceType === "studio" ? "Our Home Studio" : "Your Home or Hotel";

  return `
<div style="${BASE_STYLE}">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    ${HEADER_HTML_ATHLETE(
      "🏃 Sports Massage Booking",
      "A sports stretching session was just booked",
    )}
    <div style="padding:28px 32px;">

      <h2 style="color:#0f172a;font-size:16px;margin:0 0 4px;">Athlete</h2>
      ${TABLE_WRAP(
        ROW_ATHLETE("Name", d.customerName) +
          ROW_ATHLETE("Phone", d.customerPhone) +
          ROW_ATHLETE("Email", d.email || "—") +
          ROW_ATHLETE("Reference", d.ref || "—"),
      )}

      <h2 style="color:#0f172a;font-size:16px;margin:20px 0 4px;">Session</h2>
      ${TABLE_WRAP(
        ROW_ATHLETE("Location", locationLabel) +
          ROW_ATHLETE("Technique", d.technique || "—") +
          ROW_ATHLETE("Full Name", d.techniqueFull || "—") +
          ROW_ATHLETE("Duration", `${d.minutes || 60} minutes`) +
          ROW_ATHLETE("Therapist", "Male Specialist"),
      )}

      <h2 style="color:#0f172a;font-size:16px;margin:20px 0 4px;">Athletic Profile</h2>
      ${TABLE_WRAP(
        ROW_ATHLETE("Sport", d.sportType || "—") +
          ROW_ATHLETE(
            "Target Areas",
            focus.length ? focus.join(", ") : "Full Body",
          ),
      )}

      ${
        d.injuries
          ? `
      <h2 style="color:#0f172a;font-size:16px;margin:20px 0 4px;">Recovery Notes</h2>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 16px;">
        <p style="color:#991b1b;font-size:13px;margin:0;line-height:1.5;">${d.injuries}</p>
      </div>`
          : ""
      }

      <h2 style="color:#0f172a;font-size:16px;margin:20px 0 4px;">Schedule & Payment</h2>
      ${TABLE_WRAP(
        ROW_ATHLETE("Date", d.date || "—") +
          ROW_ATHLETE("Time", d.time || "—") +
          ROW_ATHLETE("Payment Ref", d.paymentRef || "—") +
          ROW_ATHLETE("Amount", fmt(d.price), true),
      )}

      <div style="background:linear-gradient(135deg,#fff7ed,#ffedd5);border:1px solid #fed7aa;border-radius:8px;padding:14px 16px;margin-top:8px;">
        <p style="color:#9a3412;font-size:13px;margin:0;">🏃 <strong>Sports Massage:</strong> Confirm the session and review recovery notes before the appointment. Techniques: MET &amp; PNF stretching.</p>
      </div>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;
};

// ────────────────────────────────────────────────────────
// SPORTS — customer confirmation
// ────────────────────────────────────────────────────────
const buildSportsCustomerHtml = (d) => {
  const focus = Array.isArray(d.focus) ? d.focus : [];
  const serviceType = d.serviceType || d.svcType || "studio";
  const locationLabel =
    serviceType === "studio" ? "Our Home Studio" : "Your Home or Hotel";
  const paidLabel =
    serviceType === "mobile" ? "Pay after session" : "Paid in full";

  return `
<div style="${BASE_STYLE}">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    ${HEADER_HTML_ATHLETE(
      "✅ Recovery Session Confirmed",
      "Your Sports Massage is booked",
    )}
    <div style="padding:28px 32px;">
      <p style="color:#334155;font-size:14px;margin:0 0 20px;">
        Hi <strong>${d.customerName}</strong>, your Sports Massage is
        confirmed. Here are the details.
      </p>

      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="color:#f97316;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Booking Reference</p>
        <p style="color:#0f172a;font-size:18px;font-weight:700;font-family:monospace;margin:0;">${
          d.ref || "—"
        }</p>
      </div>

      <h2 style="color:#0f172a;font-size:16px;margin:20px 0 4px;">Your session</h2>
      ${TABLE_WRAP(
        ROW_ATHLETE("Technique", d.technique || "—") +
          ROW_ATHLETE("Focus", focus.length ? focus.join(", ") : "Full Body") +
          ROW_ATHLETE("Duration", `${d.minutes || 60} minutes`) +
          ROW_ATHLETE("Location", locationLabel) +
          ROW_ATHLETE("Therapist", "Male Specialist"),
      )}

      <h2 style="color:#0f172a;font-size:16px;margin:20px 0 4px;">When</h2>
      ${TABLE_WRAP(
        ROW_ATHLETE("Date", d.date || "—") + ROW_ATHLETE("Time", d.time || "—"),
      )}

      <h2 style="color:#0f172a;font-size:16px;margin:20px 0 4px;">Payment</h2>
      ${TABLE_WRAP(
        ROW_ATHLETE("Amount", fmt(d.price), true) +
          ROW_ATHLETE("Status", paidLabel),
      )}

      ${NEXT_STEPS(
        "Our sports specialist will reach out on WhatsApp to confirm any final details. Remember to hydrate and wear comfortable clothing.",
      )}

      <div style="text-align:center;margin-top:24px;">
        <a href="https://wa.me/2347040723894" style="display:inline-block;background:#f97316;color:white;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;">💬 Message the Specialist</a>
      </div>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;
};

// ────────────────────────────────────────────────────────
// MEMBERSHIP — admin + member
// ────────────────────────────────────────────────────────
const buildMembershipAdminHtml = (d) => `
<div style="${BASE_STYLE}">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    ${HEADER_HTML("👑 New Membership", "A new member just signed up")}
    <div style="padding:28px 32px;">
      ${TABLE_WRAP(
        ROW("Member", d.name) +
          ROW("Phone", d.phone) +
          ROW("Email", d.email) +
          ROW("Plan", d.plan) +
          ROW("Monthly massage", d.service) +
          ROW("Session", d.duration) +
          ROW("Location", d.location) +
          ROW("Monthly Fee", fmt(d.monthlyAmount), true) +
          ROW("Ref", d.ref),
      )}
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin-top:8px;">
        <p style="color:#92400e;font-size:13px;margin:0;">📞 Call the member to schedule their first monthly session.</p>
      </div>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;

const buildMembershipMemberHtml = (d) => `
<div style="${BASE_STYLE}">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    ${HEADER_HTML("👑 Welcome, Member!", "Your monthly membership is active")}
    <div style="padding:28px 32px;">
      <p style="color:#334155;font-size:14px;margin:0 0 20px;">
        Hi <strong>${d.name}</strong>, welcome to Vivify! Your <strong>${
          d.plan
        }</strong> membership is now active — one beautiful massage every month, just for you.
      </p>
      ${TABLE_WRAP(
        ROW("Monthly massage", d.service) +
          ROW("Session", d.duration) +
          ROW("Location", d.location) +
          ROW("Monthly Fee", fmt(d.monthlyAmount), true) +
          ROW("You save / month", fmt(d.savedPerMonth || 0)) +
          ROW("Ref", d.ref),
      )}
      <div style="background:#ecfeff;border:1px solid #a5f3fc;border-radius:8px;padding:14px 16px;margin-top:8px;">
        <p style="color:#155e75;font-size:13px;margin:0;"><strong>What's next?</strong> Our team will call you to schedule your first monthly session.</p>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-top:12px;">
        <p style="color:#166534;font-size:13px;margin:0;">📱 Questions? Call us at <strong>07040723894</strong></p>
      </div>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;

// ────────────────────────────────────────────────────────
// GIFT CARD — admin + buyer + recipient
// ────────────────────────────────────────────────────────
const buildGiftAdminHtml = (d) => `
<div style="${BASE_STYLE}">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    ${HEADER_HTML("🎁 New Spa Gift Card", "Someone just purchased a gift card")}
    <div style="padding:28px 32px;">
      <h2 style="color:#0f172a;font-size:16px;margin:0 0 4px;">Buyer</h2>
      ${TABLE_WRAP(
        ROW("Name", d.buyerName) +
          ROW("Phone", d.buyerPhone) +
          ROW("Email", d.buyerEmail),
      )}
      <h2 style="color:#0f172a;font-size:16px;margin:16px 0 4px;">Recipient</h2>
      ${TABLE_WRAP(
        ROW("Name", d.recipientName) +
          ROW("Phone", d.recipientPhone || "—") +
          ROW("Email", d.recipientEmail || "—"),
      )}
      <h2 style="color:#0f172a;font-size:16px;margin:16px 0 4px;">Gift Details</h2>
      ${TABLE_WRAP(
        ROW("Service", d.service) +
          ROW("Location", d.location) +
          ROW("Duration", d.duration) +
          ROW("Caption", `"${d.caption}"`) +
          ROW("Value", fmt(d.amount), true) +
          ROW("Reference", d.ref),
      )}
      <div style="background:#fdf2f8;border:1px solid #fbcfe8;border-radius:8px;padding:14px 16px;margin-top:8px;">
        <p style="color:#9d174d;font-size:13px;margin:0;">📞 Contact both the buyer and recipient to coordinate the gift card session.</p>
      </div>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;

const buildGiftBuyerHtml = (d) => `
<div style="${BASE_STYLE}">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    ${HEADER_HTML("🎁 Gift Card Purchased", "Your gift is on its way")}
    <div style="padding:28px 32px;">
      <p style="color:#334155;font-size:14px;margin:0 0 20px;">
        Hi <strong>${d.buyerName}</strong>, your gift card for <strong>${
          d.recipientName
        }</strong> has been purchased successfully. Thank you for the thoughtful gift!
      </p>
      ${TABLE_WRAP(
        ROW("Recipient", d.recipientName) +
          ROW("Service", d.service) +
          ROW("Location", d.location) +
          ROW("Duration", d.duration) +
          ROW("Value", fmt(d.amount), true) +
          ROW("Reference", d.ref),
      )}
      <div style="background:linear-gradient(135deg,#db2777,#9d174d);border-radius:8px;padding:20px;margin-top:16px;text-align:center;">
        <p style="color:#fbcfe8;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">Personal Message</p>
        <p style="color:white;font-size:15px;font-style:italic;margin:0;">"${d.caption}"</p>
      </div>
      ${NEXT_STEPS(
        `We'll reach out to ${d.recipientName} to arrange their session. You'll both receive confirmation emails.`,
      )}
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;

const buildGiftRecipientHtml = (d) => `
<div style="${BASE_STYLE}">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    ${HEADER_HTML("🎁 You've received a gift", "A massage is waiting for you")}
    <div style="padding:36px 32px;text-align:center;">
      <p style="color:#334155;font-size:15px;margin:0 0 6px;">Hi <strong>${
        d.recipientName
      }</strong>,</p>
      <p style="color:#64748b;font-size:14px;margin:0 0 28px;">
        <strong>${d.buyerName}</strong> has gifted you a premium massage experience 💆
      </p>

      <div style="background:linear-gradient(135deg,#db2777,#9d174d);border-radius:12px;padding:28px;margin-bottom:28px;text-align:left;position:relative;overflow:hidden;">
        <p style="color:#fbcfe8;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">A personal message</p>
        <p style="color:white;font-size:17px;font-style:italic;margin:0 0 24px;line-height:1.6;">"${d.caption}"</p>
        <div style="border-top:1px solid rgba(255,255,255,0.2);padding-top:20px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px;">
            <div>
              <p style="color:#fbcfe8;font-size:12px;margin:0 0 4px;">${d.service}</p>
              <p style="color:#fbcfe8;font-size:12px;margin:0 0 4px;">${d.location} · ${d.duration}</p>
              <p style="color:#f9a8d4;font-size:11px;margin:0;">From ${d.buyerName}</p>
            </div>
            <div style="text-align:right;">
              <p style="color:#fbcfe8;font-size:11px;margin:0 0 2px;">Gift Value</p>
              <p style="color:white;font-size:28px;font-weight:700;margin:0;">${fmt(
                d.amount,
              )}</p>
            </div>
          </div>
        </div>
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin-bottom:20px;text-align:left;">
        <p style="color:#166534;font-size:14px;margin:0 0 8px;font-weight:600;">How to redeem your gift 🌟</p>
        <p style="color:#166534;font-size:13px;margin:0;line-height:1.6;">Our team will contact you directly to schedule your session at a time that works for you. You can also reach us at <strong>07040723894</strong>.</p>
      </div>

      <p style="color:#94a3b8;font-size:12px;margin:0;">Ref: <span style="font-family:monospace;">${
        d.ref
      }</span></p>

      <div style="text-align:center;margin-top:24px;">
        <a href="https://wa.me/2347040723894" style="display:inline-block;background:#25D366;color:white;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;">💬 Book your session</a>
      </div>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;

// ────────────────────────────────────────────────────────
// SERVERLESS HANDLER
// ────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, data } = req.body || {};

  if (!type || !data) {
    return res.status(400).json({ error: "Missing type or data" });
  }

  try {
    switch (type) {
      // ── Legacy single-service booking ──
      case "booking": {
        await getResend().emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `📅 New Booking — ${data.customerName}`,
          html: buildBookingAdminHtml({
            ...data,
            items: [
              {
                service: data.service,
                svcType: data.serviceType,
                duration: data.duration,
                therapist: data.therapist,
                date: data.appointmentDate,
                time: data.appointmentTime,
              },
            ],
            subtotal: data.totalAmount,
          }),
        });
        if (data.email) {
          await getResend().emails.send({
            from: FROM_EMAIL,
            to: data.email,
            subject: `✅ Booking Confirmed — ${data.customerName}`,
            html: buildBookingCustomerHtml({
              ...data,
              items: [
                {
                  service: data.service,
                  svcType: data.serviceType,
                  duration: data.duration,
                  therapist: data.therapist,
                  date: data.appointmentDate,
                  time: data.appointmentTime,
                },
              ],
              subtotal: data.totalAmount,
            }),
          });
        }
        break;
      }

      // ── Multi-service / wizard booking ──
      case "booking_multi": {
        // Admin notification
        await getResend().emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `📅 New Booking — ${data.customerName} · ${
            (data.items || []).length
          } service${(data.items || []).length > 1 ? "s" : ""} (${
            data.ref || "—"
          })`,
          html: buildBookingAdminHtml(data),
        });

        // Customer confirmation
        if (data.email) {
          await getResend().emails.send({
            from: FROM_EMAIL,
            to: data.email,
            subject: `✅ Booking Confirmed — Ref ${data.ref || "—"}`,
            html: buildBookingCustomerHtml(data),
          });
        }
        break;
      }

      // ── Sports Massage ──
      case "sports": {
        // Admin
        await getResend().emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `🏃 Sports Massage — ${data.customerName} · ${
            data.technique || "MET/PNF"
          } (${data.ref || "—"})`,
          html: buildSportsAdminHtml(data),
        });

        // Customer
        if (data.email) {
          await getResend().emails.send({
            from: FROM_EMAIL,
            to: data.email,
            subject: `✅ Sports Massage Confirmed — Ref ${data.ref || "—"}`,
            html: buildSportsCustomerHtml(data),
          });
        }
        break;
      }

      // ── Membership ──
      case "membership": {
        await getResend().emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `👑 New Membership — ${data.name}`,
          html: buildMembershipAdminHtml(data),
        });
        await getResend().emails.send({
          from: FROM_EMAIL,
          to: data.email,
          subject: "👑 Welcome to Vivify Monthly Wellness!",
          html: buildMembershipMemberHtml(data),
        });
        break;
      }

      // ── Gift Card ──
      case "gift": {
        await getResend().emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `🎁 New Spa Gift Card — ${data.buyerName} → ${data.recipientName}`,
          html: buildGiftAdminHtml(data),
        });
        await getResend().emails.send({
          from: FROM_EMAIL,
          to: data.buyerEmail,
          subject: `🎁 Your Gift Card for ${data.recipientName} is confirmed`,
          html: buildGiftBuyerHtml(data),
        });
        if (data.recipientEmail) {
          await getResend().emails.send({
            from: FROM_EMAIL,
            to: data.recipientEmail,
            subject: `🎁 ${data.buyerName} sent you a Vivify massage`,
            html: buildGiftRecipientHtml(data),
          });
        }
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown email type: ${type}` });
    }

    return res.json({ success: true, type });
  } catch (error) {
    console.error("Resend error:", error);
    return res
      .status(500)
      .json({ error: "Failed to send email", detail: error?.message });
  }
}
