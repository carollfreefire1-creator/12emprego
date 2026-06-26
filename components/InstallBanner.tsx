"use client";

import { useState } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export default function InstallBanner() {
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || installed || dismissed) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800 sm:left-auto sm:right-4 sm:w-80">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Instalar o app</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Acesso rápido direto na sua tela inicial.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          Depois
        </button>
        <button
          onClick={promptInstall}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          Instalar
        </button>
      </div>
    </div>
  );
}
