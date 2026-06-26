import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RequestForm from "./RequestForm";

export const metadata: Metadata = {
  title: "Solicitar serviço",
  description: "Descreva o que você precisa e receba propostas de profissionais perto de você.",
};

export default async function RequestServicePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/login?next=/solicitar");

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          Solicitar um serviço
        </h1>
        <p className="mb-8 text-slate-500 dark:text-slate-400">
          Conte o que você precisa. É grátis e você recebe propostas de profissionais da região.
        </p>
        <RequestForm categories={categories} />
      </main>
      <Footer />
    </>
  );
}
