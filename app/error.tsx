"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 text-5xl">⚠️</div>
      <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
        Algo deu errado
      </h1>
      <p className="mb-6 max-w-md text-sm text-slate-500 dark:text-slate-400">
        Ocorreu um erro inesperado ao carregar esta página. Nossa equipe já foi notificada.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"
        >
          Tentar novamente
        </button>
        <a
          href="/"
          className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Voltar ao início
        </a>
      </div>
      {error.digest && (
        <p className="mt-4 text-xs text-slate-400">Código: {error.digest}</p>
      )}
    </div>
  );
}
