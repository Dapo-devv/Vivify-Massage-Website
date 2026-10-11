/* eslint-env node */

import { Resend } from "resend";

// eslint-disable-next-line no-undef
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  "Vivify Massage <booking@updates.vivifymassageandspa.online>"; // ← your verified subdomain
const ADMIN_EMAIL = "vivifymassageandspa@gmail.com";

// ────────────────────────────────────────────────────────
// EMAIL HTML BUILDERS
// ────────────────────────────────────────────────────────
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

// ── Legacy single-service booking (kept for backward-compat) ──
const buildBookingAdminHtml = (d) => `
<div style="${BASE_STYLE}">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    ${HEADER_HTML("🌟 New Booking Alert", "Someone just booked a session")}
    <div style="padding:28px 32px;">
      <h2 style="color:#0f172a;font-size:16px;margin:0 0 4px;">Customer Details</h2>
      ${TABLE_WRAP(ROW("Name", d.customerName) + ROW("Phone", d.customerPhone))}
      <h2 style="color:#0f172a;font-size:16px;margin:16px 0 4px;">Session Details</h2>
      ${TABLE_WRAP(
        ROW("Service", d.service) +
          ROW("Location", d.serviceType) +
          ROW("Therapist", d.therapist) +
          ROW("Duration", d.duration) +
          ROW("Date", d.appointmentDate) +
          ROW("Time", d.appointmentTime),
      )}
      <h2 style="color:#0f172a;font-size:16px;margin:16px 0 4px;">Payment</h2>
      ${TABLE_WRAP(
        ROW("Total", fmt(d.totalAmount)) +
          ROW("Paid / Due", fmt(d.paymentAmount), true) +
          ROW("Type", d.paymentType) +
          ROW("Reference", d.paymentReference || "—"),
      )}
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-top:8px;">
        <p style="color:#166534;font-size:13px;margin:0;">📞 <strong>Action needed:</strong> Call or WhatsApp the customer to confirm their appointment.</p>
      </div>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;

// ── Membership (admin) ──
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
          ROW("Service", d.service) +
          ROW("Location", d.location) +
          ROW("Duration", d.duration) +
          ROW("Sessions/Month", String(d.sessions)) +
          ROW("Monthly Amount", fmt(d.monthlyAmount), true) +
          ROW("Reference", d.ref),
      )}
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin-top:8px;">
        <p style="color:#92400e;font-size:13px;margin:0;">📞 Call the member to schedule their first session and set up their monthly calendar.</p>
      </div>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;

// ── Membership (member) ──
const buildMembershipMemberHtml = (d) => `
<div style="${BASE_STYLE}">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    ${HEADER_HTML("👑 Welcome, Member!", "Your wellness membership is now active")}
    <div style="padding:28px 32px;">
      <p style="color:#334155;font-size:14px;margin:0 0 20px;">Hi <strong>${d.name}</strong>, welcome to the Vivify family! Here are your membership details:</p>
      ${TABLE_WRAP(
        ROW("Plan", d.plan) +
          ROW("Service", d.service) +
          ROW("Location", d.location) +
          ROW("Duration", d.duration) +
          ROW("Sessions/Month", String(d.sessions) + " sessions") +
          ROW("Monthly Fee", fmt(d.monthlyAmount), true) +
          ROW("Reference", d.ref),
      )}
      <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin-top:8px;">
        <p style="color:#92400e;font-size:13px;margin:0;">👋 Our team will call you shortly to schedule your first session and organise your monthly calendar.</p>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-top:12px;">
        <p style="color:#166534;font-size:13px;margin:0;">📱 Any questions? Reach us at <strong>07040723894</strong></p>
      </div>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;

// ── Gift Card (admin) ──
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

// ── Gift Card (buyer) ──
const buildGiftBuyerHtml = (d) => `
<div style="${BASE_STYLE}">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    ${HEADER_HTML("🎁 Gift Card Purchased!", "Your spa gift card is confirmed")}
    <div style="padding:28px 32px;">
      <p style="color:#334155;font-size:14px;margin:0 0 20px;">Hi <strong>${d.buyerName}</strong>, your spa gift card for <strong>${d.recipientName}</strong> has been purchased successfully!</p>
      ${TABLE_WRAP(
        ROW("Recipient", d.recipientName) +
          ROW("Service", d.service) +
          ROW("Location", d.location) +
          ROW("Duration", d.duration) +
          ROW("Value", fmt(d.amount), true) +
          ROW("Reference", d.ref),
      )}
      <div style="background:linear-gradient(135deg,#0c4a6e,#0e7490);border-radius:8px;padding:20px;margin-top:16px;text-align:center;">
        <p style="color:#bae6fd;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">Personal Message</p>
        <p style="color:white;font-size:15px;font-style:italic;margin:0;">"${d.caption}"</p>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;margin-top:16px;">
        <p style="color:#475569;font-size:13px;margin:0;">📞 Our team will contact <strong>${d.recipientName}</strong> to coordinate their session. Questions? Call <strong>07040723894</strong></p>
      </div>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;

// ── Gift Card (recipient) ──
const buildGiftRecipientHtml = (d) => `
<div style="${BASE_STYLE}">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    ${HEADER_HTML("🎁 You've received a spa gift card!", "Vivify Massage & Spa")}
    <div style="padding:36px 32px;text-align:center;">
      <p style="color:#334155;font-size:15px;margin:0 0 6px;">Hi <strong>${d.recipientName}</strong>,</p>
      <p style="color:#64748b;font-size:14px;margin:0 0 28px;"><strong>${d.buyerName}</strong> has gifted you a premium massage experience 💆</p>
      <div style="background:linear-gradient(135deg,#0c4a6e,#0e7490);border-radius:12px;padding:28px;margin-bottom:28px;position:relative;overflow:hidden;">
        <p style="color:#bae6fd;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">A personal message for you</p>
        <p style="color:white;font-size:17px;font-style:italic;margin:0 0 24px;line-height:1.6;">"${d.caption}"</p>
        <div style="border-top:1px solid rgba(255,255,255,0.2);padding-top:20px;display:flex;justify-content:space-between;align-items:flex-end;">
          <div style="text-align:left;">
            <p style="color:#bae6fd;font-size:12px;margin:0 0 4px;">${d.service}</p>
            <p style="color:#bae6fd;font-size:12px;margin:0 0 4px;">${d.location} · ${d.duration}</p>
            <p style="color:#94a3b8;font-size:11px;margin:0;">From ${d.buyerName}</p>
          </div>
          <div style="text-align:right;">
            <p style="color:#94a3b8;font-size:11px;margin:0 0 2px;">Gift Value</p>
            <p style="color:white;font-size:28px;font-weight:700;margin:0;">${fmt(d.amount)}</p>
          </div>
        </div>
      </div>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin-bottom:20px;">
        <p style="color:#166534;font-size:14px;margin:0 0 8px;font-weight:600;">How to redeem your gift 🌟</p>
        <p style="color:#166534;font-size:13px;margin:0;line-height:1.6;">Our team will contact you directly to schedule your session at a time that works for you. You can also reach us at <strong>07040723894</strong>.</p>
      </div>
      <p style="color:#94a3b8;font-size:12px;margin:0;">Ref: <span style="font-family:monospace;">${d.ref}</span></p>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;

// ────────────────────────────────────────────────────────
// Multi-service concierge booking (admin)
// ────────────────────────────────────────────────────────
const buildMultiAdminHtml = (d) => {
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
              it.svcType === "studio" ? "🏢 Home Studio" : "🏠 Mobile Service"
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
    ${HEADER_HTML(
      "🌟 New Multi-Service Booking",
      "Someone just booked a full session",
    )}
    <div style="padding:28px 32px;">
      <h2 style="color:#0f172a;font-size:16px;margin:0 0 4px;">Customer</h2>
      ${TABLE_WRAP(
        ROW("Name", d.customerName) +
          ROW("Phone", d.customerPhone) +
          ROW("Email", d.email || "—") +
          ROW("Reference", d.ref || "—"),
      )}

      <h2 style="color:#0f172a;font-size:16px;margin:20px 0 4px;">Booked Services (${items.length})</h2>
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
        <p style="color:#166534;font-size:13px;margin:0;">📞 <strong>Action needed:</strong> Call or WhatsApp the customer to confirm all ${items.length} service${
          items.length > 1 ? "s" : ""
        }.</p>
      </div>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;
};

// ────────────────────────────────────────────────────────
// Sports Massage (admin) — MET / PNF stretching
// ────────────────────────────────────────────────────────
const buildSportsAdminHtml = (d) => {
  const focus = Array.isArray(d.focus) ? d.focus : [];
  // Accept either `serviceType` (new) or `svcType` (legacy) so the
  // Location row renders correctly regardless of which client sent it.
  const serviceType = d.serviceType || d.svcType || "studio";
  const locationLabel =
    serviceType === "studio" ? "Home Studio" : "Mobile Service";

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
          ROW_ATHLETE("Therapist", "Male (Sports Specialist)"),
      )}

      <h2 style="color:#0f172a;font-size:16px;margin:20px 0 4px;">Athletic Profile</h2>
      ${TABLE_WRAP(
        ROW_ATHLETE("Sport", d.sportType || "—") +
          ROW_ATHLETE("Phase", d.phase || "—") +
          ROW_ATHLETE(
            "Focus Areas",
            focus.length ? focus.join(", ") : "Full Body",
          ),
      )}

      ${
        d.injuries
          ? `
      <h2 style="color:#0f172a;font-size:16px;margin:20px 0 4px;">Injury Notes</h2>
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
        <p style="color:#9a3412;font-size:13px;margin:0;">🏃 <strong>Sports Massage:</strong> Confirm the session and review injury notes before the appointment. Performed by our male specialist only. Techniques: MET &amp; PNF stretching.</p>
      </div>
    </div>
    ${FOOTER_HTML}
  </div>
</div>`;
};

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
      // ── Legacy single-service booking (kept for backward-compat) ──
      case "booking": {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `📅 New Booking — ${data.customerName}`,
          html: buildBookingAdminHtml(data),
        });
        break;
      }

      // ── Multi-service concierge booking ──
      case "booking_multi": {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `📅 New Booking — ${data.customerName} · ${
            (data.items || []).length
          } service${(data.items || []).length > 1 ? "s" : ""} (${
            data.ref || "—"
          })`,
          html: buildMultiAdminHtml(data),
        });
        break;
      }

      // ── Sports Massage (MET / PNF) ──
      case "sports": {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `🏃 Sports Massage — ${data.customerName} · ${
            data.technique || "MET/PNF"
          } (${data.ref || "—"})`,
          html: buildSportsAdminHtml(data),
        });
        break;
      }

      // ── Membership (admin + member) ──
      case "membership": {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `👑 New Membership — ${data.name}`,
          html: buildMembershipAdminHtml(data),
        });
        await resend.emails.send({
          from: FROM_EMAIL,
          to: data.email,
          subject: "👑 Welcome to Vivify Wellness Membership!",
          html: buildMembershipMemberHtml(data),
        });
        break;
      }

      // ── Spa Gift Card (admin + buyer + recipient) ──
      case "gift": {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `🎁 New Spa Gift Card — ${data.buyerName} → ${data.recipientName}`,
          html: buildGiftAdminHtml(data),
        });
        await resend.emails.send({
          from: FROM_EMAIL,
          to: data.buyerEmail,
          subject: `🎁 Your Spa Gift Card for ${data.recipientName} is confirmed!`,
          html: buildGiftBuyerHtml(data),
        });
        if (data.recipientEmail) {
          await resend.emails.send({
            from: FROM_EMAIL,
            to: data.recipientEmail,
            subject: `🎁 ${data.buyerName} sent you a Vivify Spa Gift Card!`,
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
