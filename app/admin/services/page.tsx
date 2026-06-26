import { requireAdmin } from "@/lib/admin/auth";
import { listServicesAction } from "@/actions/admin";
import AdminTopbar from "@/components/admin/AdminTopbar";
import StatusBadge from "@/components/admin/StatusBadge";

export default async function ServicesPage({
  searchParams,
}: { searchParams: Promise<{ page?: string; status?: string }> }) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const res = await listServicesAction({ status: sp.status, page });
  const services = res.success ? res.data!.services : [];
  const total = res.success ? res.data!.total : 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <>
      <AdminTopbar title="Pedidos" admin={admin} />
      <main style={{ padding: 24, maxWidth: 1280 }}>
        <div style={{ background: "#FFFFFF", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, color: "#64748B" }}>Título</th>
                <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, color: "#64748B" }}>Cliente</th>
                <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, color: "#64748B" }}>Categoria</th>
                <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, color: "#64748B" }}>Status</th>
                <th style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, color: "#64748B" }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>Nenhum pedido encontrado.</td></tr>
              ) : services.map((s: any) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600 }}>{s.title}</td>
                  <td style={{ padding: "14px 16px", color: "#64748B" }}>{s.client?.name}</td>
                  <td style={{ padding: "14px 16px", color: "#64748B" }}>{s.category?.name ?? "—"}</td>
                  <td style={{ padding: "14px 16px" }}><StatusBadge status={s.status} /></td>
                  <td style={{ padding: "14px 16px", color: "#64748B" }}>{new Date(s.createdAt).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16, fontSize: 13, color: "#64748B" }}>
            Página {page} de {totalPages}
          </div>
        )}
      </main>
    </>
  );
}
