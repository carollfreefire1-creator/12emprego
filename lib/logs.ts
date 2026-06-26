import { prisma } from "@/lib/prisma";

interface LogRequestInput {
  userId?: string | null;
  ip: string;
  path: string;
  method: string;
  statusCode?: number;
  userAgent?: string | null;
  flagged?: boolean;
}

/**
 * Registra uma requisição para fins de auditoria e detecção de abuso.
 * Falhas de log nunca devem interromper o fluxo principal da aplicação.
 */
export async function logRequest(input: LogRequestInput): Promise<void> {
  try {
    await prisma.requestLog.create({
      data: {
        userId: input.userId ?? null,
        ip: input.ip,
        path: input.path,
        method: input.method,
        statusCode: input.statusCode,
        userAgent: input.userAgent ?? null,
        flagged: input.flagged ?? false,
      },
    });
  } catch (err) {
    console.error("[logRequest] falha ao registrar log:", err);
  }
}

/** Registra uma ação administrativa para a trilha de auditoria do painel /admin */
export async function logAdminAction(input: {
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.adminLog.create({
      data: {
        adminId: input.adminId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        details: input.details,
      },
    });
  } catch (err) {
    console.error("[logAdminAction] falha ao registrar log:", err);
  }
}

/** Registra eventos de consentimento LGPD (aceite de termos, opt-in/out, exportação, exclusão) */
export async function logConsent(input: {
  userId: string;
  action:
    | "accept_terms"
    | "accept_marketing"
    | "revoke_marketing"
    | "data_export"
    | "data_deletion_request"
    | "data_deletion_completed";
  ip?: string;
}): Promise<void> {
  try {
    await prisma.consentLog.create({
      data: { userId: input.userId, action: input.action, ip: input.ip },
    });
  } catch (err) {
    console.error("[logConsent] falha ao registrar log:", err);
  }
}
