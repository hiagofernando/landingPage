import type { SeasonalCampaign, Vehicle } from '@/types';
import { siteConfig } from '@/config/site';
import { buildWhatsAppUrl, generalMessage } from '@/lib/whatsapp';
import { formatCurrencyCompact } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { ArrowRight, MapPin, WhatsApp } from '@/components/ui/Icons';
import { HeroCarousel } from './HeroCarousel';

interface HeroProps {
  campaign: SeasonalCampaign;
  lowestDailyPrice: number | null;
  vehicles: Vehicle[];
}

/**
 * Hero da home. O texto vem da campanha ativa (ver src/data/campaigns.ts):
 * em datas comemorativas ele troca sozinho; fora delas usa o texto
 * institucional.
 */
export function Hero({ campaign, lowestDailyPrice, vehicles }: HeroProps) {
  const whatsappUrl = buildWhatsAppUrl(generalMessage(campaign.whatsappMessage ?? undefined));
  const slides = vehicles
    .filter((vehicle) => vehicle.photos.length > 0)
    .map((vehicle) => ({
      src: vehicle.photos[0].src,
      alt: vehicle.photos[0].alt,
      name: vehicle.name,
    }));

  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      {/* Brilho de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(60% 55% at 78% 30%, rgba(59,158,255,0.18) 0%, rgba(10,25,48,0) 70%), radial-gradient(50% 45% at 12% 8%, rgba(255,255,255,0.07) 0%, rgba(10,25,48,0) 72%)',
        }}
      />

      <div className="container-page relative grid gap-10 pt-14 pb-24 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:pt-20 lg:pb-32">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900/80 px-3.5 py-1.5">
            <MapPin className="size-3.5 text-accent" />
            <span className="eyebrow text-mist-300">{campaign.eyebrow}</span>
          </span>

          <h1 className="text-[2.125rem] leading-[1.06] font-extrabold sm:text-[2.75rem] lg:text-[3.375rem]">
            {campaign.title}
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-mist-300 sm:text-lg">
            {campaign.subtitle}
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button
              href="/frota"
              size="lg"
              variant="primary"
              trailingIcon={<ArrowRight className="size-4" />}
              className="w-full sm:w-auto"
            >
              {campaign.cta}
            </Button>
            <Button
              href={whatsappUrl}
              external
              size="lg"
              variant="outline"
              icon={<WhatsApp className="size-5 text-whats" />}
              className="w-full border-ink-600 text-paper hover:border-paper hover:bg-ink-800 sm:w-auto"
            >
              Falar no WhatsApp
            </Button>
          </div>

          <dl className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-[0.6875rem] tracking-[0.1em] text-mist-500 uppercase">
                Onde atendemos
              </dt>
              <dd className="mt-0.5 font-display font-semibold text-paper">{siteConfig.region}</dd>
            </div>
            <div>
              <dt className="text-[0.6875rem] tracking-[0.1em] text-mist-500 uppercase">Locação</dt>
              <dd className="mt-0.5 font-display font-semibold text-paper">
                Diária, semanal e mensal
              </dd>
            </div>
            {lowestDailyPrice !== null && (
              <div>
                <dt className="text-[0.6875rem] tracking-[0.1em] text-mist-500 uppercase">
                  Diárias a partir de
                </dt>
                <dd className="mt-0.5 font-display font-semibold text-accent">
                  {formatCurrencyCompact(lowestDailyPrice)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <HeroCarousel slides={slides} />
      </div>
    </section>
  );
}
