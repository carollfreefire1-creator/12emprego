import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

async function getCategories() {
  try {
    return await prisma.category.findMany({
      where: { active: true },
      orderBy: { orderIndex: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <>
      <Navbar />
      <main>
        <section className="mx-auto max-w-6xl px-4 py-14 text-center sm:py-20">
          <h1 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Encontre o profissional certo, sem complicação
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-500 dark:text-slate-400">
            Eletricistas, encanadores, pintores e mais — orçamentos grátis, perto de você.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/solicitar"
              className="w-full rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 sm:w-auto"
            >
              Solicitar um serviço
            </Link>
            <Link
              href="/cadastro?as=professional"
              className="w-full rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:w-auto"
            >
              Sou profissional
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
            Categorias populares
          </h2>
          <ErrorBoundary>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.length === 0 ? (
                <p className="col-span-full text-sm text-slate-400">
                  Nenhuma categoria disponível no momento.
                </p>
              ) : (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categorias/${cat.slug}`}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:border-blue-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800"
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {cat.name}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </ErrorBoundary>
        </section>
      </main>
      <Footer />
    </>
  );
}
