import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { runSpamChecks } from "@/lib/anti-spam";
import { logRequest } from "@/lib/logs";

const schema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  address: z.string().max(200).optional(),
  budgetCents: z.number().int().positive().optional(),
  renderedAt: z.number().optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);

  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const rate = await rateLimit({ key: `${ip}:service-request`, ...RATE_LIMITS.serviceRequest });
  if (!rate.success) {
    await logRequest({ ip, path: "/api/requests", method: "POST", statusCode: 429, flagged: true });
    return NextResponse.json({ error: "Muitas solicitações. Tente mais tarde." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);

  const spamCheck = runSpamChecks({
    formData: body ?? {},
    freeText: body?.description,
    renderedAt: body?.renderedAt,
  });
  if (spamCheck.blocked) {
    await logRequest({ ip, path: "/api/requests", method: "POST", statusCode: 400, flagged: true });
    return NextResponse.json({ error: "Não foi possível processar sua solicitação." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { email: authUser.email! } });
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  if (dbUser.blocked) {
    return NextResponse.json({ error: "Sua conta está bloqueada." }, { status: 403 });
  }

  const created = await prisma.serviceRequest.create({
    data: {
      clientId: dbUser.id,
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      description: parsed.data.description,
      address: parsed.data.address,
      budgetCents: parsed.data.budgetCents,
    },
  });

  await logRequest({ userId: dbUser.id, ip, path: "/api/requests", method: "POST", statusCode: 201 });

  return NextResponse.json({ success: true, id: created.id }, { status: 201 });
}
