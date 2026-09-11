'use client';

import { useMemo } from 'react';
import type { DateRange } from '@/types';
import { addDays, formatDateLong, isBefore, isValidISODate, today } from '@/lib/dates';
import { pricingRules } from '@/lib/pricing';
import { cn } from '@/lib/cn';
import { Field } from '@/components/ui/Field';

interface DateRangePickerProps {
  value: DateRange;
  onChange: (value: DateRange) => void;
  errors?: { pickupDate?: string; returnDate?: string };
  tone?: 'default' | 'light';
  className?: string;
  labels?: { pickup?: string; return?: string };
}

/**
 * Seleção de retirada e devolução.
 *
 * Usa `input[type=date]` de propósito: no celular abre o seletor nativo do
 * sistema, que é mais rápido e mais acessível do que qualquer calendário
 * customizado — e não custa nenhum KB de JavaScript.
 *
 * Regras aplicadas aqui:
 *  - não permite datas passadas;
 *  - ao escolher uma retirada posterior à devolução, a devolução acompanha;
 *  - a devolução nunca fica antes da retirada.
 */
export function DateRangePicker({
  value,
  onChange,
  errors,
  tone = 'default',
  className,
  labels,
}: DateRangePickerProps) {
  const minDate = useMemo(() => today(), []);
  const maxDate = useMemo(() => addDays(minDate, pricingRules.maxAdvanceDays), [minDate]);

  const handlePickupChange = (pickupDate: string) => {
    let returnDate = value.returnDate;

    // Devolução antes da retirada não faz sentido: empurra para a mesma data.
    if (
      isValidISODate(pickupDate) &&
      isValidISODate(returnDate) &&
      isBefore(returnDate, pickupDate)
    ) {
      returnDate = pricingRules.sameDayCountsAsOneDay ? pickupDate : addDays(pickupDate, 1);
    }

    onChange({ pickupDate, returnDate });
  };

  const minReturn =
    isValidISODate(value.pickupDate) && !isBefore(value.pickupDate, minDate)
      ? pricingRules.sameDayCountsAsOneDay
        ? value.pickupDate
        : addDays(value.pickupDate, 1)
      : minDate;

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 sm:gap-4', className)}>
      <Field
        label={labels?.pickup ?? 'Retirada'}
        type="date"
        tone={tone}
        value={value.pickupDate}
        min={minDate}
        max={maxDate}
        error={errors?.pickupDate}
        // Repetimos a data por extenso: o formato do campo nativo segue o
        // idioma do navegador, e nem todo usuário está em pt-BR.
        hint={isValidISODate(value.pickupDate) ? formatDateLong(value.pickupDate) : undefined}
        onChange={(event) => handlePickupChange(event.target.value)}
        autoComplete="off"
      />
      <Field
        label={labels?.return ?? 'Devolução'}
        type="date"
        tone={tone}
        value={value.returnDate}
        min={minReturn}
        max={maxDate}
        error={errors?.returnDate}
        hint={isValidISODate(value.returnDate) ? formatDateLong(value.returnDate) : undefined}
        onChange={(event) => onChange({ ...value, returnDate: event.target.value })}
        autoComplete="off"
      />
    </div>
  );
}
