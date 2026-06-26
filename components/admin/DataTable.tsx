"use client";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function DataTable<T extends { id: string }>({
  columns, rows, emptyMessage = "Nenhum registro encontrado.", page, totalPages, onPageChange,
}: Props<T>) {
  return (
    <div style={{ background: "#FFFFFF", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
              {columns.map((col) => (
                <th key={col.key} style={{
                  textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700,
                  color: "#64748B", textTransform: "uppercase", letterSpacing: 0.4,
                  width: col.width,
                }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: "14px 16px", color: "#1E293B" }}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "14px 16px", borderTop: "1px solid #E2E8F0",
        }}>
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            style={{
              padding: "6px 12px", borderRadius: 6, border: "1px solid #E2E8F0",
              background: "#FFF", cursor: page <= 1 ? "not-allowed" : "pointer",
              opacity: page <= 1 ? 0.4 : 1, fontSize: 13,
            }}
          >
            ‹
          </button>
          <span style={{ fontSize: 13, color: "#475569", padding: "0 8px" }}>
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            style={{
              padding: "6px 12px", borderRadius: 6, border: "1px solid #E2E8F0",
              background: "#FFF", cursor: page >= totalPages ? "not-allowed" : "pointer",
              opacity: page >= totalPages ? 0.4 : 1, fontSize: 13,
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
