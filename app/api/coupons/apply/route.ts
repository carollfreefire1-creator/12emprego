import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { validateCoupon } from "@/lib/coupons";
import { runSpamChecks } from "@/lib/anti-spam";

const schema = z.object({
  code: z.string().min(3).max(40),
  amountCents: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (runSpamChecks({ formData: body ?? {} }).blocked) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { email: authUser.email! } });
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  const result = await validateCoupon(parsed.data.code, dbUser.id, parsed.data.amountCents);

  if (!result.valid) {
    return NextResponse.json({ valid: false, reason: result.reason }, { status: 200 });
  }

  return NextResponse.json({
    valid: true,
    discountCents: result.discountCents,
    coupon: result.coupon,
  });
}
