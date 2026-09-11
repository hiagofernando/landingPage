import type { DateRange, ISODate } from '@/types';
import { isValidISODate } from './dates';

/**
 * Query string com o período escolhido, quando houver.
 * É o que mantém as datas do cliente ao navegar entre as páginas.
 */
export function periodQuery(range?: DateRange): string {
  const params = new URLSearchParams();
  if (isValidISODate(range?.pickupDate)) params.set('retirada', range.pickupDate as ISODate);
  if (isValidISODate(range?.returnDate)) params.set('devolucao', range.returnDate as ISODate);
  return params.toString();
}

/** URL da página do veículo preservando o período já escolhido. */
export function vehicleUrl(slug: string, range?: DateRange): string {
  const query = periodQuery(range);
  return query ? `/frota/${slug}?${query}` : `/frota/${slug}`;
}

/** URL da frota preservando o período já escolhido. */
export function fleetUrl(range?: DateRange): string {
  const query = periodQuery(range);
  return query ? `/frota?${query}` : '/frota';
}
