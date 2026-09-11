'use client';

import Link from 'next/link';
import { useDateRangeParams } from '@/hooks/useDateRangeParams';
import { fleetUrl } from '@/lib/urls';
import { ChevronLeft } from '@/components/ui/Icons';

/**
 * "Voltar para a frota" mantendo as datas que o cliente já escolheu —
 * sem isso ele teria que selecionar o período de novo.
 */
export function FleetBackLink() {
  const range = useDateRangeParams();

  return (
    <Link
      href={fleetUrl(range)}
      className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-ink underline underline-offset-4 transition-colors hover:text-accent-700"
    >
      <ChevronLeft className="size-4" />
      Voltar para a frota
    </Link>
  );
}
