"use client";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function ConfirmDialog({
  open, title, message, confirmLabel = "Confirmar", danger, onConfirm, onCancel, loading,
}: Props) {
  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
    }}>
      <div style={{
        background: "#FFF", borderRadius: 14, padding: 24, width: 380, maxWidth: "90vw",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14, color: "#475569", marginBottom: 22, lineHeight: 1.5 }}>{message}</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "10px 16px", borderRadius: 8, border: "1px solid #E2E8F0",
              background: "#FFF", fontSize: 14, fontWeight: 600, color: "#475569", cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "10px 16px", borderRadius: 8, border: "none",
              background: danger ? "#DC2626" : "#0F172A", color: "#FFF",
              fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
