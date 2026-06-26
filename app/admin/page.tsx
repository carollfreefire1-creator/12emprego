import { requireAdmin } from "@/lib/admin/auth";
import { getDashboardStatsAction } from "@/actions/admin";
import AdminTopbar from "@/components/admin/AdminTopbar";
import StatCard from "@/components/admin/StatCard";
import RevenueChart from "@/components/admin/RevenueChart";
import Link from "next/link";

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const res = await getDashboardStatsAction();
  const stats = res.success ? res.data! : null;

  return (
    <>
      <AdminTopbar title="Dashboard" admin={admin} />
      <main style={{ padding: 24, maxWidth: 1280 }}>
        {!stats ? (
          <div style={{ color: "#DC2626" }}>Erro ao carregar estatísticas.</div>
        ) : (
          <>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16, marginBottom: 24,
            }}>
              <StatCard label="Usuários" value={stats.totalUsers.toLocaleString("pt-BR")} icon="👥" accent="#38BDF8" />
              <StatCard label="Profissionais" value={stats.totalProfessionals.toLocaleString("pt-BR")} icon="🛠️" accent="#A78BFA" />
              <StatCard
                label="Receita mensal"
                value={`R$ ${(stats.monthlyRevenueCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                icon="💰" accent="#34D399"
              />
              <StatCard label="Pedidos" value={stats.totalRequests.toLocaleString("pt-BR")} icon="📋" accent="#FB923C" />
              <StatCard label="Assinaturas ativas" value={stats.activeSubscriptions.toLocaleString("pt-BR")} icon="💳" accent="#F472B6" />
            </div>

            {stats.pendingProfessionals > 0 && (
              <Link
                href="/admin/professionals?status=pending"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 12,
                  padding: "14px 18px", marginBottom: 24, textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: "#92400E" }}>
                  ⚠️ {stats.pendingProfessionals} profissional(is) aguardando aprovação
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>Revisar →</span>
              </Link>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
              <RevenueChart data={stats.revenueByMonth} />
              <div style={{ background: "#FFFFFF", borderRadius: 14, border: "1px solid #E2E8F0", padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 18 }}>
                  Pedidos por mês
                </div>
                {stats.requestsByMonth.map((m) => (
                  <div key={m.month} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                    <span style={{ fontSize: 13, color: "#64748B", textTransform: "capitalize" }}>{m.month}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{m.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
