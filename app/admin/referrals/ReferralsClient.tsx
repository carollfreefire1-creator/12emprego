"use client";

import { useEffect, useState } from "react";
import { listReferralsAction } from "@/actions/admin";
import StatusBadge from "@/components/admin/StatusBadge";

export default function ReferralsClient() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listReferralsAction().then((res) => {
      if (res.success) setRewards(res.data!);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 20, color: "#94A3B8" }}>Carregando...</div>;

  return (
    <div style={{ background: "#FFF", border: "1px solid #E2E8F0", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.3fr 1fr 1fr 1fr", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "#94A3B8", borderBottom: "1px solid #E2E8F0" }}>
        <span>Quem indicou</span><span>Indicado</span><span>Recompensa</span><span>Status</span><span>Data</span>
      </div>
      {rewards.length === 0 ? (
        <div style={{ padding: 30, textAlign: "center", color: "#94A3B8" }}>Nenhuma indicação registrada.</div>
      ) : rewards.map((r) => (
        <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1.3fr 1.3fr 1fr 1fr 1fr", padding: "12px 16px", fontSize: 13, borderBottom: "1px solid #F1F5F9", alignItems: "center" }}>
          <span>{r.referrer?.name} <span style={{ color: "#94A3B8" }}>({r.referrer?.email})</span></span>
          <span>{r.referred?.name} <span style={{ color: "#94A3B8" }}>({r.referred?.email})</span></span>
          <span>R$ {(r.rewardCents / 100).toFixed(2)}</span>
          <span><StatusBadge status={r.status} /></span>
          <span style={{ color: "#64748B" }}>{new Date(r.createdAt).toLocaleDateString("pt-BR")}</span>
        </div>
      ))}
    </div>
  );
}
