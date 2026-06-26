"use client";

import { useState } from "react";

export default function ReferralShareClient({ link, code }: { link: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: "SOS Serviços",
        text: `Use meu código ${code} e ganhe vantagens no SOS Serviços!`,
        url: link,
      });
    } else {
      handleCopy();
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Seu link de indicação
      </label>
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        />
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700"
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
      <button
        onClick={handleShare}
        className="mt-3 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
      >
        Compartilhar
      </button>
    </div>
  );
}
