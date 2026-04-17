export const config = { runtime: "edge" };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function resendErrorMessage(data: Record<string, unknown>): string {
  const m = data.message;
  if (typeof m === "string" && m.trim()) return m.trim();
  if (Array.isArray(m)) {
    const parts = m
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "message" in item) {
          const msg = (item as { message?: unknown }).message;
          return typeof msg === "string" ? msg : "";
        }
        return "";
      })
      .filter(Boolean);
    if (parts.length) return parts.join("; ");
  }
  const errs = data.errors;
  if (Array.isArray(errs)) {
    const parts = errs.map((e) => {
      if (typeof e === "string") return e;
      if (e && typeof e === "object" && "message" in e) {
        const msg = (e as { message?: unknown }).message;
        return typeof msg === "string" ? msg : JSON.stringify(e);
      }
      return "";
    }).filter(Boolean);
    if (parts.length) return parts.join("; ");
  }
  if (typeof data.error === "string" && data.error.trim()) return data.error.trim();
  return "Failed to send email (check Resend logs and domain / recipient settings).";
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = process.env.RESEND_API_KEY;
  const to =
    process.env.CONTACT_TO_EMAIL?.trim() ||
    "nexabrokerageofficial@gmail.com";
  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "NEXA <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return json(
      { error: "Email delivery is not configured on the server." },
      503
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const telegram = String(body.telegram ?? "").trim();
  const business = String(body.business ?? "").trim();
  const why = String(body.why ?? "").trim();
  const source = String(body.source ?? "unknown").trim();
  const consent = Boolean(body.consent);

  if (!consent) return json({ error: "Consent is required" }, 400);
  if (!name || !email) return json({ error: "Name and email are required" }, 400);
  if (!emailOk(email)) return json({ error: "Invalid email address" }, 400);

  const subject = `[NEXA] New lead — ${esc(name)} (${esc(source)})`;
  const html = `
    <h2>New NEXA inquiry</h2>
    <p><strong>Source:</strong> ${esc(source)}</p>
    <table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px">
      <tr><td style="padding:6px 12px 6px 0"><strong>Name</strong></td><td>${esc(name)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0"><strong>Email</strong></td><td>${esc(email)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0"><strong>Phone</strong></td><td>${esc(phone || "—")}</td></tr>
      <tr><td style="padding:6px 12px 6px 0"><strong>Telegram / WhatsApp</strong></td><td>${esc(telegram || "—")}</td></tr>
      <tr><td style="padding:6px 12px 6px 0"><strong>Current business</strong></td><td>${esc(business || "—")}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;vertical-align:top"><strong>Why launch</strong></td><td>${esc(why || "—")}</td></tr>
    </table>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject,
      html,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    const msg = resendErrorMessage(data);
    return json({ error: msg, details: data }, 502);
  }

  return json({ ok: true, id: data.id ?? null });
}
