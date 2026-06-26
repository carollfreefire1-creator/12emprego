const COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  pending:   { bg: "#FEF3C7", fg: "#92400E", label: "Pendente" },
  approved:  { bg: "#DCFCE7", fg: "#166534", label: "Aprovado" },
  rejected:  { bg: "#FEE2E2", fg: "#991B1B", label: "Rejeitado" },
  active:    { bg: "#DCFCE7", fg: "#166534", label: "Ativo" },
  blocked:   { bg: "#FEE2E2", fg: "#991B1B", label: "Bloqueado" },
  paid:      { bg: "#DCFCE7", fg: "#166534", label: "Pago" },
  refunded:  { bg: "#E0E7FF", fg: "#3730A3", label: "Reembolsado" },
  failed:    { bg: "#FEE2E2", fg: "#991B1B", label: "Falhou" },
  completed: { bg: "#DCFCE7", fg: "#166534", label: "Concluído" },
  cancelled: { bg: "#F1F5F9", fg: "#475569", label: "Cancelado" },
  in_progress: { bg: "#DBEAFE", fg: "#1E40AF", label: "Em andamento" },
  rewarded:  { bg: "#DCFCE7", fg: "#166534", label: "Recompensado" },
  expired:   { bg: "#F1F5F9", fg: "#475569", label: "Expirado" },
  admin:     { bg: "#EDE9FE", fg: "#5B21B6", label: "Admin" },
  professional: { bg: "#DBEAFE", fg: "#1E40AF", label: "Profissional" },
  user:      { bg: "#F1F5F9", fg: "#475569", label: "Usuário" },
};

export default function StatusBadge({ status }: { status: string }) {
  const c = COLORS[status] ?? { bg: "#F1F5F9", fg: "#475569", label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "4px 10px",
      borderRadius: 999, fontSize: 12, fontWeight: 700, background: c.bg, color: c.fg,
      whiteSpace: "nowrap",
    }}>
      {c.label}
    </span>
  );
}
