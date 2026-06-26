import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 text-5xl">🔍</div>
      <h1 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Página não encontrada</h1>
      <p className="mb-6 max-w-md text-sm text-slate-500 dark:text-slate-400">
        O conteúdo que você procura não existe ou foi movido.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
