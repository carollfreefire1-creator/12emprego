"use client";

import { useEffect, useState } from "react";

const CONSENT_COOKIE = "sos-consent";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!getCookie(CONSENT_COOKIE)) setVisible(true);
  }, []);

  async function persistChoice(marketingOptIn: boolean) {
    setCookie(CONSENT_COOKIE, marketingOptIn ? "all" : "essential");
    setVisible(false);
    try {
      await fetch("/api/lgpd/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketingOptIn }),
      });
    } catch {
      // Usuário pode não estar autenticado ainda — o cookie local já basta para fins de UX
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-5">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          <p>
            Usamos cookies para melhorar sua experiência, conforme nossa{" "}
            <a href="/privacidade" className="font-medium underline">
              Política de Privacidade
            </a>{" "}
            (LGPD).
          </p>
          {expanded && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Cookies essenciais mantêm o funcionamento do site e não podem ser desativados.
              Cookies de marketing nos ajudam a entender como você usa o serviço; você pode
              recusá-los sem perder acesso a nenhuma funcionalidade.
            </p>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-xs font-medium text-blue-600 underline dark:text-blue-400"
          >
            {expanded ? "Ver menos" : "Saiba mais"}
          </button>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => persistChoice(false)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Apenas essenciais
          </button>
          <button
            onClick={() => persistChoice(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  );
}
