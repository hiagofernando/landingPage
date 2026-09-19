'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { DateRange } from '@/types';
import { calculateDays } from '@/lib/pricing';
import { pluralizeDays } from '@/lib/dates';
import { hasErrors, validateDateRange } from '@/lib/validation';
import type { DateRangeErrors } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { Search } from '@/components/ui/Icons';
import { DateRangePicker } from './DateRangePicker';

interface SearchBarProps {
  /** `dark` fica sobre fundo claro; `light` sobre fundo escuro. */
  tone?: 'dark' | 'light';
  initialRange?: DateRange;
}

/**
 * Busca por período. Ao enviar, leva o usuário para a frota já filtrada
 * pelas datas — que ficam na URL, então o link pode ser compartilhado.
 */
export function SearchBar({ tone = 'dark', initialRange }: SearchBarProps) {
  const router = useRouter();
  const [range, setRange] = useState<DateRange>(initialRange ?? { pickupDate: '', returnDate: '' });
  const [errors, setErrors] = useState<DateRangeErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const days = calculateDays(range.pickupDate || '', range.returnDate || '');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validateDateRange(range.pickupDate, range.returnDate);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSubmitting(true);
    const params = new URLSearchParams({
      retirada: range.pickupDate,
      devolucao: range.returnDate,
    });
    router.push(`/frota?${params.toString()}`);
  };

  const light = tone === 'light';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="busca-titulo"
      className={
        light
          ? 'rounded-2xl border border-ink-700 bg-ink-900 p-5 sm:p-6'
          : 'rounded-2xl border border-mist-200 bg-white p-5 shadow-[0_18px_50px_-24px_rgba(10,25,48,0.28)] sm:p-6'
      }
    >
      <h2
        id="busca-titulo"
        className={`font-display text-lg font-bold sm:text-xl ${light ? 'text-paper' : 'text-ink'}`}
      >
        Encontre o carro ideal para a sua data
      </h2>
      <p className={`mt-1 text-sm ${light ? 'text-mist-400' : 'text-mist-600'}`}>
        Escolha o período e veja o que está disponível.
      </p>

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-start">
        <DateRangePicker
          value={range}
          onChange={(next) => {
            setRange(next);
            if (hasErrors(errors)) setErrors({});
          }}
          errors={errors}
          tone={light ? 'light' : 'default'}
          className="flex-1"
        />

        <Button
          type="submit"
          size="lg"
          variant="primary"
          disabled={submitting}
          className="w-full lg:mt-[1.6875rem] lg:w-auto lg:shrink-0"
          icon={<Search className="size-4" />}
        >
          {submitting ? 'Buscando...' : 'Ver carros disponíveis'}
        </Button>
      </div>

      <p aria-live="polite" className={`mt-4 text-xs ${light ? 'text-mist-500' : 'text-mist-600'}`}>
        {days > 0
          ? `Período selecionado: ${pluralizeDays(days)}.`
          : 'A quantidade de diárias aparece aqui assim que você escolher as duas datas.'}
      </p>
    </form>
  );
}
