"use client";

import { useState } from "react";
import { honeypotFieldName, isHoneypotTriggered } from "@/lib/anti-spam";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error" | "rate_limited">("idle");
  const [renderedAt] = useState(() => Date.now());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (isHoneypotTriggered(formData)) {
      setStatus("sent"); // resposta neutra para não revelar a detecção ao bot
      return;
    }

    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, renderedAt }),
      });

      if (res.status === 429) {
        setStatus("rate_limited");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
        Mensagem enviada! Responderemos em breve.
      </div>
    );
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

      <input
        required
        placeholder="Seu nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
      />
      <input
        required
        type="email"
        placeholder="Seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
      />
      <textarea
        required
        rows={5}
        maxLength={1000}
        placeholder="Sua mensagem"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
      />

      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Não foi possível enviar. Tente novamente.
        </p>
      )}
      {status === "rate_limited" && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Muitas mensagens enviadas. Aguarde um pouco.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
      >
        {loading ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
