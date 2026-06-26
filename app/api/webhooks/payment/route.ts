import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rewardReferralIfEligible } from "@/lib/referral";
import { redeemCoupon } from "@/lib/coupons";

/**
 * Webhook genérico de gateway de pagamento (ex: Stripe, Mercado Pago, Pagar.me).
 * Adapte a verificação de assinatura e o parsing do payload ao provedor escolhido
 * antes de usar em produção — esta implementação é um esqueleto funcional.
 */
export async function POST(request: NextRequest) {
  // TODO: validar assinatura do webhook conforme o provedor (ex: header Stripe-Signature)
  const body = await request.json().catch(() => null);
  if (!body?.gatewayId || !body?.status) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({ where: { gatewayId: body.gatewayId } });
  if (!payment) {
    return NextResponse.json({ error: "Pagamento não encontrado." }, { status: 404 });
  }

  const status = body.status === "succeeded" ? "paid" : body.status === "failed" ? "failed" : "pending";

  await prisma.payment.update({ where: { id: payment.id }, data: { status } });

  if (status === "paid") {
    if (payment.couponId) {
      await redeemCoupon(payment.couponId, payment.userId).catch(() => {});
    }
    await rewardReferralIfEligible(payment.userId).catch(() => {});
  }

  return NextResponse.json({ received: true });
}
