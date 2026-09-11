import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { getVehicleBySlug, getVehicleSlugs, getVehicles } from '@/data/repository';
import { CATEGORY_LABELS, FUEL_LABELS, TRANSMISSION_LABELS, formatCurrency } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { Check, ChevronLeft } from '@/components/ui/Icons';
import { VehicleGallery } from '@/components/vehicle/VehicleGallery';
import { VehicleSpecsGrid } from '@/components/vehicle/VehicleSpecs';
import { VehicleBookingPanel } from '@/components/vehicle/VehicleBookingPanel';
import { HowItWorks } from '@/components/home/HowItWorks';

export const revalidate = 3600;

/** Gera uma página estática para cada veículo da frota. */
export async function generateStaticParams() {
  const slugs = await getVehicleSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface VehiclePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: VehiclePageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    return { title: 'Veículo não encontrado' };
  }

  const title = `Alugar ${vehicle.name} ${vehicle.year} em ${siteConfig.city}-${siteConfig.state}`;
  // `model` já inclui o nome do carro, então usamos só a versão completa.
  const description = `${vehicle.brand} ${vehicle.model} ${vehicle.year} para alugar em ${siteConfig.city}-${siteConfig.state}: ${vehicle.seats} lugares, câmbio ${TRANSMISSION_LABELS[vehicle.transmission].toLowerCase()}, ${FUEL_LABELS[vehicle.fuel].toLowerCase()}. Consulte a disponibilidade pelo WhatsApp.`;

  return {
    title,
    description,
    alternates: { canonical: `/frota/${vehicle.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/frota/${vehicle.slug}`,
      images: [{ url: '/og.png', width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) notFound();

  const allVehicles = await getVehicles();

  /**
   * Dados estruturados do veículo. A oferta (preço) só é publicada quando o
   * site sai do modo de demonstração — não faz sentido indexar valores que
   * ainda são exemplos.
   */
  const vehicleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${vehicle.name} ${vehicle.year}`,
    description: vehicle.description,
    brand: { '@type': 'Brand', name: vehicle.brand },
    model: vehicle.model,
    image: `${siteConfig.url}${vehicle.photos[0]?.src ?? '/og.png'}`,
    ...(siteConfig.demoMode
      ? {}
      : {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'BRL',
            price: vehicle.dailyPrice,
            availability: 'https://schema.org/InStock',
            url: `${siteConfig.url}/frota/${vehicle.slug}`,
            seller: { '@type': 'Organization', name: siteConfig.legalName },
          },
        }),
  };

  return (
    <>
      <div className="border-b border-mist-200 bg-paper-alt">
        <div className="container-page py-5">
          <nav aria-label="Você está aqui">
            <ol className="flex flex-wrap items-center gap-1 text-[0.8125rem] text-mist-600">
              <li>
                <Link href="/" className="rounded transition-colors hover:text-ink">
                  Início
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/frota" className="rounded transition-colors hover:text-ink">
                  Frota
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span aria-current="page" className="font-medium text-ink">
                  {vehicle.name}
                </span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <article className="bg-paper">
        <div className="container-page grid gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:py-14">
          {/* Coluna esquerda: galeria e informações */}
          <div className="flex flex-col gap-8">
            <VehicleGallery photos={vehicle.photos} name={vehicle.name} />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="dark">{CATEGORY_LABELS[vehicle.category]}</Badge>
                <Badge tone="outline">{TRANSMISSION_LABELS[vehicle.transmission]}</Badge>
                <Badge tone="outline">{FUEL_LABELS[vehicle.fuel]}</Badge>
              </div>

              <h1 className="mt-4 text-[2rem] leading-[1.1] font-extrabold text-ink sm:text-[2.5rem]">
                {vehicle.name} {vehicle.year}
              </h1>
              <p className="mt-2 text-[0.9375rem] text-mist-600">{vehicle.model}</p>

              <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-mist-600 sm:text-base">
                {vehicle.description}
              </p>
            </div>

            <section aria-labelledby="ficha-tecnica">
              <h2 id="ficha-tecnica" className="font-display text-lg font-bold text-ink">
                Ficha técnica
              </h2>
              <div className="mt-4">
                <VehicleSpecsGrid vehicle={vehicle} />
              </div>
            </section>

            {vehicle.highlights.length > 0 && (
              <section aria-labelledby="destaques">
                <h2 id="destaques" className="font-display text-lg font-bold text-ink">
                  Destaques
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {vehicle.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="inline-flex items-center gap-2 rounded-full border border-mist-200 bg-white px-3.5 py-2 text-[0.8125rem] text-ink-700"
                    >
                      <Check className="size-3.5 shrink-0 text-accent-700" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section
              aria-labelledby="tabela-precos"
              className="rounded-2xl border border-mist-200 bg-white p-5 sm:p-6"
            >
              <h2 id="tabela-precos" className="font-display text-lg font-bold text-ink">
                Valores de referência
              </h2>
              <p className="mt-1 text-[0.8125rem] text-mist-600">
                Os pacotes de 7 e 30 dias já saem mais em conta do que somar diárias avulsas.
              </p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                <PriceCard label="1 diária" value={formatCurrency(vehicle.dailyPrice)} />
                <PriceCard
                  label="7 dias"
                  value={formatCurrency(vehicle.weeklyPrice)}
                  note={`${formatCurrency(vehicle.weeklyPrice / 7)} por dia`}
                />
                <PriceCard
                  label="30 dias"
                  value={formatCurrency(vehicle.monthlyPrice)}
                  note={`${formatCurrency(vehicle.monthlyPrice / 30)} por dia`}
                />
              </dl>
              <p className="mt-4 text-[0.6875rem] leading-relaxed text-mist-600">
                Valores demonstrativos, sujeitos a confirmação no atendimento. Períodos diferentes
                são calculados automaticamente ao escolher as datas.
              </p>
            </section>

            <Link
              href="/frota"
              className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink underline underline-offset-4 transition-colors hover:text-accent-700"
            >
              <ChevronLeft className="size-4" />
              Voltar para a frota
            </Link>
          </div>

          {/* Coluna direita: cálculo e conversão */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Suspense
              fallback={
                <div
                  aria-hidden="true"
                  className="h-[34rem] animate-pulse rounded-2xl border border-mist-200 bg-white"
                />
              }
            >
              <VehicleBookingPanel vehicle={vehicle} alternatives={allVehicles} />
            </Suspense>
          </div>
        </div>
      </article>

      <HowItWorks variant="dark" showCta={false} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleSchema) }}
      />
    </>
  );
}

function PriceCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-mist-200 bg-mist-100/50 p-4">
      <dt className="text-[0.6875rem] font-semibold tracking-[0.1em] text-mist-600 uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 font-display text-xl font-bold text-ink">
        {value}
        {note && (
          <span className="mt-1 block font-sans text-[0.6875rem] font-normal text-mist-600">
            {note}
          </span>
        )}
      </dd>
    </div>
  );
}
