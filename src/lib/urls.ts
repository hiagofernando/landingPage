import type {
  DateRange,
  FleetFilters,
  Fuel,
  ISODate,
  Transmission,
  VehicleCategory,
} from '@/types';
import { isValidISODate } from './dates';
import { CATEGORY_LABELS, FUEL_LABELS, TRANSMISSION_LABELS } from './format';

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

/* -------------------------------------------------------------------------- */
/*  FILTROS DA FROTA NA URL                                                    */
/* -------------------------------------------------------------------------- */

/** Nomes dos filtros na URL, em português, para o link ficar legível. */
export const FILTER_PARAMS = {
  category: 'categoria',
  transmission: 'cambio',
  fuel: 'combustivel',
  onlyAvailable: 'disponiveis',
} as const;

/** Filtros aplicados quando a URL não diz nada. */
export const DEFAULT_FLEET_FILTERS: FleetFilters = {
  category: 'todas',
  transmission: 'todos',
  fuel: 'todos',
  onlyAvailable: true,
};

/**
 * Lê os filtros da frota a partir da query string.
 *
 * Só aceita valor que exista de fato nos rótulos do projeto: a URL é
 * digitável e compartilhável, então `?categoria=foguete` tem que cair no
 * padrão em vez de esvaziar a lista sem explicação nenhuma.
 */
export function readFleetFilters(params: URLSearchParams): FleetFilters {
  const category = params.get(FILTER_PARAMS.category);
  const transmission = params.get(FILTER_PARAMS.transmission);
  const fuel = params.get(FILTER_PARAMS.fuel);
  const onlyAvailable = params.get(FILTER_PARAMS.onlyAvailable);

  return {
    category: category && category in CATEGORY_LABELS ? (category as VehicleCategory) : 'todas',
    transmission:
      transmission && transmission in TRANSMISSION_LABELS
        ? (transmission as Transmission)
        : 'todos',
    fuel: fuel && fuel in FUEL_LABELS ? (fuel as Fuel) : 'todos',
    onlyAvailable:
      onlyAvailable === null ? DEFAULT_FLEET_FILTERS.onlyAvailable : onlyAvailable !== '0',
  };
}

/**
 * Query string da frota com período e filtros.
 *
 * Só escreve o que difere do padrão: assim a URL de quem não mexeu em nada
 * continua sendo `/frota`, limpa.
 */
export function fleetQuery(range: DateRange, filters: FleetFilters): string {
  const params = new URLSearchParams(periodQuery(range));

  if (filters.category !== 'todas') params.set(FILTER_PARAMS.category, filters.category);
  if (filters.transmission !== 'todos') {
    params.set(FILTER_PARAMS.transmission, filters.transmission);
  }
  if (filters.fuel !== 'todos') params.set(FILTER_PARAMS.fuel, filters.fuel);
  if (filters.onlyAvailable !== DEFAULT_FLEET_FILTERS.onlyAvailable) {
    params.set(FILTER_PARAMS.onlyAvailable, filters.onlyAvailable ? '1' : '0');
  }

  return params.toString();
}
