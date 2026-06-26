"use client";

import { useEffect, useState } from "react";
import { listPlansAction, savePlanAction, getAdminLogsAction } from "@/actions/admin";

export default function SettingsClient() {
  const [plans, setPlans] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", priceCents: 0, interval: "month", features: "", active: true });
  const [tab, setTab] = useState<"plans" | "logs">("plans");

  async function load() {
    const [p, l] = await Promise.all([listPlansAction(), getAdminLogsAction()]);
    if (p.success) setPlans(p.data!);
    if (l.success) setLogs(l.data!.logs);
  }

  useEffect(() => { load(); }, []);

  function startEdit(plan?: any) {
    if (plan) {
      setEditing(plan);
      setForm({
        name: plan.name, priceCents: plan.priceCents, interval: plan.interval,
        features: (plan.features as string[]).join("\n"), active: plan.active,
      });
    } else {
      setEditing({});
      setForm({ name: "", priceCents: 0, interval: "month", features: "", active: true });
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await savePlanAction({
      id: editing?.id,
      name: form.name,
      priceCents: Number(form.priceCents),
      interval: form.interval,
      features: form.features.split("\n").filter(Boolean),
      active: form.active,
    });
    setEditing(null);
    load();
  }

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["plans", "logs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 600,
              background: tab === t ? "#0F172A" : "#F1F5F9", color: tab === t ? "#FFF" : "#475569", cursor: "pointer",
            }}
          >
            {t === "plans" ? "Planos" : "Logs de auditoria"}
          </button>
        ))}
      </div>

      {tab === "plans" && (
        <>
          <button onClick={() => startEdit()} style={{ marginBottom: 16, padding: "10px 16px", borderRadius: 8, border: "none", background: "#0F172A", color: "#FFF", fontWeight: 600, cursor: "pointer" }}>
            + Novo plano
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 16 }}>
            {plans.map((p) => (
              <div key={p.id} style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: p.active ? "#166534" : "#94A3B8" }}>
                    {p.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
                  R$ {(p.priceCents / 100).toFixed(2)}<span style={{ fontSize: 13, color: "#64748B" }}>/{p.interval === "month" ? "mês" : p.interval}</span>
                </div>
                <ul style={{ fontSize: 13, color: "#475569", marginBottom: 14, paddingLeft: 18 }}>
                  {(p.features as string[]).map((f, i) => <li key={i}>{f}</li>)}
                </ul>
                <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 10 }}>
                  {p._count?.subscriptions ?? 0} assinante(s)
                </div>
                <button onClick={() => startEdit(p)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#FFF", fontSize: 13, cursor: "pointer" }}>
                  Editar
                </button>
              </div>
            ))}
          </div>

          {editing && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
              <form onSubmit={handleSave} style={{ background: "#FFF", borderRadius: 14, padding: 24, width: 420, maxWidth: "90vw" }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>{editing.id ? "Editar plano" : "Novo plano"}</div>
                <input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 8, border: "1px solid #E2E8F0" }} />
                <input type="number" placeholder="Preço em centavos" value={form.priceCents} onChange={(e) => setForm({ ...form, priceCents: Number(e.target.value) })} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 8, border: "1px solid #E2E8F0" }} />
                <textarea placeholder="Recursos (um por linha)" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 8, border: "1px solid #E2E8F0" }} />
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 14 }}>
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  Plano ativo
                </label>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setEditing(null)} style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #E2E8F0", background: "#FFF", cursor: "pointer" }}>Cancelar</button>
                  <button type="submit" style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#0F172A", color: "#FFF", fontWeight: 600, cursor: "pointer" }}>Salvar</button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {tab === "logs" && (
        <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 14, overflow: "hidden" }}>
          {logs.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "#94A3B8" }}>Nenhum log registrado.</div>
          ) : logs.map((l) => (
            <div key={l.id} style={{ padding: "12px 16px", borderBottom: "1px solid #F1F5F9", fontSize: 13 }}>
              <span style={{ fontWeight: 700 }}>{l.action}</span>
              <span style={{ color: "#64748B" }}> · {l.targetType} · {new Date(l.createdAt).toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
