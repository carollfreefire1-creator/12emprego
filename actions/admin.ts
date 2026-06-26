"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function logAction(adminId: string, action: string, targetType: string, targetId?: string, details?: object) {
  await prisma.adminLog.create({
    data: { adminId, action, targetType, targetId, details: details ?? {} },
  });
}

// ── DASHBOARD ────────────────────────────────────────────────
export async function getDashboardStatsAction(): Promise<ActionResult<{
  totalUsers: number;
  totalProfessionals: number;
  monthlyRevenueCents: number;
  totalRequests: number;
  activeSubscriptions: number;
  pendingProfessionals: number;
  revenueByMonth: { month: string; cents: number }[];
  requestsByMonth: { month: string; count: number }[];
}>> {
  try {
    await requireAdmin();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalProfessionals,
      totalRequests,
      activeSubscriptions,
      pendingProfessionals,
      monthlyPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.professional.count(),
      prisma.serviceRequest.count(),
      prisma.subscription.count({ where: { status: "active" } }),
      prisma.professional.count({ where: { approvalStatus: "pending" } }),
      prisma.payment.findMany({
        where: { status: "paid", createdAt: { gte: startOfMonth } },
        select: { amountCents: true },
      }),
    ]);

    const monthlyRevenueCents = monthlyPayments.reduce((sum, p) => sum + p.amountCents, 0);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    const payments = await prisma.payment.findMany({
      where: { status: "paid", createdAt: { gte: sixMonthsAgo } },
      select: { amountCents: true, createdAt: true },
    });

    const requests = await prisma.serviceRequest.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    });

    const monthLabels: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthLabels.push(d.toLocaleDateString("pt-BR", { month: "short" }));
    }

    const revenueByMonth = monthLabels.map((label, idx) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - idx));
      const cents = payments
        .filter((p) => p.createdAt.getMonth() === d.getMonth() && p.createdAt.getFullYear() === d.getFullYear())
        .reduce((s, p) => s + p.amountCents, 0);
      return { month: label, cents };
    });

    const requestsByMonth = monthLabels.map((label, idx) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - idx));
      const count = requests.filter(
        (r) => r.createdAt.getMonth() === d.getMonth() && r.createdAt.getFullYear() === d.getFullYear()
      ).length;
      return { month: label, count };
    });

    return {
      success: true,
      data: {
        totalUsers,
        totalProfessionals,
        monthlyRevenueCents,
        totalRequests,
        activeSubscriptions,
        pendingProfessionals,
        revenueByMonth,
        requestsByMonth,
      },
    };
  } catch (err) {
    console.error("[getDashboardStatsAction]", err);
    return { success: false, error: "Erro ao buscar estatísticas" };
  }
}

// ── USERS ────────────────────────────────────────────────────
export async function listUsersAction(params: {
  search?: string;
  role?: string;
  page?: number;
}): Promise<ActionResult<{ users: any[]; total: number }>> {
  try {
    await requireAdmin();
    const page = params.page ?? 1;
    const perPage = 20;

    const where: any = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }
    if (params.role) where.role = params.role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true, name: true, email: true, avatarUrl: true,
          role: true, blocked: true, createdAt: true, phone: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { success: true, data: { users, total } };
  } catch (err) {
    console.error("[listUsersAction]", err);
    return { success: false, error: "Erro ao listar usuários" };
  }
}

export async function toggleBlockUserAction(userId: string, block: boolean, reason?: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { blocked: block, blockedReason: block ? reason ?? "Bloqueado pelo administrador" : null },
    });
    await logAction(admin.id, block ? "block_user" : "unblock_user", "user", userId);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    console.error("[toggleBlockUserAction]", err);
    return { success: false, error: "Erro ao atualizar usuário" };
  }
}

export async function changeUserRoleAction(userId: string, role: "user" | "professional" | "admin"): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.user.update({ where: { id: userId }, data: { role } });
    await logAction(admin.id, "change_role", "user", userId, { role });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (err) {
    console.error("[changeUserRoleAction]", err);
    return { success: false, error: "Erro ao alterar papel" };
  }
}

// ── PROFESSIONALS ────────────────────────────────────────────
export async function listProfessionalsAction(params: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<ActionResult<{ professionals: any[]; total: number }>> {
  try {
    await requireAdmin();
    const page = params.page ?? 1;
    const perPage = 20;

    const where: any = {};
    if (params.status) where.approvalStatus = params.status;
    if (params.search) {
      where.user = {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { email: { contains: params.search, mode: "insensitive" } },
        ],
      };
    }

    const [professionals, total] = await Promise.all([
      prisma.professional.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: { user: { select: { name: true, email: true, avatarUrl: true, phone: true, blocked: true } } },
      }),
      prisma.professional.count({ where }),
    ]);

    return { success: true, data: { professionals, total } };
  } catch (err) {
    console.error("[listProfessionalsAction]", err);
    return { success: false, error: "Erro ao listar profissionais" };
  }
}

export async function approveProfessionalAction(professionalId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.professional.update({
      where: { id: professionalId },
      data: { approvalStatus: "approved", approvedAt: new Date(), rejectedReason: null },
    });
    await logAction(admin.id, "approve_professional", "professional", professionalId);
    revalidatePath("/admin/professionals");
    return { success: true };
  } catch (err) {
    console.error("[approveProfessionalAction]", err);
    return { success: false, error: "Erro ao aprovar profissional" };
  }
}

export async function rejectProfessionalAction(professionalId: string, reason: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.professional.update({
      where: { id: professionalId },
      data: { approvalStatus: "rejected", rejectedReason: reason },
    });
    await logAction(admin.id, "reject_professional", "professional", professionalId, { reason });
    revalidatePath("/admin/professionals");
    return { success: true };
  } catch (err) {
    console.error("[rejectProfessionalAction]", err);
    return { success: false, error: "Erro ao rejeitar profissional" };
  }
}

export async function blockProfessionalAction(professionalId: string, userId: string, block: boolean): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.user.update({ where: { id: userId }, data: { blocked: block } });
    await logAction(admin.id, block ? "block_professional" : "unblock_professional", "professional", professionalId);
    revalidatePath("/admin/professionals");
    return { success: true };
  } catch (err) {
    console.error("[blockProfessionalAction]", err);
    return { success: false, error: "Erro ao bloquear profissional" };
  }
}

// ── SERVICES (pedidos) ───────────────────────────────────────
export async function listServicesAction(params: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<ActionResult<{ services: any[]; total: number }>> {
  try {
    await requireAdmin();
    const page = params.page ?? 1;
    const perPage = 20;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.search) where.title = { contains: params.search, mode: "insensitive" };

    const [services, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: {
          client: { select: { name: true, email: true } },
          category: { select: { name: true } },
        },
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    return { success: true, data: { services, total } };
  } catch (err) {
    console.error("[listServicesAction]", err);
    return { success: false, error: "Erro ao listar serviços" };
  }
}

// ── CATEGORIES ────────────────────────────────────────────────
export async function listCategoriesAction(): Promise<ActionResult<any[]>> {
  try {
    await requireAdmin();
    const categories = await prisma.category.findMany({ orderBy: { orderIndex: "asc" } });
    return { success: true, data: categories };
  } catch (err) {
    console.error("[listCategoriesAction]", err);
    return { success: false, error: "Erro ao listar categorias" };
  }
}

export async function createCategoryAction(data: {
  name: string; slug: string; icon?: string; orderIndex?: number;
}): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const category = await prisma.category.create({ data });
    await logAction(admin.id, "create_category", "category", category.id, data);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err) {
    console.error("[createCategoryAction]", err);
    return { success: false, error: "Erro ao criar categoria" };
  }
}

export async function updateCategoryAction(id: string, data: {
  name?: string; slug?: string; icon?: string; active?: boolean; orderIndex?: number;
}): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.category.update({ where: { id }, data });
    await logAction(admin.id, "update_category", "category", id, data);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err) {
    console.error("[updateCategoryAction]", err);
    return { success: false, error: "Erro ao atualizar categoria" };
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.category.delete({ where: { id } });
    await logAction(admin.id, "delete_category", "category", id);
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (err) {
    console.error("[deleteCategoryAction]", err);
    return { success: false, error: "Erro ao excluir categoria" };
  }
}

// ── PLANS ──────────────────────────────────────────────────────
export async function listPlansAction(): Promise<ActionResult<any[]>> {
  try {
    await requireAdmin();
    const plans = await prisma.plan.findMany({
      orderBy: { priceCents: "asc" },
      include: { _count: { select: { subscriptions: true } } },
    });
    return { success: true, data: plans };
  } catch (err) {
    console.error("[listPlansAction]", err);
    return { success: false, error: "Erro ao listar planos" };
  }
}

export async function savePlanAction(data: {
  id?: string; name: string; priceCents: number; interval: string; features: string[]; active: boolean;
}): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (data.id) {
      await prisma.plan.update({
        where: { id: data.id },
        data: { name: data.name, priceCents: data.priceCents, interval: data.interval, features: data.features, active: data.active },
      });
      await logAction(admin.id, "update_plan", "plan", data.id, data);
    } else {
      const plan = await prisma.plan.create({
        data: { name: data.name, priceCents: data.priceCents, interval: data.interval, features: data.features, active: data.active },
      });
      await logAction(admin.id, "create_plan", "plan", plan.id, data);
    }
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    console.error("[savePlanAction]", err);
    return { success: false, error: "Erro ao salvar plano" };
  }
}

// ── PAYMENTS ───────────────────────────────────────────────────
export async function listPaymentsAction(params: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<ActionResult<{ payments: any[]; total: number; totalCents: number }>> {
  try {
    await requireAdmin();
    const page = params.page ?? 1;
    const perPage = 20;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.search) {
      where.user = {
        OR: [
          { name: { contains: params.search, mode: "insensitive" } },
          { email: { contains: params.search, mode: "insensitive" } },
        ],
      };
    }

    const [payments, total, agg] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.payment.count({ where }),
      prisma.payment.aggregate({ where: { ...where, status: "paid" }, _sum: { amountCents: true } }),
    ]);

    return { success: true, data: { payments, total, totalCents: agg._sum.amountCents ?? 0 } };
  } catch (err) {
    console.error("[listPaymentsAction]", err);
    return { success: false, error: "Erro ao listar pagamentos" };
  }
}

export async function refundPaymentAction(paymentId: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.payment.update({ where: { id: paymentId }, data: { status: "refunded" } });
    await logAction(admin.id, "refund_payment", "payment", paymentId);
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (err) {
    console.error("[refundPaymentAction]", err);
    return { success: false, error: "Erro ao reembolsar pagamento" };
  }
}

// ── REPORTS ────────────────────────────────────────────────────
export async function getReportsAction(params: {
  from?: string; to?: string;
}): Promise<ActionResult<{
  totalRevenueCents: number;
  totalRequests: number;
  conversionRate: number;
  topCategories: { name: string; count: number }[];
  topProfessionals: { name: string; count: number }[];
}>> {
  try {
    await requireAdmin();
    const from = params.from ? new Date(params.from) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const to = params.to ? new Date(params.to) : new Date();

    const [payments, requests, completedRequests, categoryGroups, professionalGroups] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "paid", createdAt: { gte: from, lte: to } },
        _sum: { amountCents: true },
      }),
      prisma.serviceRequest.count({ where: { createdAt: { gte: from, lte: to } } }),
      prisma.serviceRequest.count({ where: { createdAt: { gte: from, lte: to }, status: "completed" } }),
      prisma.serviceRequest.groupBy({
        by: ["categoryId"],
        where: { createdAt: { gte: from, lte: to } },
        _count: true,
        orderBy: { _count: { categoryId: "desc" } },
        take: 5,
      }),
      prisma.serviceRequest.groupBy({
        by: ["professionalId"],
        where: { createdAt: { gte: from, lte: to }, professionalId: { not: null } },
        _count: true,
        orderBy: { _count: { professionalId: "desc" } },
        take: 5,
      }),
    ]);

    const categoryIds = categoryGroups.map((c) => c.categoryId).filter(Boolean) as string[];
    const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
    const topCategories = categoryGroups.map((g) => ({
      name: categories.find((c) => c.id === g.categoryId)?.name ?? "—",
      count: g._count as number,
    }));

    const proIds = professionalGroups.map((p) => p.professionalId).filter(Boolean) as string[];
    const pros = await prisma.professional.findMany({
      where: { id: { in: proIds } },
      include: { user: { select: { name: true } } },
    });
    const topProfessionals = professionalGroups.map((g) => ({
      name: pros.find((p) => p.id === g.professionalId)?.user.name ?? "—",
      count: g._count as number,
    }));

    return {
      success: true,
      data: {
        totalRevenueCents: payments._sum.amountCents ?? 0,
        totalRequests: requests,
        conversionRate: requests > 0 ? Math.round((completedRequests / requests) * 100) : 0,
        topCategories,
        topProfessionals,
      },
    };
  } catch (err) {
    console.error("[getReportsAction]", err);
    return { success: false, error: "Erro ao gerar relatório" };
  }
}

// ── SETTINGS ───────────────────────────────────────────────────
export async function getAdminLogsAction(page = 1): Promise<ActionResult<{ logs: any[]; total: number }>> {
  try {
    await requireAdmin();
    const perPage = 30;
    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.adminLog.count(),
    ]);
    return { success: true, data: { logs, total } };
  } catch (err) {
    console.error("[getAdminLogsAction]", err);
    return { success: false, error: "Erro ao buscar logs" };
  }
}

// ── CUPONS ───────────────────────────────────────────────────────
export async function listCouponsAction(): Promise<ActionResult<any[]>> {
  try {
    await requireAdmin();
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { redemptions: true } } },
    });
    return { success: true, data: coupons };
  } catch (err) {
    console.error("[listCouponsAction]", err);
    return { success: false, error: "Erro ao buscar cupons" };
  }
}

export async function saveCouponAction(input: {
  id?: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  maxUses?: number | null;
  minAmountCents?: number | null;
  expiresAt?: string | null;
  active: boolean;
}): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = {
      code: input.code.toUpperCase().trim(),
      type: input.type,
      value: input.value,
      maxUses: input.maxUses ?? null,
      minAmountCents: input.minAmountCents ?? null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      active: input.active,
    };

    if (input.id) {
      await prisma.coupon.update({ where: { id: input.id }, data });
      await logAction(admin.id, "update_coupon", "coupon", input.id, data);
    } else {
      const created = await prisma.coupon.create({ data });
      await logAction(admin.id, "create_coupon", "coupon", created.id, data);
    }
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err) {
    console.error("[saveCouponAction]", err);
    return { success: false, error: "Erro ao salvar cupom. Verifique se o código já existe." };
  }
}

export async function deleteCouponAction(id: string): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.coupon.delete({ where: { id } });
    await logAction(admin.id, "delete_coupon", "coupon", id);
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err) {
    console.error("[deleteCouponAction]", err);
    return { success: false, error: "Erro ao excluir cupom" };
  }
}

// ── INDICAÇÕES ────────────────────────────────────────────────────
export async function listReferralsAction(): Promise<ActionResult<any[]>> {
  try {
    await requireAdmin();
    const rewards = await prisma.referralReward.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        referrer: { select: { name: true, email: true } },
        referred: { select: { name: true, email: true } },
      },
    });
    return { success: true, data: rewards };
  } catch (err) {
    console.error("[listReferralsAction]", err);
    return { success: false, error: "Erro ao buscar indicações" };
  }
}

// ── SEGURANÇA / LOGS DE REQUISIÇÃO ────────────────────────────────
export async function getFlaggedRequestLogsAction(): Promise<ActionResult<any[]>> {
  try {
    await requireAdmin();
    const logs = await prisma.requestLog.findMany({
      where: { flagged: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return { success: true, data: logs };
  } catch (err) {
    console.error("[getFlaggedRequestLogsAction]", err);
    return { success: false, error: "Erro ao buscar logs de segurança" };
  }
}
