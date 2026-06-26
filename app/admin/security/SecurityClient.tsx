"use client";

import { useEffect, useState } from "react";
import { getFlaggedRequestLogsAction } from "@/actions/admin";

export default function SecurityClient() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFlaggedRequestLogsAction().then((l) => {
      if (l.success) setLogs(l.data!);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 20, color: "#94A3B8" }}>Carregando...</div>;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20 }}>
          <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 6 }}>Requisições suspeitas</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: logs.length > 0 ? "#DC2626" : "#0F172A" }}>{logs.length}</div>
        </div>
      </div>

      <div style={{ fontWeight: 700, marginBottom: 12 }}>Requisições marcadas (rate limit / anti-spam)</div>
      <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 14, overflow: "hidden" }}>
        {logs.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#94A3B8" }}>Nenhuma atividade suspeita registrada.</div>
        ) : logs.map((l) => (
          <div key={l.id} style={{ padding: "12px 16px", borderBottom: "1px solid #F1F5F9", fontSize: 13 }}>
            <span style={{ fontWeight: 700 }}>{l.method} {l.path}</span>
            <span style={{ color: "#64748B" }}> · IP {l.ip} · {new Date(l.createdAt).toLocaleString("pt-BR")}</span>
          </div>
        ))}
      </div>
    </>
  );
}
