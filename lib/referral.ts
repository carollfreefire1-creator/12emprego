import { prisma } from "@/lib/prisma";

const REFERRAL_REWARD_CENTS = 2000; // R$ 20,00 em crédito por indicação completada

/** Vincula um novo usuário a quem o indicou, a partir do código de indicação */
export async function attachReferral(newUserId: string, referralCode?: string | null) {
  if (!referralCode) return null;

  const referrer = await prisma.user.findUnique({ where: { referralCode } });
  if (!referrer || referrer.id === newUserId) return null;

  await prisma.user.update({
    where: { id: newUserId },
    data: { referredById: referrer.id },
  });

  return prisma.referralReward.create({
    data: {
      referrerId: referrer.id,
      referredId: newUserId,
      rewardCents: REFERRAL_REWARD_CENTS,
      status: "pending",
    },
  });
}

/**
 * Marca a recompensa de indicação como concedida quando o indicado completa
 * a ação que conta como conversão (ex: primeiro serviço pago).
 */
export async function rewardReferralIfEligible(referredUserId: string) {
  const pending = await prisma.referralReward.findFirst({
    where: { referredId: referredUserId, status: "pending" },
  });
  if (!pending) return null;

  const updated = await prisma.referralReward.update({
    where: { id: pending.id },
    data: { status: "rewarded", rewardedAt: new Date() },
  });

  return updated;
}

export async function getReferralStats(userId: string) {
  const [totalReferred, rewards] = await Promise.all([
    prisma.user.count({ where: { referredById: userId } }),
    prisma.referralReward.findMany({ where: { referrerId: userId } }),
  ]);

  const totalRewardedCents = rewards
    .filter((r) => r.status === "rewarded")
    .reduce((acc, r) => acc + r.rewardCents, 0);

  const pendingCount = rewards.filter((r) => r.status === "pending").length;

  return { totalReferred, totalRewardedCents, pendingCount };
}

export function buildReferralLink(code: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://sosservicos.com.br";
  return `${base}/cadastro?ref=${code}`;
}
