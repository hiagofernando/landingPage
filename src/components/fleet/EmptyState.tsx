import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { WhatsApp } from '@/components/ui/Icons';
import { buildWhatsAppUrl, noResultsMessage } from '@/lib/whatsapp';

interface EmptyStateProps {
  title: string;
  description: string;
  pickupDate?: string;
  returnDate?: string;
  /** Ação principal (ex.: limpar filtros / ver outras datas). */
  action?: ReactNode;
}

/** Estado vazio: nunca deixa o usuário sem um próximo passo claro. */
export function EmptyState({
  title,
  description,
  pickupDate,
  returnDate,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-mist-300 bg-white px-6 py-14 text-center">
      <span
        aria-hidden="true"
        className="grid size-14 place-items-center rounded-full bg-mist-100 text-mist-500"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="size-7"
        >
          <path d="M3 13.5h18M5.5 13.5 7 8.2A2.5 2.5 0 0 1 9.4 6.3h5.2A2.5 2.5 0 0 1 17 8.2l1.5 5.3" />
          <path d="M4 13.5V18h16v-4.5" strokeLinecap="round" />
          <circle cx="7.6" cy="17.8" r="1.4" />
          <circle cx="16.4" cy="17.8" r="1.4" />
        </svg>
      </span>

      <div className="max-w-md">
        <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-mist-600">{description}</p>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        {action}
        <Button
          href={buildWhatsAppUrl(noResultsMessage(pickupDate, returnDate))}
          external
          variant="whatsapp"
          icon={<WhatsApp className="size-4" />}
        >
          Falar com a ROGAN
        </Button>
      </div>
    </div>
  );
}
