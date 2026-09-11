import type { Metadata } from 'next';
import { Suspense } from 'react';
import { siteConfig } from '@/config/site';
import { getVehicles } from '@/data/repository';
import { FleetExplorer } from '@/components/fleet/FleetExplorer';
import { PageHeader } from '@/components/shared/PageHeader';
import { CtaSection } from '@/components/home/CtaSection';

export const metadata: Metadata = {
  title: `Frota de carros para alugar em ${siteConfig.city}-${siteConfig.state}`,
  description: `Veja os carros disponíveis para aluguel em ${siteConfig.city}-${siteConfig.state}. Escolha as datas, compare os modelos e confira o valor estimado da diária, da semana ou do mês.`,
  alternates: { canonical: '/frota' },
};

export const revalidate = 3600;

export default async function FleetPage() {
  const vehicles = await getVehicles();

  return (
    <>
      <PageHeader
        eyebrow="Nossa frota"
        title="Escolha o carro certo para o seu período"
        description={`Todos os veículos abaixo ficam em ${siteConfig.city}-${siteConfig.state}. Selecione as datas para ver o que está livre e quanto fica a locação.`}
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Frota' }]}
      />

      <section className="bg-paper">
        <div className="container-page py-10 lg:py-14">
          <Suspense fallback={<FleetSkeleton />}>
            <FleetExplorer vehicles={vehicles} />
          </Suspense>
        </div>
      </section>

      <CtaSection />
    </>
  );
}

/** Esqueleto exibido enquanto o período da URL é lido no cliente. */
function FleetSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      <div className="h-44 animate-pulse rounded-2xl border border-mist-200 bg-white" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-96 animate-pulse rounded-2xl border border-mist-200 bg-white"
          />
        ))}
      </div>
    </div>
  );
}
