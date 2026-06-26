import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | SOS Serviços",
  description: "Termos e condições de uso da plataforma SOS Serviços.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-slate-700 dark:text-slate-300">
      <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">Termos de Uso</h1>
      <p className="mb-8 text-sm text-slate-500">Última atualização: 23 de junho de 2026</p>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">1. Aceitação</h2>
        <p>Ao criar uma conta ou usar o SOS Serviços, você concorda com estes Termos de Uso e com nossa Política de Privacidade.</p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">2. Natureza do serviço</h2>
        <p>O SOS Serviços é uma plataforma de intermediação entre clientes e profissionais autônomos. Não somos parte na relação de prestação de serviço e não garantimos resultado, qualidade ou prazo dos serviços contratados entre as partes.</p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">3. Cadastro e responsabilidades</h2>
        <p>Você é responsável por manter a confidencialidade de sua senha e pela veracidade das informações fornecidas. Profissionais devem passar por processo de aprovação antes de oferecer serviços na plataforma.</p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">4. Pagamentos, planos e cupons</h2>
        <p>Profissionais podem assinar planos pagos com benefícios adicionais. Cupons promocionais possuem regras próprias de validade, valor mínimo e limite de uso, exibidas no momento da aplicação.</p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">5. Programa de indicação</h2>
        <p>Usuários podem indicar novos usuários através de um código pessoal. Recompensas são concedidas conforme regras vigentes, podendo ser alteradas ou descontinuadas a qualquer momento, sem efeito retroativo sobre indicações já recompensadas.</p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">6. Conduta proibida</h2>
        <p>É proibido usar a plataforma para fins fraudulentos, envio de spam, manipulação de avaliações, ou qualquer atividade que viole a legislação brasileira. Contas que violarem estas regras poderão ser suspensas ou bloqueadas.</p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">7. Alterações destes termos</h2>
        <p>Podemos atualizar estes termos periodicamente. Alterações relevantes serão comunicadas pelos canais da plataforma.</p>
      </section>
    </main>
  );
}
