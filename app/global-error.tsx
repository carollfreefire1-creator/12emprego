"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            padding: 24,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Erro crítico na aplicação
          </h1>
          <p style={{ color: "#64748B", marginBottom: 24, maxWidth: 420 }}>
            Não foi possível carregar o SOS Serviços. Tente recarregar a página.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "#0F172A",
              color: "#FFF",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Recarregar
          </button>
        </div>
      </body>
    </html>
  );
}
