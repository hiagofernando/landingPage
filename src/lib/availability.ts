import type { ISODate, Vehicle } from '@/types';
import { isValidISODate, rangesOverlap } from './dates';

/**
 * Camada de disponibilidade.
 *
 * Hoje a checagem é feita sobre `vehicle.unavailablePeriods`, que vem do
 * arquivo de dados demonstrativos. Quando existir banco de dados, troque
 * apenas `isVehicleAvailable` por uma consulta do tipo:
 *
 *   SELECT 1 FROM bookings
 *    WHERE vehicle_id = $1
 *      AND status IN ('confirmada', 'em_atendimento')
 *      AND daterange(pickup_date, return_date, '[]') && daterange($2, $3, '[]')
 *
 * A assinatura da função foi mantida síncrona de propósito: ela é usada em
 * filtros na interface. Para uma consulta remota, pré-carregue os períodos
 * bloqueados no `repository` e mantenha esta função pura.
 */

export type AvailabilityReason = 'disponivel' | 'inativo' | 'manutencao' | 'periodo_ocupado';

export interface AvailabilityResult {
  available: boolean;
  reason: AvailabilityReason;
  message: string;
}

/** O veículo está no catálogo e apto a ser locado? */
export function isVehicleBookable(vehicle: Vehicle): boolean {
  return vehicle.available && vehicle.status === 'ativo';
}

export function checkAvailability(
  vehicle: Vehicle,
  pickupDate?: ISODate | '',
  returnDate?: ISODate | '',
): AvailabilityResult {
  if (!vehicle.available || vehicle.status === 'inativo') {
    return {
      available: false,
      reason: 'inativo',
      message: 'Indisponível no momento',
    };
  }

  if (vehicle.status === 'manutencao') {
    return {
      available: false,
      reason: 'manutencao',
      message: 'Em manutenção',
    };
  }

  // Sem datas selecionadas consideramos o veículo disponível no catálogo.
  if (!isValidISODate(pickupDate) || !isValidISODate(returnDate)) {
    return { available: true, reason: 'disponivel', message: 'Disponível' };
  }

  const conflict = vehicle.unavailablePeriods.find((period) =>
    rangesOverlap(pickupDate, returnDate, period.start, period.end),
  );

  if (conflict) {
    return {
      available: false,
      reason: 'periodo_ocupado',
      message: 'Indisponível para estas datas',
    };
  }

  return { available: true, reason: 'disponivel', message: 'Disponível para estas datas' };
}

export function isVehicleAvailable(
  vehicle: Vehicle,
  pickupDate?: ISODate | '',
  returnDate?: ISODate | '',
): boolean {
  return checkAvailability(vehicle, pickupDate, returnDate).available;
}

/** Filtra a frota pelo período informado. */
export function filterAvailableVehicles(
  vehicles: Vehicle[],
  pickupDate?: ISODate | '',
  returnDate?: ISODate | '',
): Vehicle[] {
  return vehicles.filter((vehicle) => isVehicleAvailable(vehicle, pickupDate, returnDate));
}

/** Sugere alternativas quando o veículo escolhido está ocupado. */
export function suggestAlternatives(
  vehicles: Vehicle[],
  currentVehicle: Vehicle,
  pickupDate?: ISODate | '',
  returnDate?: ISODate | '',
  limit = 3,
): Vehicle[] {
  const candidates = vehicles.filter(
    (vehicle) =>
      vehicle.id !== currentVehicle.id && isVehicleAvailable(vehicle, pickupDate, returnDate),
  );

  // Prioriza a mesma categoria e, depois, a menor diferença de preço.
  return candidates
    .sort((a, b) => {
      const sameCategoryA = a.category === currentVehicle.category ? 0 : 1;
      const sameCategoryB = b.category === currentVehicle.category ? 0 : 1;
      if (sameCategoryA !== sameCategoryB) return sameCategoryA - sameCategoryB;
      return (
        Math.abs(a.dailyPrice - currentVehicle.dailyPrice) -
        Math.abs(b.dailyPrice - currentVehicle.dailyPrice)
      );
    })
    .slice(0, limit);
}
