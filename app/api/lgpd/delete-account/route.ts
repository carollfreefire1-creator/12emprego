import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { requestDataDeletion } from "@/lib/lgpd";

export async function POST() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({ where: { email: authUser.email! } });
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  await requestDataDeletion(dbUser.id);

  return NextResponse.json({
    success: true,
    message:
      "Solicitação registrada. Seus dados serão anonimizados em até 15 dias, conforme a LGPD.",
  });
}
