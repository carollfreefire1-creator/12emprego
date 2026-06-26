"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/users", label: "Usuários", icon: "👥" },
  { href: "/admin/professionals", label: "Profissionais", icon: "🛠️" },
  { href: "/admin/services", label: "Pedidos", icon: "📋" },
  { href: "/admin/categories", label: "Categorias", icon: "🗂️" },
  { href: "/admin/coupons", label: "Cupons", icon: "🏷️" },
  { href: "/admin/referrals", label: "Indicações", icon: "🔗" },
  { href: "/admin/payments", label: "Pagamentos", icon: "💳" },
  { href: "/admin/security", label: "Segurança", icon: "🛡️" },
  { href: "/admin/reports", label: "Relatórios", icon: "📈" },
  { href: "/admin/settings", label: "Configurações", icon: "⚙️" },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div style={{ padding: "22px 20px", borderBottom: "1px solid #1E293B" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#FFFFFF", letterSpacing: 0.3 }}>
          SOS <span style={{ color: "#38BDF8" }}>Admin</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {NAV.map((item) => {
          const active = pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8, marginBottom: 2,
                fontSize: 14, fontWeight: active ? 700 : 500,
                color: active ? "#FFFFFF" : "#94A3B8",
                background: active ? "#1E293B" : "transparent",
                textDecoration: "none",
                borderLeft: active ? "3px solid #38BDF8" : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: 16, borderTop: "1px solid #1E293B", fontSize: 11, color: "#64748B" }}>
        SOS Serviços © {new Date().getFullYear()}
      </div>
    </>
  );
}

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Topbar mobile com botão de menu — visível apenas abaixo de lg */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0F172A] px-4 py-3 lg:hidden">
        <span style={{ fontSize: 16, fontWeight: 800, color: "#FFFFFF" }}>
          SOS <span style={{ color: "#38BDF8" }}>Admin</span>
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu administrativo"
          style={{ color: "#E2E8F0", background: "transparent", border: "none", padding: 6 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90 }}
          onClick={() => setMobileOpen(false)}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 260, height: "100vh", background: "#0F172A",
              color: "#E2E8F0", display: "flex", flexDirection: "column",
            }}
          >
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Sidebar fixa — visível a partir de lg */}
      <aside
        className="hidden lg:flex"
        style={{
          width: 240, flexShrink: 0, height: "100vh", background: "#0F172A",
          color: "#E2E8F0", flexDirection: "column",
          position: "sticky", top: 0,
        }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
