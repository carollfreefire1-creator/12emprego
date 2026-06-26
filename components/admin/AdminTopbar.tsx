"use client";

import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

type Props = {
  title: string;
  admin: { name: string; email: string; avatarUrl: string | null };
};

export default function AdminTopbar({ title, admin }: Props) {
  const router = useRouter();

  return (
    <header style={{
      height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", borderBottom: "1px solid #E2E8F0", background: "#FFFFFF",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <h1 style={{ fontSize: 19, fontWeight: 700, color: "#0F172A", margin: 0 }}>{title}</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => router.push("/")}
          style={{
            fontSize: 13, fontWeight: 600, color: "#475569", background: "#F1F5F9",
            border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer",
          }}
        >
          ← Voltar ao site
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", background: "#38BDF8",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#FFF", fontWeight: 700, fontSize: 14, overflow: "hidden",
          }}>
            {admin.avatarUrl
              ? <img src={admin.avatarUrl} alt={admin.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : admin.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{admin.name}</div>
        </div>
        <LogoutButton className="text-xs font-semibold text-slate-500">
          Sair
        </LogoutButton>
      </div>
    </header>
  );
}
