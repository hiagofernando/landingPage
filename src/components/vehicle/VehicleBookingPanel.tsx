'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { DateRange, Vehicle } from '@/types';
import { checkAvailability } from '@/lib/availability';
import { formatCurrency, formatCurrencyCompact } from '@/lib/format';
import { pluralizeDays } from '@/lib/dates';
import { calculateDays, calculateQuote, pricingRules } from '@/lib/pricing';
import { hasErrors, validateDateRange } from '@/lib/validation';
import type { DateRangeErrors } from '@/lib/validation';
import { buildWhatsAppUrl, vehicleInterestMessage } from '@/lib/whatsapp';
import { cn } from '@/lib/cn';
import { applyFleetStatus, isUnderNegotiation } from '@/lib/negotiations';
import { useDateRangeParams } from '@/hooks/useDateRangeParams';
import { useFleetStatus } from '@/hooks/useFleetStatus';
import { NegotiationNotice } from '@/components/negotiation/NegotiationNotice';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { Alert, Check, WhatsApp } from '@/components/ui/Icons';
import { DateRangePicker } from '@/components/search/DateRangePicker';
import { RentNowButton } from '@/components/booking/RentNowButton';
import { VehicleCard } from '@/components/fleet/VehicleCard';

interface VehicleBookingPanelProps {
  vehicle: Vehicle;
  /** Frota completa, usada para sugerir alternativas quando indisponível. */
  alternatives: Vehicle[];
}

/**
 * Calculadora de preço + disponibilidade da página do veículo.
 * É o ponto de conversão principal: daqui o cliente vai para o WhatsApp.
 */
export function VehicleBookingPanel({ vehicle, alternatives }: VehicleBookingPanelProps) {
  const paramsRange = useDateRangeParams();
  const [range, setRange] = useState<DateRange>(paramsRange);
  const [errors, setErrors] = useState<DateRangeErrors>({});

  const validRange = Boolean(range.pickupDate && range.returnDate && !hasErrors(errors));
  const days = calculateDays(range.pickupDate || '', range.returnDate || '');
  const quote = useMemo(() => calculateQuote(vehicle, days), [vehicle, days]);

  // Períodos fechados pela equipe no WhatsApp contam como ocupados.
  const fleetStatus = useFleetStatus();

  const availability = checkAvailability(
    applyFleetStatus(vehicle, fleetStatus),
    validRange ? range.pickupDate : undefined,
    validRange ? range.returnDate : undefined,
  );
  const negotiating =
    validRange &&
    availability.available &&
    isUnderNegotiation(vehicle, fleetStatus, range.pickupDate, range.returnDate);

  const suggestions = useMemo(() => {
    if (availability.available) return [];
    return alternatives
      .filter(
        (candidate) =>
          candidate.id !== vehicle.id &&
          checkAvailability(
            applyFleetStatus(candidate, fleetStatus),
            validRange ? range.pickupDate : undefined,
            validRange ? range.returnDate : undefined,
          ).available,
      )
      .sort((a, b) => {
        const sameCategory =
          Number(b.category === vehicle.category) - Number(a.category === vehicle.category);
        if (sameCategory !== 0) return sameCategory;
        return (
          Math.abs(a.dailyPrice - vehicle.dailyPrice) - Math.abs(b.dailyPrice - vehicle.dailyPrice)
        );
      })
      .slice(0, 3);
  }, [
    alternatives,
    availability.available,
    fleetStatus,
    range.pickupDate,
    range.returnDate,
    validRange,
    vehicle,
  ]);

  const handleRangeChange = (next: DateRange) => {
    setRange(next);
    setErrors(validateDateRange(next.pickupDate, next.returnDate, { required: false }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-[0_18px_50px_-32px_rgba(10,25,48,0.55)] sm:p-6">
        {/* Preço de referência */}
        <div className="flex items-end justify-between gap-4 border-b border-mist-200 pb-5">
          <div>
            <p className="text-[0.6875rem] font-semibold tracking-[0.1em] text-mist-600 uppercase">
              Diária a partir de
            </p>
            <p className="font-display text-3xl leading-none font-bold text-ink">
              {formatCurrency(vehicle.dailyPrice)}
            </p>
          </div>
          <ul className="text-right text-[0.75rem] leading-relaxed text-mist-600">
            <li>
              7 dias{' '}
              <strong className="font-semibold text-ink">
                {formatCurrencyCompact(vehicle.weeklyPrice)}
              </strong>
            </li>
            <li>
              30 dias{' '}
              <strong className="font-semibold text-ink">
                {formatCurrencyCompact(vehicle.monthlyPrice)}
              </strong>
            </li>
          </ul>
        </div>

        {/* Datas */}
        <div className="pt-5">
          <h2 className="font-display text-base font-bold text-ink">Escolha suas datas</h2>
          <p className="mt-1 mb-4 text-[0.8125rem] text-mist-600">
            O valor estimado aparece automaticamente.
          </p>
          <DateRangePicker value={range} onChange={handleRangeChange} errors={errors} />
        </div>

        {/* Estimativa */}
        <div
          aria-live="polite"
          className={cn(
            'mt-5 rounded-xl border p-4',
            days > 0 && availability.available
              ? 'border-mist-200 bg-mist-100/70'
              : 'border-dashed border-mist-300 bg-transparent',
          )}
        >
          {days > 0 ? (
            <>
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-mist-600">Diárias</dt>
                  <dd className="font-medium text-ink">{pluralizeDays(days)}</dd>
                </div>
                {quote.lines.map((line) => (
                  <div
                    key={line.label}
                    className="flex justify-between gap-4 text-xs text-mist-600"
                  >
                    <dt>{line.label}</dt>
                    <dd className="tabular-nums">{formatCurrency(line.total)}</dd>
                  </div>
                ))}
                {quote.discount > 0 && (
                  <div className="flex justify-between gap-4 text-xs font-medium text-success">
                    <dt>Economia com pacote</dt>
                    <dd className="tabular-nums">−{formatCurrency(quote.discount)}</dd>
                  </div>
                )}
                <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-mist-300 pt-3">
                  <dt className="font-semibold text-ink">Valor estimado</dt>
                  <dd className="font-display text-2xl font-bold text-ink tabular-nums">
                    {formatCurrency(quote.total)}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-[0.6875rem] leading-relaxed text-mist-600">
                Estimativa para o período escolhido. A confirmação e as condições finais são
                tratadas pela nossa equipe no WhatsApp.
              </p>
            </>
          ) : (
            <p className="text-center text-[0.8125rem] text-mist-600">
              Escolha a retirada e a devolução para ver o valor estimado.
              {pricingRules.sameDayCountsAsOneDay &&
                ' Retirada e devolução no mesmo dia contam como uma diária.'}
            </p>
          )}
        </div>

        {/* Disponibilidade */}
        {validRange && (
          <div
            className={cn(
              'mt-4 flex items-start gap-2.5 rounded-xl p-3.5 text-[0.8125rem]',
              availability.available ? 'bg-success/10 text-success' : 'bg-danger-100 text-danger',
            )}
          >
            {availability.available ? (
              <Check className="mt-0.5 size-4 shrink-0" />
            ) : (
              <Alert className="mt-0.5 size-4 shrink-0" />
            )}
            <p className="font-medium">
              {availability.message}
              {!availability.available && availability.reason === 'periodo_ocupado' && (
                <span className="mt-0.5 block font-normal text-danger/80">
                  Escolha outro período ou confira as opções sugeridas abaixo.
                </span>
              )}
            </p>
          </div>
        )}

        {negotiating && (
          <div className="mt-4">
            <NegotiationNotice />
          </div>
        )}

        {/* Ações */}
        <div className="mt-5 flex flex-col gap-2.5">
          <RentNowButton
            vehicle={vehicle}
            range={validRange ? range : undefined}
            size="lg"
            fullWidth
            disabled={!availability.available}
            label={availability.available ? 'Alugar agora' : 'Indisponível para estas datas'}
          />
          <WhatsAppButton
            href={buildWhatsAppUrl(vehicleInterestMessage(vehicle))}
            origem="painel_veiculo"
            veiculo={vehicle.slug}
            variant="outline"
            size="lg"
            fullWidth
            icon={<WhatsApp className="size-4 text-whats-700" />}
          >
            Tirar dúvida no WhatsApp
          </WhatsAppButton>
        </div>
      </div>

      {/* Alternativas */}
      {suggestions.length > 0 && (
        <section aria-labelledby="alternativas" className="flex flex-col gap-4">
          <div>
            <h2 id="alternativas" className="font-display text-lg font-bold text-ink">
              Confira outras opções disponíveis
            </h2>
            <p className="mt-1 text-[0.8125rem] text-mist-600">
              Estes carros estão livres no período que você escolheu.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {suggestions.map((suggestion) => (
              <VehicleCard
                key={suggestion.id}
                vehicle={suggestion}
                range={validRange ? range : undefined}
              />
            ))}
          </div>
          <Link
            href="/frota"
            className="text-sm font-semibold text-accent-700 underline underline-offset-4 transition-colors hover:text-ink"
          >
            Ver a frota completa
          </Link>
        </section>
      )}
    </div>
  );
}
