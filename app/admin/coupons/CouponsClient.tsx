"use client";

import { useEffect, useState } from "react";
import { listCouponsAction, saveCouponAction, deleteCouponAction } from "@/actions/admin";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

const empty = {
  code: "",
  type: "percent" as "percent" | "fixed",
  value: 10,
  maxUses: "",
  minAmountCents: "",
  expiresAt: "",
  active: true,
};

export default function CouponsClient() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  async function load() {
    setLoading(true);
    const res = await listCouponsAction();
    if (res.success) setCoupons(res.data!);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(coupon?: any) {
    if (coupon) {
      setEditing(coupon);
      setForm({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        maxUses: coupon.maxUses?.toString() ?? "",
        minAmountCents: coupon.minAmountCents?.toString() ?? "",
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 10) : "",
        active: coupon.active,
      });
    } else {
      setEditing({});
      setForm(empty);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await saveCouponAction({
      id: editing?.id,
      code: form.code,
      type: form.type,
      value: Number(form.value),
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      minAmountCents: form.minAmountCents ? Number(form.minAmountCents) : null,
      expiresAt: form.expiresAt || null,
      active: form.active,
    });
    setEditing(null);
    load();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteCouponAction(deleteTarget.id);
    setDeleteTarget(null);
    load();
  }

  if (loading) return <div style={{ padding: 20, color: "#94A3B8" }}>Carregando...</div>;

  return (
    <>
      <button
        onClick={() => startEdit()}
        style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 8, border: "none", background: "#0F172A", color: "#FFF", fontWeight: 600, cursor: "pointer" }}
      >
        + Novo cupom
      </button>

      <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 100px", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#94A3B8", borderBottom: "1px solid #E2E8F0" }}>
          <span>Código</span><span>Tipo</span><span>Valor</span><span>Usos</span><span>Status</span><span></span>
        </div>
        {coupons.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#94A3B8" }}>Nenhum cupom cadastrado.</div>
        ) : coupons.map((c) => (
          <div key={c.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 100px", padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #F1F5F9", alignItems: "center" }}>
            <span style={{ fontWeight: 700 }}>{c.code}</span>
            <span>{c.type === "percent" ? "Percentual" : "Valor fixo"}</span>
            <span>{c.type === "percent" ? `${c.value}%` : `R$ ${(c.value / 100).toFixed(2)}`}</span>
            <span>{c._count?.redemptions ?? 0}{c.maxUses ? ` / ${c.maxUses}` : ""}</span>
            <span style={{ fontWeight: 700, color: c.active ? "#166534" : "#94A3B8" }}>{c.active ? "Ativo" : "Inativo"}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => startEdit(c)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #E2E8F0", background: "#FFF", fontSize: 12, cursor: "pointer" }}>Editar</button>
              <button onClick={() => setDeleteTarget(c)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #FECACA", background: "#FFF", color: "#DC2626", fontSize: 12, cursor: "pointer" }}>Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <form onSubmit={handleSave} style={{ background: "#FFF", borderRadius: 14, padding: 24, width: 420, maxWidth: "90vw" }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>{editing.id ? "Editar cupom" : "Novo cupom"}</div>
            <input placeholder="CÓDIGO" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 8, border: "1px solid #E2E8F0", textTransform: "uppercase" }} />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 8, border: "1px solid #E2E8F0" }}>
              <option value="percent">Percentual (%)</option>
              <option value="fixed">Valor fixo (centavos)</option>
            </select>
            <input type="number" placeholder="Valor" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 8, border: "1px solid #E2E8F0" }} />
            <input type="number" placeholder="Máx. de usos (vazio = ilimitado)" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 8, border: "1px solid #E2E8F0" }} />
            <input type="number" placeholder="Valor mínimo em centavos" value={form.minAmountCents} onChange={(e) => setForm({ ...form, minAmountCents: e.target.value })} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 8, border: "1px solid #E2E8F0" }} />
            <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 8, border: "1px solid #E2E8F0" }} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 14 }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Cupom ativo
            </label>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setEditing(null)} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#FFF", cursor: "pointer" }}>Cancelar</button>
              <button type="submit" style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#0F172A", color: "#FFF", fontWeight: 600, cursor: "pointer" }}>Salvar</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir cupom?"
        message={`O cupom "${deleteTarget?.code}" será removido permanentemente.`}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
