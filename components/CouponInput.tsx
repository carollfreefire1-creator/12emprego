"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  amountCents: number;
  onApplied: (discountCents: number, couponId: string) => void;
  onRemoved: () => void;
}

export default function CouponInput({ amountCents, onApplied, onRemoved }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<{ code: string; discountCents: number } | null>(null);

  async function handleApply() {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), amountCents }),
      });
      const data = await res.json();
      if (!data.valid) {
        setError(data.reason || "Cupom inválido.");
        return;
      }
      setApplied({ code: data.coupon.code, discountCents: data.discountCents });
      onApplied(data.discountCents, data.coupon.id);
    } catch {
      setError("Erro ao validar o cupom. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    setApplied(null);
    setCode("");
    onRemoved();
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm dark:border-emerald-900 dark:bg-emerald-950">
        <span className="font-medium text-emerald-700 dark:text-emerald-300">
          Cupom {applied.code} aplicado: -{formatCurrency(applied.discountCents)}
        </span>
        <button onClick={handleRemove} className="text-emerald-700 underline dark:text-emerald-300">
          Remover
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Código do cupom"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm uppercase dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
        >
          {loading ? "Aplicando..." : "Aplicar"}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
