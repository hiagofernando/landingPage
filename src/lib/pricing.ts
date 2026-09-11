import type { ISODate, Vehicle } from '@/types';
import { daysBetween } from './dates';

/**
 * ============================================================================
 *  REGRAS DE PREÇO — ALTERE AQUI
 * ============================================================================
 *  Todo o cálculo do site passa por este arquivo. Para mudar a política de
 *  preços da ROGAN (mínimo de diárias, pacotes, descontos, cupons) basta
 *  editar `pricingRules` e/ou `calculateQuote`.
 * ============================================================================
 */
export const pricingRules = {
  /** Número mínimo de diárias cobradas em qualquer locação. */
  minimumDays: 1,

  /**
   * Retirada e devolução no mesmo dia.
   * true  -> cobra 1 diária (padrão adotado).
   * false -> bloqueia a solicitação e pede uma data de devolução posterior.
   */
  sameDayCountsAsOneDay: true,

  /** A partir de quantas diárias o pacote semanal passa a valer. */
  weeklyThreshold: 7,

  /** A partir de quantas diárias o pacote mensal passa a valer. */
  monthlyThreshold: 30,

  /** Antecedência máxima permitida na busca (em dias). */
  maxAdvanceDays: 365,

  /**
   * Estrutura pronta para o futuro. Hoje nada disso está ativo —
   * o cálculo usa apenas os pacotes diário/semanal/mensal do veículo.
   */
  future: {
    /** Cupons de desconto: { CODIGO: percentual }. */
    coupons: {} as Record<string, number>,
    /** Multiplicadores sazonais: { '2026-12-20:2027-01-05': 1.2 }. */
    seasonalMultipliers: {} as Record<string, number>,
    /** Taxas opcionais (entrega, condutor adicional, etc). */
    extras: [] as { id: string; label: string; price: number }[],
  },
} as const;

export interface QuoteLine {
  label: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  /** Diárias efetivamente cobradas. */
  days: number;
  /** Soma das linhas antes de descontos. */
  subtotal: number;
  /** Economia obtida com os pacotes semanal/mensal. */
  discount: number;
  /** Valor estimado final. */
  total: number;
  /** Valor médio por diária no período. */
  averageDailyPrice: number;
  /** Detalhamento legível do cálculo. */
  lines: QuoteLine[];
  /** Quanto sairia se tudo fosse cobrado na diária cheia. */
  fullDailyTotal: number;
}

/**
 * Converte um período em quantidade de diárias cobradas.
 * Devolve 0 quando o período é inválido (devolução antes da retirada).
 */
export function calculateDays(pickupDate: ISODate, returnDate: ISODate): number {
  const rawDays = daysBetween(pickupDate, returnDate);
  if (rawDays < 0) return 0;
  if (rawDays === 0) {
    return pricingRules.sameDayCountsAsOneDay ? 1 : 0;
  }
  return Math.max(rawDays, pricingRules.minimumDays);
}

/**
 * Calcula a estimativa usando o melhor encaixe de pacotes:
 * blocos mensais -> blocos semanais -> diárias avulsas.
 *
 * Exemplo: 38 diárias = 1 mês + 1 semana + 1 diária.
 */
export function calculateQuote(vehicle: Vehicle, days: number): Quote {
  const lines: QuoteLine[] = [];

  if (days <= 0) {
    return {
      days: 0,
      subtotal: 0,
      discount: 0,
      total: 0,
      averageDailyPrice: 0,
      lines,
      fullDailyTotal: 0,
    };
  }

  let remaining = days;

  const monthlyBlocks =
    days >= pricingRules.monthlyThreshold
      ? Math.floor(remaining / pricingRules.monthlyThreshold)
      : 0;

  if (monthlyBlocks > 0) {
    remaining -= monthlyBlocks * pricingRules.monthlyThreshold;
    lines.push({
      label:
        monthlyBlocks === 1
          ? 'Pacote mensal (30 diárias)'
          : `Pacotes mensais (${monthlyBlocks}x 30 diárias)`,
      quantity: monthlyBlocks,
      unitPrice: vehicle.monthlyPrice,
      total: monthlyBlocks * vehicle.monthlyPrice,
    });
  }

  const weeklyBlocks = Math.floor(remaining / pricingRules.weeklyThreshold);
  if (weeklyBlocks > 0) {
    remaining -= weeklyBlocks * pricingRules.weeklyThreshold;
    lines.push({
      label:
        weeklyBlocks === 1
          ? 'Pacote semanal (7 diárias)'
          : `Pacotes semanais (${weeklyBlocks}x 7 diárias)`,
      quantity: weeklyBlocks,
      unitPrice: vehicle.weeklyPrice,
      total: weeklyBlocks * vehicle.weeklyPrice,
    });
  }

  if (remaining > 0) {
    lines.push({
      label: remaining === 1 ? 'Diária avulsa' : `Diárias avulsas (${remaining}x)`,
      quantity: remaining,
      unitPrice: vehicle.dailyPrice,
      total: remaining * vehicle.dailyPrice,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  const fullDailyTotal = days * vehicle.dailyPrice;
  const total = roundCurrency(subtotal);

  return {
    days,
    subtotal: roundCurrency(subtotal),
    discount: roundCurrency(Math.max(0, fullDailyTotal - subtotal)),
    total,
    averageDailyPrice: roundCurrency(total / days),
    lines,
    fullDailyTotal: roundCurrency(fullDailyTotal),
  };
}

/** Atalho para calcular direto a partir das datas. */
export function quoteForPeriod(vehicle: Vehicle, pickupDate: ISODate, returnDate: ISODate): Quote {
  return calculateQuote(vehicle, calculateDays(pickupDate, returnDate));
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
