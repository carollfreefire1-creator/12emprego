"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setAuthed(false);
      return;
    }
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-slate-900 dark:text-white">
          SOS <span className="text-blue-600">Serviços</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 sm:flex">
          <Link href="/categorias">Categorias</Link>
          <Link href="/conta/indicacoes">Indique e ganhe</Link>
          {authed ? (
            <Link href="/conta">Minha conta</Link>
          ) : (
            <Link href="/login">Entrar</Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {authed ? (
            <LogoutButton className="hidden rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200 sm:inline-block" />
          ) : (
            <Link
              href="/cadastro"
              className="hidden rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900 sm:inline-block"
            >
              Criar conta
            </Link>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200 sm:hidden"
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 sm:hidden">
          <Link href="/categorias" className="rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>
            Categorias
          </Link>
          <Link href="/conta/indicacoes" className="rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>
            Indique e ganhe
          </Link>
          {authed ? (
            <>
              <Link href="/conta" className="rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>
                Minha conta
              </Link>
              <LogoutButton className="mt-1 rounded-lg border border-slate-200 px-3 py-2.5 text-center font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200" />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setOpen(false)}>
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="mt-1 rounded-lg bg-slate-900 px-3 py-2.5 text-center font-semibold text-white dark:bg-white dark:text-slate-900"
                onClick={() => setOpen(false)}
              >
                Criar conta
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
