import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runSpamChecks } from "@/lib/anti-spam";
import { logRequest } from "@/lib/logs";
import { getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  message: z.string().min(5).max(1000),
  renderedAt: z.number().optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const body = await request.json().catch(() => null);

  const spamCheck = runSpamChecks({
    formData: body ?? {},
    email: body?.email,
    freeText: body?.message,
    renderedAt: body?.renderedAt,
  });
  if (spamCheck.blocked) {
    await logRequest({ ip, path: "/api/contato", method: "POST", statusCode: 400, flagged: true });
    // Resposta neutra: não revela ao remetente que foi detectado como spam.
    return NextResponse.json({ success: true });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  // Em produção: enviar e-mail via provedor (Resend, SES, etc.) ou registrar em fila de suporte.
  console.log("[contato] nova mensagem:", parsed.data.email, parsed.data.message.slice(0, 80));

  await logRequest({ ip, path: "/api/contato", method: "POST", statusCode: 200 });

  return NextResponse.json({ success: true });
}
