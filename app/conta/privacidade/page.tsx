import type { Metadata } from "next";
import AccountPrivacyClient from "./AccountPrivacyClient";

export const metadata: Metadata = {
  title: "Privacidade e dados | SOS Serviços",
};

export default function AccountPrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
        Privacidade e dados
      </h1>
      <AccountPrivacyClient />
    </main>
  );
}
