"use client";

type Props = {
  data: { month: string; cents: number }[];
};

export default function RevenueChart({ data }: Props) {
  const max = Math.max(...data.map((d) => d.cents), 1);

  return (
    <div style={{ background: "#FFFFFF", borderRadius: 14, border: "1px solid #E2E8F0", padding: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 18 }}>
        Receita mensal
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 180 }}>
        {data.map((d) => (
          <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0F172A" }}>
              R$ {(d.cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
            </div>
            <div style={{
              width: "100%", maxWidth: 36,
              height: Math.max((d.cents / max) * 130, 4),
              background: "linear-gradient(180deg, #38BDF8, #0EA5E9)",
              borderRadius: 6,
            }} />
            <div style={{ fontSize: 12, color: "#64748B", textTransform: "capitalize" }}>{d.month}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
