import type { Fuel, Transmission, VehicleCategory } from '@/types';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 189.9 -> "R$ 189,90" */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** 189.9 -> "R$ 190" (para cards e títulos, onde centavos poluem). */
export function formatCurrencyCompact(value: number): string {
  return compactCurrencyFormatter.format(value);
}

export const CATEGORY_LABELS: Record<VehicleCategory, string> = {
  hatch: 'Hatch',
  sedan: 'Sedã',
  suv: 'SUV',
  picape: 'Picape',
  utilitario: 'Utilitário',
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  manual: 'Manual',
  automatico: 'Automático',
};

export const FUEL_LABELS: Record<Fuel, string> = {
  flex: 'Flex',
  gasolina: 'Gasolina',
  etanol: 'Etanol',
  diesel: 'Diesel',
  hibrido: 'Híbrido',
  eletrico: 'Elétrico',
};

/** Máscara de telefone brasileiro aplicada enquanto o usuário digita. */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Capacidade do porta-malas em litros -> "285 L" */
export function formatTrunk(liters: number): string {
  return `${liters} L`;
}
