import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { recordConsent } from "@/lib/lgpd";
import { getClientIp } from "@/lib/rate-limit";

const schema = z.object({ marketingOptIn: z.boolean() });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    // Visitante anônimo: o cookie local já registra a escolha; nada a persistir no banco.
    return NextResponse.json({ success: true, persisted: false });
  }

  const dbUser = await prisma.user.findUnique({ where: { email: authUser.email! } });
  if (!dbUser) return NextResponse.json({ success: true, persisted: false });

  await recordConsent(dbUser.id, parsed.data.marketingOptIn, getClientIp(request.headers));

  return NextResponse.json({ success: true, persisted: true });
}
