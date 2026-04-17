export type LeadFieldsInput = {
  name: string;
  email: string;
  phone: string;
  telegram: string;
  business: string;
  why: string;
};

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "guerrillamail.com",
  "10minutemail.com",
  "yopmail.com",
  "throwaway.email",
  "trashmail.com",
  "getnada.com",
  "fakeinbox.com",
  "temp-mail.org",
  "sharklasers.com",
  "grr.la",
  "dispostable.com",
  "maildrop.cc",
  "mintemail.com",
]);

export const TYPO_EMAIL_DOMAINS = new Set([
  "gmial.com",
  "gmai.com",
  "yahooo.com",
  "hotmial.com",
  "outlok.com",
  "iclod.com",
  "protonmai.com",
]);

/** Inline hint only — does not block submit. */
export function getEmailWarning(email: string): string | null {
  const e = email.trim().toLowerCase();
  if (!e.includes("@")) return null;
  const [local, domain = ""] = e.split("@");
  if (!local || !domain) return null;
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return "Temporary inboxes often miss replies — a regular mailbox (Gmail, Outlook, iCloud, regional ISP, work…) works best.";
  }
  if (TYPO_EMAIL_DOMAINS.has(domain)) {
    return "Domain looks misspelled — double-check (e.g. gmail.com, outlook.com, or your usual provider).";
  }
  if (/^(test|asdf|qwerty|abc123|fake|none|noemail)\d*$/i.test(local)) {
    return "This address looks like a placeholder — use one you actually check, if possible.";
  }
  return null;
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/**
 * Soft hint only — supports global numbers. India-specific text only when
 * input clearly looks like +91 / India mobile.
 */
export function getPhoneWarning(phone: string): string | null {
  const t = phone.trim();
  if (!t) return null;

  if (/[a-zA-Z]/.test(t)) {
    return "Use digits and your country code (e.g. +1, +44, +971, +91) so we can reach you.";
  }

  const d = digitsOnly(t);
  const hasPlus = t.startsWith("+");

  const compact = t.replace(/\s/g, "");
  const indiaIntent =
    /^\+91/i.test(compact) ||
    d.startsWith("0091") ||
    (d.startsWith("91") && d.length >= 11);

  if (indiaIntent) {
    let n = d;
    if (n.startsWith("0091")) n = n.slice(4);
    else if (n.startsWith("91") && n.length >= 11) n = n.slice(2);
    if (n.length === 11 && n.startsWith("0")) n = n.slice(1);
    if (n.length !== 10) {
      return "For +91, 10 digits after the country code is usual — worth a quick check.";
    }
    if (!/^[6-9]\d{9}$/.test(n)) {
      return "Indian mobiles often start with 6–9 — double-check if this is an Indian mobile.";
    }
    return null;
  }

  if (hasPlus) {
    const afterPlus = digitsOnly(t.slice(1));
    if (afterPlus.length > 0 && afterPlus.length < 8) {
      return "International numbers usually need country code + enough digits — looks a bit short.";
    }
    if (afterPlus.length > 15) {
      return "Longer than typical international numbers (max ~15 digits) — please double-check.";
    }
    return null;
  }

  if (d.length > 0 && d.length < 7) {
    return "Looks short — with country code (+…) it’s easier for a global team to call you back.";
  }
  if (d.length > 15) {
    return "Please double-check the number length.";
  }
  return null;
}

export function normalizeIndianPhoneForSubmit(phone: string): string {
  const t = phone.trim();
  if (!t) return "";
  let d = t.replace(/\D/g, "");
  if (d.startsWith("0091")) d = d.slice(4);
  else if (d.startsWith("91") && d.length >= 11) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d.length === 10 ? d : "";
}

/**
 * Minimal checks so submit / API don’t surprise users — fishy email & phone
 * are handled with inline warnings (getEmailWarning / getPhoneWarning).
 */
export function validateLeadForm(fields: LeadFieldsInput): string | null {
  const name = fields.name.trim();
  if (!name) return "Please enter your name.";
  const email = fields.email.trim();
  if (!email) return "Please enter your email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return "Please enter a valid email address.";
  }
  return null;
}
