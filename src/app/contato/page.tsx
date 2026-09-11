import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { faqItems } from '@/data/faq';
import { buildWhatsAppUrl, generalMessage } from '@/lib/whatsapp';
import { PageHeader } from '@/components/shared/PageHeader';
import { ContactInfo } from '@/components/contact/ContactInfo';
import { MapEmbed } from '@/components/contact/MapEmbed';
import { FaqAccordion } from '@/components/faq/FaqAccordion';
import { CtaSection } from '@/components/home/CtaSection';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Button } from '@/components/ui/Button';
import { ArrowRight, WhatsApp } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: `Contato da ROGAN em ${siteConfig.city}-${siteConfig.state}`,
  description: `Fale com a ROGAN, locadora de veículos em ${siteConfig.city}-${siteConfig.state}. Atendimento pelo WhatsApp para consultar disponibilidade, valores e retirada do veículo.`,
  alternates: { canonical: '/contato' },
};

/** Perguntas que costumam surgir junto com o contato. */
const contactFaq = faqItems.filter(
  (item) => item.category === 'atendimento' || item.category === 'retirada',
);

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contato"
        title="Fale com a ROGAN"
        description={`O WhatsApp é o nosso canal principal: é por lá que confirmamos a disponibilidade, combinamos a retirada e tiramos qualquer dúvida sobre a locação em ${siteConfig.city}-${siteConfig.state}.`}
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Contato' }]}
      >
        <Button
          href={buildWhatsAppUrl(generalMessage())}
          external
          variant="whatsapp"
          size="lg"
          icon={<WhatsApp className="size-5" />}
        >
          Falar no WhatsApp
        </Button>
      </PageHeader>

      <section className="bg-paper">
        <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:py-16">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Canais de atendimento</h2>
            <p className="mt-1.5 mb-6 text-[0.875rem] text-mist-600">
              Responder pelo WhatsApp é mais rápido do que por qualquer formulário — por isso não
              temos um aqui.
            </p>
            <ContactInfo />
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink">Onde estamos</h2>
            <p className="mt-1.5 mb-6 text-[0.875rem] text-mist-600">
              Atendemos {siteConfig.region}.
            </p>
            <MapEmbed />
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-contato" className="bg-paper-alt">
        <div className="container-page py-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Antes de chamar"
                title={<span id="faq-contato">Talvez a sua dúvida já esteja respondida</span>}
                description="As perguntas mais comuns sobre atendimento, confirmação e retirada do veículo."
              />
              <Button
                href="/faq"
                variant="outline"
                className="mt-7"
                trailingIcon={<ArrowRight className="size-4" />}
              >
                Ver todas as perguntas
              </Button>
            </div>
            <FaqAccordion items={contactFaq} defaultOpenId={contactFaq[0]?.id} />
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
