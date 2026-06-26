import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 py-10 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <p>© {new Date().getFullYear()} SOS Serviços. Todos os direitos reservados.</p>
        <div className="flex gap-5">
          <Link href="/contato" className="hover:underline">Contato</Link>
          <Link href="/termos" className="hover:underline">Termos de uso</Link>
          <Link href="/privacidade" className="hover:underline">Privacidade</Link>
        </div>
      </div>
    </footer>
  );
}
