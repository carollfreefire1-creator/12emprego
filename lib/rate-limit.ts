/**
 * Rate limiting simples por IP/chave, sem dependências externas.
 *
 * Funciona em memória por instância (edge function ou node).
 * Em produção na Vercel, cada instância tem seu próprio estado —
 * isso é aceitável para mitigar abuso básico (formulários, login,
 * propostas). Para rate limit global e persistente entre instâncias,
 * defina UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN e o limiter
 * abaixo usará Redis automaticamente.
 */

type Bucket = { count: number; resetAt: number };

const memoryStore = new Map<string, Bucket>();

// Limpeza periódica para não vazar memória em runtimes long-lived
let lastSweep = Date.now();
function sweep() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of memoryStore.entries()) {
    if (bucket.resetAt < now) memoryStore.delete(key);
  }
}

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

interface RateLimitOptions {
  /** Identificador único: geralmente IP, ou `ip:rota` */
  key: string;
  /** Máximo de requisições permitidas na janela */
  limit: number;
  /** Janela em segundos */
  windowSeconds: number;
}

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

async function upstashRateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL!;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;
  const redisKey = `ratelimit:${opts.key}`;

  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", redisKey],
      ["EXPIRE", redisKey, opts.windowSeconds.toString(), "NX"],
    ]),
  });

  const data = await res.json();
  const count = Number(data?.[0]?.result ?? 1);
  const resetAt = Date.now() + opts.windowSeconds * 1000;

  return {
    success: count <= opts.limit,
    limit: opts.limit,
    remaining: Math.max(0, opts.limit - count),
    resetAt,
  };
}

function memoryRateLimit(opts: RateLimitOptions): RateLimitResult {
  sweep();
  const now = Date.now();
  const existing = memoryStore.get(opts.key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + opts.windowSeconds * 1000;
    memoryStore.set(opts.key, { count: 1, resetAt });
    return { success: true, limit: opts.limit, remaining: opts.limit - 1, resetAt };
  }

  existing.count += 1;
  return {
    success: existing.count <= opts.limit,
    limit: opts.limit,
    remaining: Math.max(0, opts.limit - existing.count),
    resetAt: existing.resetAt,
  };
}

export async function rateLimit(opts: RateLimitOptions): Promise<RateLimitResult> {
  if (process.env.RATE_LIMIT_ENABLED === "false") {
    return { success: true, limit: opts.limit, remaining: opts.limit, resetAt: Date.now() };
  }
  if (hasUpstash) return upstashRateLimit(opts);
  return memoryRateLimit(opts);
}

/** Presets comuns usados pela aplicação */
export const RATE_LIMITS = {
  login: { limit: 5, windowSeconds: 60 },
  signup: { limit: 3, windowSeconds: 60 * 10 },
  contactForm: { limit: 3, windowSeconds: 60 },
  serviceRequest: { limit: 10, windowSeconds: 60 * 60 },
  couponApply: { limit: 10, windowSeconds: 60 },
  apiDefault: { limit: 60, windowSeconds: 60 },
} as const;

/** Extrai o IP real do request, considerando proxies (Vercel) */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "0.0.0.0";
}
