"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { honeypotFieldName, isHoneypotTriggered } from "@/lib/anti-spam";

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export default function RequestForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [budgetCents, setBudgetCents] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderedAt] = useState(() => Date.now());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (isHoneypotTriggered(formData)) {
      setError("Não foi possível enviar sua solicitação.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          title,
          description,
          address,
          budgetCents: budgetCents ? Number(budgetCents) * 100 : undefined,
          renderedAt,
        }),
      });

      if (res.status === 429) {
        setError("Você enviou muitas solicitações. Aguarde um pouco antes de tentar novamente.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Não foi possível enviar sua solicitação.");
        return;
      }

      router.push("/conta/pedidos");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name={honeypotFieldName()}
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Categoria
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Título
        </label>
        <input
          required
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Troca de chuveiro elétrico"
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Descrição
        </label>
        <textarea
          required
          maxLength={1000}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o serviço com detalhes"
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Endereço (opcional)
        </label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Orçamento estimado em R$ (opcional)
        </label>
        <input
          type="number"
          min={0}
          value={budgetCents}
          onChange={(e) => setBudgetCents(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading || !categoryId}
        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
      >
        {loading ? "Enviando..." : "Enviar solicitação"}
      </button>
    </form>
  );
}
