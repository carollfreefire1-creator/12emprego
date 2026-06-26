"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { honeypotFieldName, isHoneypotTriggered, isDisposableEmail } from "@/lib/anti-spam";

interface Props {
  referralCode?: string;
  defaultRole: "user" | "professional";
}

export default function SignupForm({ referralCode, defaultRole }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (isHoneypotTriggered(formData)) {
      setError("Não foi possível concluir o cadastro.");
      return;
    }
    if (isDisposableEmail(email)) {
      setError("Por favor, use um e-mail permanente.");
      return;
    }
    if (!acceptedTerms) {
      setError("É necessário aceitar os Termos de Uso e a Política de Privacidade.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (authError) {
      setLoading(false);
      setError(
        authError.message.includes("already")
          ? "Este e-mail já está cadastrado."
          : "Não foi possível criar sua conta. Tente novamente."
      );
      return;
    }

    // Cria o usuário na nossa base e processa indicação/role inicial.
    if (data.user) {
      await fetch("/api/auth/complete-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role: defaultRole,
          referralCode,
          marketingOptIn,
        }),
      }).catch(() => {});
    }

    setLoading(false);
    router.push("/conta");
    router.refresh();
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
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>

      <label className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Li e aceito os{" "}
          <a href="/termos" className="underline">Termos de Uso</a> e a{" "}
          <a href="/privacidade" className="underline">Política de Privacidade</a>.
        </span>
      </label>

      <label className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(e) => setMarketingOptIn(e.target.checked)}
          className="mt-0.5"
        />
        <span>Quero receber novidades e promoções por e-mail.</span>
      </label>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
      >
        {loading ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
