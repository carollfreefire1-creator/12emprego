import type { Metadata } from "next";
import Link from "next/link";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Criar conta",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ ref?: string; as?: string }>;
}

export default async function SignupPage({ searchParams }: Props) {
  const { ref, as } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Criar conta</h1>
      {ref && (
        <p className="mb-6 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Você foi indicado por um amigo! Crie sua conta e aproveite.
        </p>
      )}
      <SignupForm referralCode={ref} defaultRole={as === "professional" ? "professional" : "user"} />
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-blue-600 underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
