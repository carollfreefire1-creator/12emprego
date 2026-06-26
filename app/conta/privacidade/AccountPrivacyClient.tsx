"use client";

import { useState } from "react";

export default function AccountPrivacyClient() {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleExport() {
    const res = await fetch("/api/lgpd/export");
    if (!res.ok) {
      setMessage("Não foi possível exportar seus dados agora.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meus-dados-sos-servicos.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch("/api/lgpd/delete-account", { method: "POST" });
      const data = await res.json();
      setMessage(data.message || "Solicitação registrada.");
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="mb-1 font-semibold text-slate-900 dark:text-white">Exportar meus dados</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Baixe uma cópia de todos os dados que armazenamos sobre você, conforme a LGPD.
        </p>
        <button
          onClick={handleExport}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700"
        >
          Baixar meus dados (.json)
        </button>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950">
        <h2 className="mb-1 font-semibold text-red-800 dark:text-red-300">Excluir minha conta</h2>
        <p className="mb-4 text-sm text-red-700 dark:text-red-400">
          Seus dados pessoais serão anonimizados em até 15 dias. Esta ação não pode ser desfeita.
        </p>
        {!confirmOpen ? (
          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Solicitar exclusão de conta
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-red-800 dark:text-red-300">Tem certeza?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "Processando..." : "Sim, excluir"}
            </button>
            <button
              onClick={() => setConfirmOpen(false)}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {message && (
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          {message}
        </p>
      )}
    </div>
  );
}
