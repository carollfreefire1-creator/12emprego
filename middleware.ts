import { NextResponse, type NextRequest } from "next/server";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";

const RATE_LIMITED_PREFIXES: Array<{ prefix: string; preset: keyof typeof RATE_LIMITS }> = [
  { prefix: "/api/coupons/apply", preset: "couponApply" },
  { prefix: "/api/contato", preset: "contactForm" },
  { prefix: "/api/requests", preset: "serviceRequest" },
  { prefix: "/login", preset: "login" },
  { prefix: "/cadastro", preset: "signup" },
];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });
  const { pathname } = request.nextUrl;

  // ── Rate limiting básico para rotas sensíveis ──────────────────────────
  const matched = RATE_LIMITED_PREFIXES.find((r) => pathname.startsWith(r.prefix));
  if (matched) {
    const ip = getClientIp(request.headers);
    const preset = RATE_LIMITS[matched.preset];
    const result = await rateLimit({ key: `${ip}:${matched.prefix}`, ...preset });

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ error: "Muitas requisições. Tente novamente em breve." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  }

  // ── Sessão Supabase (necessário para SSR de cookies de auth) ───────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let user = null;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { createServerClient } = await import("@supabase/ssr");
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options as any);
            });
          },
        },
      });

      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // Supabase not configured — skip auth checks
    }
  }

  // ── Proteção do painel administrativo ──────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (supabaseUrl && supabaseAnonKey && !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ── Proteção de rotas autenticadas gerais ──────────────────────────────
  if (pathname.startsWith("/conta") && supabaseUrl && supabaseAnonKey && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/conta/:path*",
    "/login",
    "/cadastro",
    "/api/coupons/:path*",
    "/api/contato/:path*",
    "/api/requests/:path*",
  ],
};
