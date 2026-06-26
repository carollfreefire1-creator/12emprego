import { prisma } from "@/lib/prisma";

export interface CouponValidationResult {
  valid: boolean;
  reason?: string;
  discountCents?: number;
  coupon?: { id: string; code: string; type: string; value: number };
}

/**
 * Valida um cupom para um usuário e valor de compra, sem efetivar o resgate.
 * `amountCents` é o valor bruto antes do desconto.
 */
export async function validateCoupon(
  code: string,
  userId: string,
  amountCents: number
): Promise<CouponValidationResult> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });

  if (!coupon) return { valid: false, reason: "Cupom não encontrado." };
  if (!coupon.active) return { valid: false, reason: "Cupom inativo." };

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { valid: false, reason: "Cupom ainda não está disponível." };
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { valid: false, reason: "Cupom expirado." };
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, reason: "Cupom esgotado." };
  }
  if (coupon.minAmountCents && amountCents < coupon.minAmountCents) {
    return {
      valid: false,
      reason: `Valor mínimo de R$ ${(coupon.minAmountCents / 100).toFixed(2)} não atingido.`,
    };
  }

  const alreadyUsed = await prisma.couponRedemption.findUnique({
    where: { couponId_userId: { couponId: coupon.id, userId } },
  });
  if (alreadyUsed) return { valid: false, reason: "Você já utilizou este cupom." };

  const discountCents =
    coupon.type === "percent"
      ? Math.round((amountCents * coupon.value) / 100)
      : Math.min(coupon.value, amountCents);

  return {
    valid: true,
    discountCents,
    coupon: { id: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value },
  };
}

/** Efetiva o uso do cupom — chamar apenas após o pagamento ser confirmado */
export async function redeemCoupon(couponId: string, userId: string) {
  await prisma.$transaction([
    prisma.couponRedemption.create({ data: { couponId, userId } }),
    prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } }),
  ]);
}
