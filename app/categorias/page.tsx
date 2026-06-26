import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Categorias de serviço",
  description: "Veja todas as categorias de serviços disponíveis no SOS Serviços.",
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">
          Categorias de serviço
        </h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorias/${cat.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
