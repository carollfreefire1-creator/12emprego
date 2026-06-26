import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | SOS Serviços",
  description: "Como o SOS Serviços coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 text-slate-700 dark:text-slate-300">
      <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
        Política de Privacidade
      </h1>
      <p className="mb-8 text-sm text-slate-500">Última atualização: 23 de junho de 2026</p>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">1. Quem somos</h2>
        <p>
          O SOS Serviços conecta clientes a profissionais autônomos para a prestação de serviços
          residenciais. Esta política descreve como tratamos seus dados pessoais nos termos da
          Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">2. Dados que coletamos</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Dados de cadastro: nome, e-mail, telefone, endereço.</li>
          <li>Dados de uso: solicitações de serviço, propostas, avaliações, histórico de pagamentos.</li>
          <li>Dados técnicos: endereço IP, tipo de dispositivo e navegador, para segurança e prevenção de fraude.</li>
          <li>Dados de localização aproximada, quando autorizado, para sugerir profissionais próximos.</li>
        </ul>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">3. Finalidades do tratamento</h2>
        <p>Utilizamos seus dados para: viabilizar a contratação de serviços, processar pagamentos, prevenir fraude e abuso, cumprir obrigações legais e, quando você autorizar, enviar comunicações de marketing.</p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">4. Compartilhamento</h2>
        <p>Compartilhamos dados estritamente necessários com profissionais para viabilizar o serviço contratado, processadores de pagamento e autoridades, quando exigido por lei. Não vendemos dados pessoais a terceiros.</p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">5. Seus direitos (Art. 18 da LGPD)</h2>
        <p>Você pode, a qualquer momento, solicitar: confirmação do tratamento, acesso aos dados, correção, anonimização, portabilidade, eliminação e revogação do consentimento. Acesse{" "}
          <a href="/conta/privacidade" className="font-medium underline">Minha conta → Privacidade</a> para exportar ou excluir seus dados.
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">6. Retenção de dados</h2>
        <p>Mantemos dados pessoais pelo tempo necessário para cumprir as finalidades descritas e obrigações legais (ex: registros fiscais por 5 anos). Logs de segurança são retidos por até 90 dias.</p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">7. Contato do Encarregado (DPO)</h2>
        <p>
          Para exercer seus direitos ou esclarecer dúvidas, escreva para{" "}
          <a href={`mailto:${process.env.DPO_EMAIL || "privacidade@sosservicos.com.br"}`} className="font-medium underline">
            privacidade@sosservicos.com.br
          </a>.
        </p>
      </section>
    </main>
  );
}
