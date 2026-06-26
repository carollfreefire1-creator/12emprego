type Props = {
  label: string;
  value: string;
  icon: string;
  trend?: { value: number; positive: boolean };
  accent?: string;
};

export default function StatCard({ label, value, icon, trend, accent = "#38BDF8" }: Props) {
  return (
    <div style={{
      background: "#FFFFFF", borderRadius: 14, padding: 20, border: "1px solid #E2E8F0",
      display: "flex", flexDirection: "column", gap: 10, minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>{label}</span>
        <div style={{
          width: 34, height: 34, borderRadius: 9, background: `${accent}1A`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#0F172A" }}>{value}</div>
      {trend && (
        <div style={{ fontSize: 12, fontWeight: 600, color: trend.positive ? "#16A34A" : "#DC2626" }}>
          {trend.positive ? "▲" : "▼"} {Math.abs(trend.value)}% vs mês anterior
        </div>
      )}
    </div>
  );
}
