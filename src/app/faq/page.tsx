import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { faqItems } from '@/data/faq';
import { buildWhatsAppUrl, generalMessage } from '@/lib/whatsapp';
import { PageHeader } from '@/components/shared/PageHeader';
import { FaqAccordion } from '@/components/faq/FaqAccordion';
import { CtaSection } from '@/components/home/CtaSection';
import { Button } from '@/components/ui/Button';
import { WhatsApp } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: 'Perguntas frequentes sobre aluguel de carro',
  description: `Tire suas dúvidas sobre como alugar um carro na ROGAN em ${siteConfig.city}-${siteConfig.state}: períodos, valores, solicitação pelo WhatsApp e retirada do veículo.`,
  alternates: { canonical: '/faq' },
};

const groups = [
  { id: 'locacao', label: 'Sobre a locação' },
  { id: 'valores', label: 'Valores e períodos' },
  { id: 'atendimento', label: 'Atendimento e confirmação' },
  { id: 'retirada', label: 'Retirada e região' },
] as const;

/** Dados estruturados de FAQ — ajudam o Google a exibir as perguntas na busca. */
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="Perguntas frequentes"
        title="Dúvidas sobre alugar um carro na ROGAN"
        description="Reunimos aqui o que mais perguntam pelo WhatsApp. Se a sua dúvida não estiver nesta lista, é só chamar a gente."
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'FAQ' }]}
      />

      <section className="bg-paper">
        <div className="container-page flex flex-col gap-12 py-12 lg:py-16">
          {groups.map((group) => {
            const items = faqItems.filter((item) => item.category === group.id);
            if (items.length === 0) return null;

            return (
              <div key={group.id} className="grid gap-6 lg:grid-cols-[0.6fr_1.4fr] lg:gap-12">
                <h2 className="font-display text-xl font-bold text-ink lg:sticky lg:top-24 lg:self-start">
                  {group.label}
                </h2>
                <FaqAccordion items={items} />
              </div>
            );
          })}

          <div className="flex flex-col items-start gap-4 rounded-2xl border border-mist-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Ficou com alguma dúvida?</h2>
              <p className="mt-1 text-[0.875rem] text-mist-600">
                Manda mensagem que a gente responde — é gente de verdade do outro lado.
              </p>
            </div>
            <Button
              href={buildWhatsAppUrl(generalMessage('Tenho uma dúvida sobre a locação.'))}
              external
              variant="whatsapp"
              className="shrink-0"
              icon={<WhatsApp className="size-4" />}
            >
              Falar no WhatsApp
            </Button>
          </div>
        </div>
      </section>

      <CtaSection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
