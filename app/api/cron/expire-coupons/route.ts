import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const result = await prisma.coupon.updateMany({
    where: { active: true, expiresAt: { lt: new Date() } },
    data: { active: false },
  });

  return NextResponse.json({ success: true, deactivated: result.count });
}
