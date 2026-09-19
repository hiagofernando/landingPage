'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type {
  DateRange,
  FleetFilters,
  Fuel,
  Transmission,
  Vehicle,
  VehicleCategory,
} from '@/types';
import { checkAvailability } from '@/lib/availability';
import { CATEGORY_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from '@/lib/format';
import { pluralizeDays } from '@/lib/dates';
import { calculateDays } from '@/lib/pricing';
import { hasErrors, validateDateRange } from '@/lib/validation';
import type { DateRangeErrors } from '@/lib/validation';
import { cn } from '@/lib/cn';
import { useDateRangeParams } from '@/hooks/useDateRangeParams';
import { Button } from '@/components/ui/Button';
import { Close, Filter } from '@/components/ui/Icons';
import { DateRangePicker } from '@/components/search/DateRangePicker';
import { VehicleCard } from './VehicleCard';
import { EmptyState } from './EmptyState';

interface FleetExplorerProps {
  vehicles: Vehicle[];
}

const DEFAULT_FILTERS: FleetFilters = {
  category: 'todas',
  transmission: 'todos',
  fuel: 'todos',
  onlyAvailable: true,
};

/**
 * Página da frota: período + filtros + resultados.
 * As datas ficam na URL (?retirada=&devolucao=) para que o link possa ser
 * compartilhado e para manter a seleção ao navegar para o veículo.
 */
export function FleetExplorer({ vehicles }: FleetExplorerProps) {
  const router = useRouter();
  const paramsRange = useDateRangeParams();
  const [range, setRange] = useState<DateRange>(paramsRange);
  const [filters, setFilters] = useState<FleetFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // Os erros são derivados do período: calcular na renderização evita um
  // estado redundante (e um render extra a cada digitação).
  const errors: DateRangeErrors = useMemo(
    () => validateDateRange(range.pickupDate, range.returnDate, { required: false }),
    [range.pickupDate, range.returnDate],
  );

  const hasRange = Boolean(range.pickupDate && range.returnDate && !hasErrors(errors));
  const days = calculateDays(range.pickupDate || '', range.returnDate || '');

  // Mantém a URL em sincronia com o período escolhido, para o link ser
  // compartilhável e a seleção sobreviver à navegação.
  useEffect(() => {
    const params = new URLSearchParams();
    if (range.pickupDate && !errors.pickupDate) params.set('retirada', range.pickupDate);
    if (range.returnDate && !errors.returnDate) params.set('devolucao', range.returnDate);

    const query = params.toString();
    router.replace(query ? `/frota?${query}` : '/frota', { scroll: false });
  }, [range.pickupDate, range.returnDate, errors.pickupDate, errors.returnDate, router]);

  const categories = useMemo(
    () => [...new Set(vehicles.map((vehicle) => vehicle.category))],
    [vehicles],
  );
  const transmissions = useMemo(
    () => [...new Set(vehicles.map((vehicle) => vehicle.transmission))],
    [vehicles],
  );
  const fuels = useMemo(() => [...new Set(vehicles.map((vehicle) => vehicle.fuel))], [vehicles]);

  const results = useMemo(() => {
    return vehicles.filter((vehicle) => {
      if (filters.category !== 'todas' && vehicle.category !== filters.category) return false;
      if (filters.transmission !== 'todos' && vehicle.transmission !== filters.transmission) {
        return false;
      }
      if (filters.fuel !== 'todos' && vehicle.fuel !== filters.fuel) return false;

      if (filters.onlyAvailable) {
        const availability = checkAvailability(
          vehicle,
          hasRange ? range.pickupDate : undefined,
          hasRange ? range.returnDate : undefined,
        );
        if (!availability.available) return false;
      }

      return true;
    });
  }, [vehicles, filters, hasRange, range.pickupDate, range.returnDate]);

  const activeFilterCount =
    (filters.category !== 'todas' ? 1 : 0) +
    (filters.transmission !== 'todos' ? 1 : 0) +
    (filters.fuel !== 'todos' ? 1 : 0) +
    (filters.onlyAvailable !== DEFAULT_FILTERS.onlyAvailable ? 1 : 0);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);
  const clearDates = () => setRange({ pickupDate: '', returnDate: '' });

  return (
    <div className="flex flex-col gap-8">
      {/* ------------------------------- Período ------------------------------- */}
      <section
        aria-label="Filtrar por período"
        className="rounded-2xl border border-mist-200 bg-white p-5 shadow-[0_14px_40px_-30px_rgba(10,25,48,0.5)] sm:p-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          <div className="lg:flex-1">
            <h2 className="font-display text-base font-bold text-ink">Escolha o período</h2>
            <p className="mt-1 mb-4 text-[0.8125rem] text-mist-600">
              Mostramos apenas o que está livre nas datas escolhidas.
            </p>
            <DateRangePicker value={range} onChange={setRange} errors={errors} />
          </div>

          <div className="flex flex-col justify-end gap-2 lg:w-64 lg:shrink-0 lg:pt-[4.75rem]">
            <p aria-live="polite" className="text-[0.8125rem] text-mist-600">
              {hasRange && days > 0 ? (
                <>
                  <strong className="font-semibold text-ink">{pluralizeDays(days)}</strong>{' '}
                  selecionadas
                </>
              ) : (
                'Sem datas selecionadas: você está vendo a frota completa.'
              )}
            </p>
            {(range.pickupDate || range.returnDate) && (
              <button
                type="button"
                onClick={clearDates}
                className="inline-flex w-fit items-center gap-1.5 rounded-full text-[0.8125rem] font-medium text-mist-600 underline underline-offset-4 transition-colors hover:text-ink"
              >
                <Close className="size-3.5" />
                Limpar datas
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------- Filtros ------------------------------- */}
      <section aria-label="Filtros da frota" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-mist-600" aria-live="polite">
            <strong className="font-display font-bold text-ink">{results.length}</strong>{' '}
            {results.length === 1 ? 'carro encontrado' : 'carros encontrados'}
            {hasRange && days > 0 ? ` para ${pluralizeDays(days)}` : ''}
          </p>

          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full text-[0.8125rem] font-medium text-mist-600 underline underline-offset-4 transition-colors hover:text-ink"
              >
                Limpar filtros
              </button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters((open) => !open)}
              aria-expanded={showFilters}
              aria-controls="painel-filtros"
              icon={<Filter className="size-4" />}
              className="lg:hidden"
            >
              Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Button>
          </div>
        </div>

        <div
          id="painel-filtros"
          className={cn(
            'flex-col gap-4 rounded-2xl border border-mist-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-5 sm:p-5',
            showFilters ? 'flex' : 'hidden lg:flex',
          )}
        >
          <FilterSelect
            label="Categoria"
            value={filters.category}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, category: value as VehicleCategory | 'todas' }))
            }
            options={[
              { value: 'todas', label: 'Todas' },
              ...categories.map((category) => ({
                value: category,
                label: CATEGORY_LABELS[category],
              })),
            ]}
          />
          <FilterSelect
            label="Câmbio"
            value={filters.transmission}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, transmission: value as Transmission | 'todos' }))
            }
            options={[
              { value: 'todos', label: 'Todos' },
              ...transmissions.map((transmission) => ({
                value: transmission,
                label: TRANSMISSION_LABELS[transmission],
              })),
            ]}
          />
          <FilterSelect
            label="Combustível"
            value={filters.fuel}
            onChange={(value) => setFilters((prev) => ({ ...prev, fuel: value as Fuel | 'todos' }))}
            options={[
              { value: 'todos', label: 'Todos' },
              ...fuels.map((fuel) => ({ value: fuel, label: FUEL_LABELS[fuel] })),
            ]}
          />

          <label className="flex cursor-pointer items-center gap-2.5 py-2 text-sm text-ink select-none sm:ml-auto">
            <input
              type="checkbox"
              checked={filters.onlyAvailable}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, onlyAvailable: event.target.checked }))
              }
              className="size-4.5 rounded border-mist-300 accent-accent-600"
            />
            Mostrar apenas disponíveis
          </label>
        </div>
      </section>

      {/* ------------------------------ Resultados ----------------------------- */}
      {results.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((vehicle, index) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              range={hasRange ? range : undefined}
              priority={index < 3}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            hasRange
              ? 'Nenhum carro disponível para essas datas.'
              : 'Nenhum carro encontrado com esses filtros.'
          }
          description={
            hasRange
              ? 'Tente ajustar o período ou tirar alguns filtros. Se precisar mesmo desse intervalo, fale com a gente: às vezes conseguimos encaixar.'
              : 'Tente tirar alguns filtros para ver mais opções da frota.'
          }
          pickupDate={range.pickupDate || undefined}
          returnDate={range.returnDate || undefined}
          action={
            <Button
              variant="outline"
              onClick={() => {
                resetFilters();
                clearDates();
              }}
            >
              Ver outras datas
            </Button>
          }
        />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-52">
      <span className="text-[0.8125rem] font-semibold text-ink-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-mist-300 bg-white px-3 text-sm text-ink transition-colors outline-none focus:border-ink"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
