import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getReferralStats, buildReferralLink } from "@/lib/referral";
import { formatCurrency } from "@/lib/utils";
import { redirect } from "next/navigation";
import ReferralShareClient from "./ReferralShareClient";

export const metadata: Metadata = {
  title: "Indique e ganhe | SOS Serviços",
};

export default async function ReferralPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { email: authUser.email! } });
  if (!dbUser) redirect("/login");

  const stats = await getReferralStats(dbUser.id);
  const link = buildReferralLink(dbUser.referralCode);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Indique e ganhe</h1>
      <p className="mb-8 text-slate-500 dark:text-slate-400">
        Compartilhe seu link e ganhe R$ 20,00 em crédito quando seu indicado completar o primeiro serviço.
      </p>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalReferred}</div>
          <div className="text-xs text-slate-500">Indicados</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingCount}</div>
          <div className="text-xs text-slate-500">Pendentes</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800">
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(stats.totalRewardedCents)}
          </div>
          <div className="text-xs text-slate-500">Ganhos</div>
        </div>
      </div>

      <ReferralShareClient link={link} code={dbUser.referralCode} />
    </main>
  );
}
