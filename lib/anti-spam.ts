/**
 * Utilitários de proteção contra spam para formulários públicos
 * (contato, cadastro, solicitação de serviço, propostas).
 */

const HONEYPOT_FIELD = process.env.HONEYPOT_FIELD_NAME || "website_confirm";

/** Campos de honeypot devem chegar vazios. Bots geralmente preenchem todos os campos. */
export function isHoneypotTriggered(formData: FormData | Record<string, unknown>): boolean {
  const value =
    formData instanceof FormData ? formData.get(HONEYPOT_FIELD) : formData[HONEYPOT_FIELD];
  return !!value && String(value).trim().length > 0;
}

export function honeypotFieldName() {
  return HONEYPOT_FIELD;
}

/** Domínios de e-mail descartável mais comuns usados em spam/abuso */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "yopmail.com",
  "fakeinbox.com",
]);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && DISPOSABLE_DOMAINS.has(domain);
}

/** Heurística simples para detectar conteúdo claramente promocional/spam em textos livres */
const SPAM_PATTERNS = [
  /\bhttps?:\/\/\S+/gi, // múltiplos links
  /\b(viagra|bitcoin|crypto|empréstimo facilitado|ganhe dinheiro)\b/gi,
  /(.)\1{6,}/g, // caracteres repetidos excessivamente (aaaaaaa)
];

export function looksLikeSpam(text: string): boolean {
  if (!text) return false;
  const linkMatches = text.match(/https?:\/\/\S+/gi);
  if (linkMatches && linkMatches.length >= 3) return true;
  return SPAM_PATTERNS.slice(1).some((pattern) => pattern.test(text));
}

/** Verifica tempo mínimo de preenchimento de formulário (anti-bot baseado em timing) */
export function isSubmittedTooFast(formRenderedAt: number, minMs = 1500): boolean {
  return Date.now() - formRenderedAt < minMs;
}

interface SpamCheckInput {
  formData: FormData | Record<string, unknown>;
  email?: string;
  freeText?: string;
  renderedAt?: number;
}

export interface SpamCheckResult {
  blocked: boolean;
  reason?: string;
}

export function runSpamChecks(input: SpamCheckInput): SpamCheckResult {
  if (isHoneypotTriggered(input.formData)) {
    return { blocked: true, reason: "honeypot" };
  }
  if (input.email && isDisposableEmail(input.email)) {
    return { blocked: true, reason: "disposable_email" };
  }
  if (input.freeText && looksLikeSpam(input.freeText)) {
    return { blocked: true, reason: "spam_pattern" };
  }
  if (input.renderedAt && isSubmittedTooFast(input.renderedAt)) {
    return { blocked: true, reason: "too_fast" };
  }
  return { blocked: false };
}
