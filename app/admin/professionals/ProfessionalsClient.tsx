"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  listProfessionalsAction, approveProfessionalAction,
  rejectProfessionalAction, blockProfessionalAction,
} from "@/actions/admin";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export default function ProfessionalsClient() {
  const searchParams = useSearchParams();
  const [pros, setPros] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listProfessionalsAction({ search, status: status || undefined, page });
    if (res.success) {
      setPros(res.data!.professionals);
      setTotal(res.data!.total);
    }
    setLoading(false);
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(id: string) {
    await approveProfessionalAction(id);
    load();
  }

  async function handleReject() {
    if (!rejectTarget) return;
    setActionLoading(true);
    await rejectProfessionalAction(rejectTarget.id, rejectReason || "Não atende aos requisitos");
    setActionLoading(false);
    setRejectTarget(null);
    setRejectReason("");
    load();
  }

  async function handleBlock(p: any) {
    await blockProfessionalAction(p.id, p.userId, !p.user.blocked);
    load();
  }

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <>
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
          <option value="pending">Pendente</option>
          <option value="approved">Aprovado</option>
          <option value="rejected">Rejeitado</option>
        </select>
      </div>

      <DataTable
        columns={[
          {
            key: "name", header: "Profissional",
            render: (p: any) => (
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.user.name}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>{p.user.email}</div>
              </div>
            ),
          },
          { key: "category", header: "Categoria", render: (p: any) => p.category ?? "—" },
          { key: "status", header: "Aprovação", render: (p: any) => <StatusBadge status={p.approvalStatus} /> },
          { key: "blocked", header: "Conta", render: (p: any) => <StatusBadge status={p.user.blocked ? "blocked" : "active"} /> },
          {
            key: "actions", header: "Ações",
            render: (p: any) => (
              <div style={{ display: "flex", gap: 6 }}>
                {p.approvalStatus !== "approved" && (
                  <button
                    onClick={() => handleApprove(p.id)}
                    style={{ padding: "6px 10px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 700, background: "#DCFCE7", color: "#166534", cursor: "pointer" }}
                  >
                    Aprovar
                  </button>
                )}
                {p.approvalStatus !== "rejected" && (
                  <button
                    onClick={() => setRejectTarget(p)}
                    style={{ padding: "6px 10px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 700, background: "#FEF3C7", color: "#92400E", cursor: "pointer" }}
                  >
                    Rejeitar
                  </button>
                )}
                <button
                  onClick={() => handleBlock(p)}
                  style={{ padding: "6px 10px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 700, background: p.user.blocked ? "#DBEAFE" : "#FEE2E2", color: p.user.blocked ? "#1E40AF" : "#991B1B", cursor: "pointer" }}
                >
                  {p.user.blocked ? "Desbloquear" : "Bloquear"}
                </button>
              </div>
            ),
          },
        ]}
        rows={loading ? [] : pros}
        emptyMessage={loading ? "Carregando..." : "Nenhum profissional encontrado."}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!rejectTarget}
        title="Rejeitar profissional"
        message="Informe o motivo da rejeição (opcional):"
        confirmLabel="Rejeitar"
        danger
        loading={actionLoading}
        onConfirm={handleReject}
        onCancel={() => { setRejectTarget(null); setRejectReason(""); }}
      />
    </>
  );
}
