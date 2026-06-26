import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a equipe do SOS Serviços.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Fale com a gente</h1>
        <p className="mb-8 text-slate-500 dark:text-slate-400">
          Dúvidas, sugestões ou problemas? Envie uma mensagem.
        </p>
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
