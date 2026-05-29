// Cloud Function — listens for notification documents in Firestore and sends
// the email via Resend. Deploy with:
//   firebase deploy --only functions
//
// You must set the RESEND_API_KEY secret first:
//   firebase functions:secrets:set RESEND_API_KEY

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");

const RESEND_API_KEY = defineSecret("RESEND_API_KEY");

exports.sendNotificationEmail = onDocumentCreated(
  { document: "notifications/{id}", secrets: [RESEND_API_KEY] },
  async (event) => {
    const data = event.data.data();
    if (!data || !data.to) return;

    // Render plain-text + minimal HTML version of the email
    const subject = data.title || "Jessica's Pet Sitting update";
    const text = [
      data.title || "",
      "",
      data.summary || "",
      "",
      ...(data.fields || []).map(f => `${f.label}: ${f.value}`),
      "",
      data.body || "",
      "",
      "—",
      "Jessica's Pet Sitting",
      "jessicakpetsitting.com",
    ].filter(Boolean).join("\n");

    const html = `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: auto; padding: 24px; color: #111;">
        <div style="font-family: cursive; font-size: 24px; color: #4A2C1A;">Jessica's</div>
        <div style="font-size: 11px; letter-spacing: 0.15em; color: #3A6B33; font-weight: 700; margin-bottom: 18px;">PET SITTING</div>
        <h2 style="font-size: 20px; margin: 16px 0 4px;">${escapeHtml(data.title || "")}</h2>
        ${data.summary ? `<p style="color: #555; margin: 0 0 14px;">${escapeHtml(data.summary)}</p>` : ""}
        ${data.fields ? `
          <table style="border-collapse: collapse; margin: 14px 0; font-size: 14px;">
            ${data.fields.map(f => `
              <tr>
                <td style="padding: 4px 14px 4px 0; color: #777;">${escapeHtml(f.label)}</td>
                <td style="padding: 4px 0; font-weight: 600;">${escapeHtml(String(f.value))}</td>
              </tr>
            `).join("")}
          </table>` : ""}
        ${data.body ? `<div style="white-space: pre-wrap; padding: 14px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">${escapeHtml(data.body)}</div>` : ""}
        <p style="font-size: 11px; color: #999; margin-top: 24px;">
          You're receiving this because you have an account at Jessica's Pet Sitting.
        </p>
      </div>`;

    // Resend API call
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY.value()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Jessica's Pet Sitting <noreply@jessicakpetsitting.com>",
        to: data.to,
        subject,
        text,
        html,
      }),
    });

    if (!res.ok) {
      console.error("Resend error:", await res.text());
    }
  }
);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
