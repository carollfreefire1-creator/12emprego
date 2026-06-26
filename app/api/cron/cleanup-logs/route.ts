import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RETENTION_DAYS = 90;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  // Mantém logs marcados (flagged) por mais tempo para investigação de abuso
  const result = await prisma.requestLog.deleteMany({
    where: { createdAt: { lt: cutoff }, flagged: false },
  });

  return NextResponse.json({ success: true, deleted: result.count });
}
