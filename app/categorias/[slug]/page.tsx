import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      professionals: {
        include: {
          professional: {
            include: { user: true },
          },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};

  return {
    title: `${category.name} — Profissionais perto de você`,
    description: `Encontre profissionais de ${category.name.toLowerCase()} avaliados e prontos para atender você.`,
  };
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ where: { active: true }, select: { slug: true } });
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const professionals = category.professionals
    .map((pc) => pc.professional)
    .filter((p) => p.approvalStatus === "approved");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="text-3xl">{category.icon}</span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{category.name}</h1>
        </div>

        {professionals.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">
            Ainda não há profissionais aprovados nesta categoria.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {professionals.map((pro) => (
              <div
                key={pro.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900 dark:text-white">{pro.user.name}</h2>
                  {pro.verified && <span className="text-xs text-blue-600">✓ Verificado</span>}
                </div>
                <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{pro.bio}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-amber-600">★ {pro.rating.toString()}</span>
                  <span className="text-slate-400">{pro.completedJobs} serviços</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
