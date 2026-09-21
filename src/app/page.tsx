import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { getActiveCampaign } from '@/data/campaigns';
import { faqItems } from '@/data/faq';
import { getFeaturedVehicles, getLowestDailyPrice, getVehicles } from '@/data/repository';
import { Hero } from '@/components/home/Hero';
import { Highlights } from '@/components/home/Highlights';
import { FleetPreview } from '@/components/home/FleetPreview';
import { HowItWorks } from '@/components/home/HowItWorks';
import { WhyRogan } from '@/components/home/WhyRogan';
import { CtaSection } from '@/components/home/CtaSection';
import { SearchBar } from '@/components/search/SearchBar';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { FaqAccordion } from '@/components/faq/FaqAccordion';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from '@/components/ui/Icons';

export const metadata: Metadata = {
  title: siteConfig.seo.title,
  description: siteConfig.seo.description,
  alternates: { canonical: '/' },
};

/**
 * Revalida a cada hora para que a campanha sazonal entre no ar sozinha,
 * sem precisar de um novo deploy.
 */
export const revalidate = 3600;

export default async function HomePage() {
  const [featured, allVehicles, lowestDailyPrice] = await Promise.all([
    getFeaturedVehicles(4),
    getVehicles(),
    getLowestDailyPrice(),
  ]);
  const campaign = getActiveCampaign();

  // Foto da seção "Por que a ROGAN": um carro de verdade da frota. Prefere um
  // sedã, que enquadra melhor no recorte 4/3 da seção.
  const showcase = allVehicles.find((vehicle) => vehicle.category === 'sedan') ?? allVehicles[0];

  return (
    <>
      <Hero campaign={campaign} lowestDailyPrice={lowestDailyPrice} vehicles={allVehicles} />

      {/* Busca por período, sobreposta ao hero */}
      <section aria-label="Buscar carros por período" className="relative bg-paper">
        <div className="container-page -mt-16 pb-14 lg:-mt-20">
          <div className="mx-auto max-w-4xl">
            <SearchBar />
          </div>
        </div>
      </section>

      <Highlights />
      <FleetPreview vehicles={featured} />
      <HowItWorks />
      <WhyRogan photo={showcase?.photos[0]} />

      {/* Perguntas frequentes (resumo) */}
      <section aria-labelledby="faq-home" className="bg-paper-alt">
        <div className="container-page py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Perguntas frequentes"
                title={<span id="faq-home">Dúvidas que aparecem sempre</span>}
                description="Se a sua não estiver aqui, é só chamar no WhatsApp que a gente responde."
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
            <FaqAccordion items={faqItems.slice(0, 5)} defaultOpenId={faqItems[0]?.id} />
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  );
}
