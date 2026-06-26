import { requireAdmin } from "@/lib/admin/auth";
import { getReportsAction } from "@/actions/admin";
import AdminTopbar from "@/components/admin/AdminTopbar";
import StatCard from "@/components/admin/StatCard";

export default async function ReportsPage({
  searchParams,
}: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const res = await getReportsAction({ from: sp.from, to: sp.to });
  const data = res.success ? res.data! : null;

  return (
    <>
      <AdminTopbar title="Relatórios" admin={admin} />
      <main style={{ padding: 24, maxWidth: 1100 }}>
        <form style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <input type="date" name="from" defaultValue={sp.from} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0" }} />
          <input type="date" name="to" defaultValue={sp.to} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0" }} />
          <button type="submit" style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#0F172A", color: "#FFF", fontWeight: 600, cursor: "pointer" }}>
            Filtrar
          </button>
        </form>

        {!data ? (
          <div style={{ color: "#DC2626" }}>Erro ao gerar relatório.</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
              <StatCard label="Receita no período" value={`R$ ${(data.totalRevenueCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon="💰" />
              <StatCard label="Pedidos no período" value={String(data.totalRequests)} icon="📋" />
              <StatCard label="Taxa de conclusão" value={`${data.conversionRate}%`} icon="✅" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 14 }}>Categorias mais demandadas</div>
                {data.topCategories.map((c, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                    <span style={{ color: "#64748B" }}>{c.name}</span>
                    <span style={{ fontWeight: 700 }}>{c.count}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 14 }}>Top profissionais</div>
                {data.topProfessionals.map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                    <span style={{ color: "#64748B" }}>{p.name}</span>
                    <span style={{ fontWeight: 700 }}>{p.count}</span>
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
