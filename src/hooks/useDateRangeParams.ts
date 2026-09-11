'use client';

import { useSearchParams } from 'next/navigation';
import type { DateRange } from '@/types';
import { isValidISODate } from '@/lib/dates';

/**
 * Lê o período da URL (?retirada=&devolucao=) no cliente.
 *
 * Fazemos isso no cliente — e não via `searchParams` no servidor — para que as
 * páginas continuem estáticas e sejam servidas pela CDN. Quem chega pela busca
 * da home navega pelo roteador, então os parâmetros já estão disponíveis sem
 * nenhum atraso perceptível.
 */
export function useDateRangeParams(): DateRange {
  const params = useSearchParams();
  const pickup = params.get('retirada');
  const returnDate = params.get('devolucao');

  return {
    pickupDate: isValidISODate(pickup) ? pickup : '',
    returnDate: isValidISODate(returnDate) ? returnDate : '',
  };
}
