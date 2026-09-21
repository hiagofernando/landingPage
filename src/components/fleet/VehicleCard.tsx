'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { DateRange, Vehicle } from '@/types';
import { checkAvailability } from '@/lib/availability';
import { applyFleetStatus, isUnderNegotiation } from '@/lib/negotiations';
import { useFleetStatus } from '@/hooks/useFleetStatus';
import { NegotiationBadge } from '@/components/negotiation/NegotiationNotice';
import { CATEGORY_LABELS, formatCurrency, formatCurrencyCompact } from '@/lib/format';
import { calculateDays, calculateQuote } from '@/lib/pricing';
import { pluralizeDays } from '@/lib/dates';
import { vehicleUrl } from '@/lib/urls';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Icons';
import { RentNowButton } from '@/components/booking/RentNowButton';
import { VehicleSpecsRow } from '@/components/vehicle/VehicleSpecs';

interface VehicleCardProps {
  vehicle: Vehicle;
  /** Período escolhido pelo usuário, quando houver. */
  range?: DateRange;
  /** Carrega a imagem com prioridade (usar só nos primeiros cards). */
  priority?: boolean;
}

/**
 * Card de um carro da frota.
 *
 * Cliente porque depende da situação vinda do WhatsApp (`useFleetStatus`):
 * um período fechado pela equipe depois do último deploy também deixa o
 * carro indisponível, e uma negociação aberta ganha selo.
 */
export function VehicleCard({ vehicle, range, priority }: VehicleCardProps) {
  const fleetStatus = useFleetStatus();
  const liveVehicle = applyFleetStatus(vehicle, fleetStatus);
  const availability = checkAvailability(liveVehicle, range?.pickupDate, range?.returnDate);
  const negotiating =
    availability.available &&
    isUnderNegotiation(vehicle, fleetStatus, range?.pickupDate, range?.returnDate);
  const days = calculateDays(range?.pickupDate || '', range?.returnDate || '');
  const quote = days > 0 ? calculateQuote(vehicle, days) : null;
  // Leva o período junto: sem isso o cliente teria que escolher as datas
  // outra vez ao abrir a página do veículo.
  const href = vehicleUrl(vehicle.slug, range);
  const cover = vehicle.photos[0];

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-mist-200 bg-white',
        'transition-[transform,box-shadow,border-color] duration-300',
        availability.available
          ? 'hover:-translate-y-1 hover:border-mist-300 hover:shadow-[0_20px_44px_-26px_rgba(10,25,48,0.4)]'
          : 'opacity-95',
      )}
    >
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[16/10] overflow-hidden bg-mist-100"
      >
        <Image
          src={cover.src}
          alt=""
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 92vw"
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          className={cn(
            'object-cover transition-transform duration-500 group-hover:scale-[1.04]',
            !availability.available && 'grayscale-[0.7]',
          )}
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge tone="dark">{CATEGORY_LABELS[vehicle.category]}</Badge>
          {!availability.available && <Badge tone="danger">{availability.message}</Badge>}
          {negotiating && <NegotiationBadge />}
        </div>

        <span className="absolute right-3 bottom-3 rounded-full bg-ink/75 px-2.5 py-1 text-[0.625rem] font-medium text-mist-300 backdrop-blur-sm">
          Imagem ilustrativa
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="font-display text-lg leading-tight font-bold text-ink">
            <Link href={href} className="rounded transition-colors hover:text-accent-700">
              {vehicle.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-[0.8125rem] text-mist-600">
            {vehicle.model} · {vehicle.year}
          </p>
        </div>

        <VehicleSpecsRow vehicle={vehicle} />

        <div className="mt-auto flex flex-col gap-4 border-t border-mist-200 pt-4">
          {quote && availability.available ? (
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[0.6875rem] font-medium tracking-[0.06em] text-mist-600 uppercase">
                  {pluralizeDays(quote.days)}
                </p>
                <p className="font-display text-2xl leading-none font-bold text-ink">
                  {formatCurrency(quote.total)}
                </p>
              </div>
              <p className="pb-0.5 text-right text-[0.6875rem] leading-tight text-mist-600">
                {formatCurrencyCompact(quote.averageDailyPrice)}
                <br />
                por diária
              </p>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[0.6875rem] font-medium tracking-[0.06em] text-mist-600 uppercase">
                  Diária a partir de
                </p>
                <p className="font-display text-2xl leading-none font-bold text-ink">
                  {formatCurrency(vehicle.dailyPrice)}
                </p>
              </div>
              <p className="pb-0.5 text-right text-[0.6875rem] leading-tight text-mist-600">
                7 dias
                <br />
                {formatCurrencyCompact(vehicle.weeklyPrice)}
              </p>
            </div>
          )}

          {availability.available ? (
            <div className="flex gap-2">
              <Button href={href} variant="outline" size="sm" className="flex-1">
                Ver detalhes
              </Button>
              <RentNowButton vehicle={vehicle} range={range} size="sm" className="flex-1" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="flex items-start gap-2 text-[0.8125rem] leading-snug text-danger">
                <Alert className="mt-0.5 size-4 shrink-0" />
                {availability.reason === 'periodo_ocupado'
                  ? 'Este carro já está comprometido nas datas escolhidas.'
                  : 'Este carro não está disponível no momento.'}
              </p>
              <Button href={href} variant="outline" size="sm" fullWidth>
                Ver detalhes e outras datas
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
