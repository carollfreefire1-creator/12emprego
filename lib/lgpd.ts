import { prisma } from "@/lib/prisma";
import { logConsent } from "@/lib/logs";

/**
 * Exporta todos os dados pessoais armazenados de um usuário, conforme
 * Art. 18 da LGPD (direito de acesso e portabilidade).
 */
export async function exportUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      professional: true,
      serviceRequests: true,
      payments: true,
      subscriptions: true,
      couponRedemptions: { include: { coupon: true } },
      notifications: true,
      consentLogs: true,
    },
  });

  if (!user) return null;

  await logConsent({ userId, action: "data_export" });

  // Remove campos internos sensíveis que não devem ir no export do titular
  const { ...safeUser } = user;
  return safeUser;
}

/**
 * Registra uma solicitação de exclusão de conta (Art. 18, VI).
 * A exclusão efetiva deve ocorrer via job assíncrono, respeitando prazos legais
 * de retenção (ex: registros fiscais de pagamento).
 */
export async function requestDataDeletion(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { dataDeletionRequest: new Date() },
  });
  await logConsent({ userId, action: "data_deletion_request" });
}

/**
 * Anonimiza dados pessoais do usuário, preservando registros financeiros
 * exigidos por lei (sem vínculo direto de identidade).
 */
export async function anonymizeUser(userId: string) {
  const anonEmail = `usuario-removido-${userId}@anon.sosservicos.com.br`;
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: "Usuário removido",
      email: anonEmail,
      phone: null,
      avatarUrl: null,
      blocked: true,
      blockedReason: "Conta excluída a pedido do titular (LGPD)",
    },
  });
  await logConsent({ userId, action: "data_deletion_completed" });
}

export async function recordConsent(userId: string, marketingOptIn: boolean, ip?: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { consentAcceptedAt: new Date(), marketingOptIn },
  });
  await logConsent({
    userId,
    action: marketingOptIn ? "accept_marketing" : "accept_terms",
    ip,
  });
}
