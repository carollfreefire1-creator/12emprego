import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { attachReferral } from "@/lib/referral";
import { recordConsent } from "@/lib/lgpd";
import { runSpamChecks } from "@/lib/anti-spam";
import { getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  role: z.enum(["user", "professional"]).default("user"),
  referralCode: z.string().optional(),
  marketingOptIn: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (runSpamChecks({ formData: body ?? {}, email: body?.email }).blocked) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { name, email, role, referralCode, marketingOptIn } = parsed.data;

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, role },
  });

  if (role === "professional") {
    await prisma.professional.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });
  }

  if (referralCode) {
    await attachReferral(user.id, referralCode).catch((err) =>
      console.error("[complete-signup] erro ao processar indicação:", err)
    );
  }

  await recordConsent(user.id, marketingOptIn, getClientIp(request.headers));

  return NextResponse.json({ success: true });
}
