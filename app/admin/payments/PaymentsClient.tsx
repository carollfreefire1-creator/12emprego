"use client";

import { useEffect, useState, useCallback } from "react";
import { listPaymentsAction, refundPaymentAction } from "@/actions/admin";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import StatCard from "@/components/admin/StatCard";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export default function PaymentsClient() {
  const [payments, setPayments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalCents, setTotalCents] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refundTarget, setRefundTarget] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listPaymentsAction({ status: status || undefined, search, page });
    if (res.success) {
      setPayments(res.data!.payments);
      setTotal(res.data!.total);
      setTotalCents(res.data!.totalCents);
    }
    setLoading(false);
  }, [status, search, page]);

  useEffect(() => { load(); }, [load]);

  async function handleRefund() {
    if (!refundTarget) return;
    await refundPaymentAction(refundTarget.id);
    setRefundTarget(null);
    load();
  }

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <>
      <div style={{ marginBottom: 20, maxWidth: 260 }}>
        <StatCard label="Total recebido" value={`R$ ${(totalCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} icon="💰" accent="#34D399" />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <input
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, minWidth: 220, padding: "10px 14px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14 }}
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14 }}
        >
          <option value="">Todos os status</option>
          <option value="paid">Pago</option>
          <option value="pending">Pendente</option>
          <option value="failed">Falhou</option>
          <option value="refunded">Reembolsado</option>
        </select>
      </div>

      <DataTable
        columns={[
          {
            key: "user", header: "Cliente",
            render: (p: any) => (
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.user.name}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>{p.user.email}</div>
              </div>
            ),
          },
          {
            key: "amount", header: "Valor",
            render: (p: any) => `R$ ${(p.amountCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          },
          { key: "method", header: "Método", render: (p: any) => p.method ?? "—" },
          { key: "status", header: "Status", render: (p: any) => <StatusBadge status={p.status} /> },
          { key: "date", header: "Data", render: (p: any) => new Date(p.createdAt).toLocaleDateString("pt-BR") },
          {
            key: "actions", header: "",
            render: (p: any) => p.status === "paid" ? (
              <button
                onClick={() => setRefundTarget(p)}
                style={{ padding: "6px 10px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 700, background: "#FEE2E2", color: "#991B1B", cursor: "pointer" }}
              >
                Reembolsar
              </button>
            ) : null,
          },
        ]}
        rows={loading ? [] : payments}
        emptyMessage={loading ? "Carregando..." : "Nenhum pagamento encontrado."}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!refundTarget}
        title="Reembolsar pagamento"
        message={`Reembolsar R$ ${refundTarget ? (refundTarget.amountCents / 100).toFixed(2) : ""} para ${refundTarget?.user.name}?`}
        confirmLabel="Reembolsar"
        danger
        onConfirm={handleRefund}
        onCancel={() => setRefundTarget(null)}
      />
    </>
  );
}
