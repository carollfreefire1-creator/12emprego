"use client";

import { useEffect, useState } from "react";
import {
  listCategoriesAction, createCategoryAction,
  updateCategoryAction, deleteCategoryAction,
} from "@/actions/admin";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function CategoriesClient() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  async function load() {
    setLoading(true);
    const res = await listCategoriesAction();
    if (res.success) setCategories(res.data!);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    if (editing) {
      await updateCategoryAction(editing.id, { name, icon, slug: slugify(name) });
    } else {
      await createCategoryAction({ name, icon, slug: slugify(name), orderIndex: categories.length });
    }
    setName(""); setIcon(""); setEditing(null);
    load();
  }

  async function toggleActive(c: any) {
    await updateCategoryAction(c.id, { active: !c.active });
    load();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteCategoryAction(deleteTarget.id);
    setDeleteTarget(null);
    load();
  }

  return (
    <>
      <form onSubmit={handleSubmit} style={{
        display: "flex", gap: 10, marginBottom: 20, background: "#FFF",
        border: "1px solid #E2E8F0", borderRadius: 12, padding: 16,
      }}>
        <input
          placeholder="Ícone (emoji)"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          style={{ width: 90, padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14 }}
        />
        <input
          placeholder="Nome da categoria"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 14 }}
        />
        <button type="submit" style={{
          padding: "10px 18px", borderRadius: 8, border: "none", background: "#0F172A",
          color: "#FFF", fontWeight: 600, fontSize: 14, cursor: "pointer",
        }}>
          {editing ? "Salvar" : "Adicionar"}
        </button>
        {editing && (
          <button type="button" onClick={() => { setEditing(null); setName(""); setIcon(""); }} style={{
            padding: "10px 14px", borderRadius: 8, border: "1px solid #E2E8F0",
            background: "#FFF", fontSize: 14, cursor: "pointer",
          }}>
            Cancelar
          </button>
        )}
      </form>

      <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 30, textAlign: "center", color: "#94A3B8" }}>Carregando...</div>
        ) : categories.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#94A3B8" }}>Nenhuma categoria cadastrada.</div>
        ) : (
          categories.map((c) => (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", borderBottom: "1px solid #F1F5F9",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: c.active ? "#0F172A" : "#94A3B8" }}>{c.name}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => toggleActive(c)}
                  style={{
                    padding: "6px 10px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 700,
                    background: c.active ? "#DCFCE7" : "#F1F5F9", color: c.active ? "#166534" : "#64748B", cursor: "pointer",
                  }}
                >
                  {c.active ? "Ativa" : "Inativa"}
                </button>
                <button
                  onClick={() => { setEditing(c); setName(c.name); setIcon(c.icon ?? ""); }}
                  style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #E2E8F0", background: "#FFF", fontSize: 12, cursor: "pointer" }}
                >
                  Editar
                </button>
                <button
                  onClick={() => setDeleteTarget(c)}
                  style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "#FEE2E2", color: "#991B1B", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir categoria"
        message={`Excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
