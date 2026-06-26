import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "Minha conta",
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/conta/pedidos", label: "Meus pedidos", icon: "📋" },
  { href: "/conta/indicacoes", label: "Indique e ganhe", icon: "🔗" },
  { href: "/conta/privacidade", label: "Privacidade e dados", icon: "🔒" },
];

export default async function AccountHomePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { email: authUser.email! } });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
        Olá, {dbUser?.name?.split(" ")[0] ?? "tudo bem"}
      </h1>
      <p className="mb-8 text-slate-500 dark:text-slate-400">{authUser.email}</p>

      <div className="space-y-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800"
          >
            <span className="text-xl">{link.icon}</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">{link.label}</span>
          </Link>
        ))}
      </div>

      <LogoutButton className="mt-6 w-full rounded-xl border border-red-200 p-4 text-center font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950">
        Sair da conta
      </LogoutButton>
    </main>
  );
}
