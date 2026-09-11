import type { ReactNode } from 'react';
import type { Vehicle } from '@/types';
import { cn } from '@/lib/cn';
import { FUEL_LABELS, TRANSMISSION_LABELS, formatTrunk } from '@/lib/format';
import { Calendar, Door, Fuel, Gearbox, Luggage, Snowflake, Users } from '@/components/ui/Icons';

export interface SpecEntry {
  label: string;
  value: string;
  icon: ReactNode;
}

/** Ficha técnica do veículo em formato de lista reutilizável. */
export function getVehicleSpecs(vehicle: Vehicle, options: { full?: boolean } = {}): SpecEntry[] {
  const specs: SpecEntry[] = [
    {
      label: 'Passageiros',
      value: `${vehicle.seats} lugares`,
      icon: <Users className="size-full" />,
    },
    {
      label: 'Câmbio',
      value: TRANSMISSION_LABELS[vehicle.transmission],
      icon: <Gearbox className="size-full" />,
    },
    {
      label: 'Combustível',
      value: FUEL_LABELS[vehicle.fuel],
      icon: <Fuel className="size-full" />,
    },
    {
      label: 'Porta-malas',
      value: formatTrunk(vehicle.trunk),
      icon: <Luggage className="size-full" />,
    },
  ];

  if (options.full) {
    specs.push(
      { label: 'Ano', value: String(vehicle.year), icon: <Calendar className="size-full" /> },
      { label: 'Portas', value: `${vehicle.doors} portas`, icon: <Door className="size-full" /> },
    );
    if (vehicle.airConditioning) {
      specs.push({
        label: 'Ar-condicionado',
        value: 'Sim',
        icon: <Snowflake className="size-full" />,
      });
    }
  }

  return specs;
}

/** Grade compacta usada no card da frota. */
export function VehicleSpecsRow({ vehicle, className }: { vehicle: Vehicle; className?: string }) {
  const specs = getVehicleSpecs(vehicle);
  return (
    <ul className={cn('grid grid-cols-2 gap-x-3 gap-y-2', className)}>
      {specs.map((spec) => (
        <li key={spec.label} className="flex items-center gap-2 text-[0.8125rem] text-mist-600">
          <span className="size-4 shrink-0 text-ink-500" aria-hidden="true">
            {spec.icon}
          </span>
          <span className="truncate">
            <span className="sr-only">{spec.label}: </span>
            {spec.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Ficha completa usada na página do veículo. */
export function VehicleSpecsGrid({ vehicle }: { vehicle: Vehicle }) {
  const specs = getVehicleSpecs(vehicle, { full: true });
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="flex flex-col gap-2 rounded-xl border border-mist-200 bg-white p-4"
        >
          <span className="size-5 text-accent-700" aria-hidden="true">
            {spec.icon}
          </span>
          <dt className="text-[0.6875rem] font-semibold tracking-[0.1em] text-mist-600 uppercase">
            {spec.label}
          </dt>
          <dd className="font-display text-[0.9375rem] font-semibold text-ink">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
