import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Entrar</h1>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-blue-600 underline">
          Criar conta
        </Link>
      </p>
    </main>
  );
}
