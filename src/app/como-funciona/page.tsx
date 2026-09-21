import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { buildWhatsAppUrl, generalMessage } from '@/lib/whatsapp';
import { PageHeader } from '@/components/shared/PageHeader';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CtaSection } from '@/components/home/CtaSection';
import { SearchBar } from '@/components/search/SearchBar';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { Alert, Check, WhatsApp } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: 'Como funciona o aluguel de carro na ROGAN',
  description: `Entenda como alugar um carro na ROGAN em ${siteConfig.city}-${siteConfig.state}: escolha as datas, veja os carros disponíveis, confira o valor estimado e fale com a nossa equipe pelo WhatsApp.`,
  alternates: { canonical: '/como-funciona' },
};

const expectations = [
  'Você escolhe o período e vê apenas os carros livres nessas datas.',
  'O valor estimado aparece antes de você falar com a gente.',
  'A mensagem chega no WhatsApp já com carro, datas e valor preenchidos.',
  'Uma pessoa da equipe confirma a disponibilidade e combina a retirada.',
];

const clarifications = [
  {
    title: 'Não há pagamento pelo site',
    text: 'Nenhum dado de cartão é pedido aqui. A forma de pagamento é combinada diretamente com a nossa equipe.',
  },
  {
    title: 'O envio não confirma a reserva',
    text: 'O que sai do site é uma solicitação de locação. A confirmação depende da checagem de disponibilidade feita pela equipe.',
  },
  {
    title: 'O valor exibido é uma estimativa',
    text: 'Ele é calculado com a diária do veículo e o período escolhido. Condições específicas são tratadas no atendimento.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Como funciona"
        title="Alugar na ROGAN é resolver pelo WhatsApp, sem burocracia"
        description="O site serve para você escolher com calma e chegar na conversa já sabendo o que quer e quanto custa. O resto é com a nossa equipe."
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Como funciona' }]}
      >
        <div className="max-w-3xl">
          <SearchBar />
        </div>
      </PageHeader>

      <HowItWorks />

      <section aria-labelledby="o-que-esperar" className="bg-paper-alt">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div>
            <span className="eyebrow text-accent-700">O que esperar</span>
            <h2
              id="o-que-esperar"
              className="mt-3 text-[1.75rem] leading-[1.12] font-bold text-ink sm:text-[2.125rem]"
            >
              O que acontece depois que você envia
            </h2>
            <ul className="mt-7 flex flex-col gap-4">
              {expectations.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent-100 text-accent-700"
                  >
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-[0.9375rem] leading-relaxed text-mist-600">{item}</span>
                </li>
              ))}
            </ul>
            <WhatsAppButton
              href={buildWhatsAppUrl(generalMessage())}
              origem="como_funciona"
              variant="whatsapp"
              size="lg"
              className="mt-8"
              icon={<WhatsApp className="size-5" />}
            >
              Falar no WhatsApp
            </WhatsAppButton>
          </div>

          <div className="flex flex-col gap-4">
            {clarifications.map((item) => (
              <div
                key={item.title}
                className="flex gap-3.5 rounded-2xl border border-mist-200 bg-white p-5"
              >
                <span aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent-700">
                  <Alert className="size-full" />
                </span>
                <div>
                  <h3 className="font-display text-[0.9375rem] font-bold text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-[0.875rem] leading-relaxed text-mist-600">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
