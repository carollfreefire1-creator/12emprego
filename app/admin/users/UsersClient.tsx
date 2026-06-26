"use client";

import { useEffect, useState, useCallback } from "react";
import { listUsersAction, toggleBlockUserAction, changeUserRoleAction } from "@/actions/admin";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

type UserRow = {
  id: string; name: string; email: string; avatarUrl: string | null;
  role: string; blocked: boolean; createdAt: string; phone: string | null;
};

export default function UsersClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState<UserRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listUsersAction({ search, role: role || undefined, page });
    if (res.success) {
      setUsers(res.data!.users as any);
      setTotal(res.data!.total);
    }
    setLoading(false);
  }, [search, role, page]);

  useEffect(() => { load(); }, [load]);

  async function handleToggleBlock() {
    if (!confirmTarget) return;
    setActionLoading(true);
    await toggleBlockUserAction(confirmTarget.id, !confirmTarget.blocked);
    setActionLoading(false);
    setConfirmTarget(null);
    load();
  }

  async function handleRoleChange(userId: string, newRole: string) {
    await changeUserRoleAction(userId, newRole as any);
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
          style={{
            flex: 1, minWidth: 220, padding: "10px 14px", borderRadius: 8,
            border: "1px solid #E2E8F0", fontSize: 14,
          }}
        />
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14 }}
        >
          <option value="">Todos os papéis</option>
          <option value="user">Usuário</option>
          <option value="professional">Profissional</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <DataTable
        columns={[
          {
            key: "name", header: "Usuário",
            render: (u) => (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: "#E2E8F0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 13, color: "#475569", overflow: "hidden", flexShrink: 0,
                }}>
                  {u.avatarUrl ? <img src={u.avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : u.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>{u.email}</div>
                </div>
              </div>
            ),
          },
          {
            key: "role", header: "Papel",
            render: (u) => (
              <select
                defaultValue={u.role}
                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #E2E8F0", fontSize: 13 }}
              >
                <option value="user">Usuário</option>
                <option value="professional">Profissional</option>
                <option value="admin">Admin</option>
              </select>
            ),
          },
          {
            key: "status", header: "Status",
            render: (u) => <StatusBadge status={u.blocked ? "blocked" : "active"} />,
          },
          {
            key: "createdAt", header: "Cadastro",
            render: (u) => new Date(u.createdAt).toLocaleDateString("pt-BR"),
          },
          {
            key: "actions", header: "",
            render: (u) => (
              <button
                onClick={() => setConfirmTarget(u)}
                style={{
                  padding: "6px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 700,
                  background: u.blocked ? "#DCFCE7" : "#FEE2E2",
                  color: u.blocked ? "#166534" : "#991B1B", cursor: "pointer",
                }}
              >
                {u.blocked ? "Desbloquear" : "Bloquear"}
              </button>
            ),
          },
        ]}
        rows={loading ? [] : users}
        emptyMessage={loading ? "Carregando..." : "Nenhum usuário encontrado."}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!confirmTarget}
        title={confirmTarget?.blocked ? "Desbloquear usuário" : "Bloquear usuário"}
        message={`Tem certeza que deseja ${confirmTarget?.blocked ? "desbloquear" : "bloquear"} ${confirmTarget?.name}?`}
        confirmLabel={confirmTarget?.blocked ? "Desbloquear" : "Bloquear"}
        danger={!confirmTarget?.blocked}
        loading={actionLoading}
        onConfirm={handleToggleBlock}
        onCancel={() => setConfirmTarget(null)}
      />
    </>
  );
}
