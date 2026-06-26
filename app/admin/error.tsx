"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin-error]", error);
  }, [error]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
        Erro ao carregar o painel administrativo
      </h2>
      <p style={{ color: "#64748B", marginBottom: 20 }}>{error.message || "Erro desconhecido."}</p>
      <button
        onClick={reset}
        style={{
          padding: "10px 18px",
          borderRadius: 8,
          border: "none",
          background: "#0F172A",
          color: "#FFF",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
