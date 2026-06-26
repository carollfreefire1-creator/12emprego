import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Meus pedidos",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  open: "Aberto",
  proposed: "Com propostas",
  accepted: "Aceito",
  in_progress: "Em andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export default async function MyRequestsPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { email: authUser.email! } });
  if (!dbUser) redirect("/login");

  const requests = await prisma.serviceRequest.findMany({
    where: { clientId: dbUser.id },
    include: { category: true, _count: { select: { proposals: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meus pedidos</h1>
        <Link
          href="/solicitar"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
        >
          + Novo pedido
        </Link>
      </div>

      {requests.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">
          Você ainda não fez nenhum pedido. Que tal solicitar seu primeiro serviço?
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">{req.title}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {STATUS_LABEL[req.status] ?? req.status}
                </span>
              </div>
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                {req.category.icon} {req.category.name}
              </p>
              <p className="text-xs text-slate-400">
                {req._count.proposals} proposta(s) recebida(s)
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
