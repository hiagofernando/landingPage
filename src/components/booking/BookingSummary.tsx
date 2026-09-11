import type { Vehicle } from '@/types';
import type { Quote } from '@/lib/pricing';
import { formatDateBR, pluralizeDays } from '@/lib/dates';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/cn';

interface BookingSummaryProps {
  vehicle: Vehicle;
  pickupDate: string;
  returnDate: string;
  quote: Quote;
  /** Mostra o detalhamento por pacote (mensal/semanal/diária). */
  showBreakdown?: boolean;
  className?: string;
}

/** Resumo do que será enviado para o WhatsApp. */
export function BookingSummary({
  vehicle,
  pickupDate,
  returnDate,
  quote,
  showBreakdown = true,
  className,
}: BookingSummaryProps) {
  return (
    <div className={cn('rounded-2xl border border-mist-200 bg-mist-100/60 p-4 sm:p-5', className)}>
      <dl className="flex flex-col gap-2.5 text-sm">
        <Row label="Veículo" value={`${vehicle.name} ${vehicle.year}`} />
        <Row label="Retirada" value={formatDateBR(pickupDate) || '—'} />
        <Row label="Devolução" value={formatDateBR(returnDate) || '—'} />
        <Row label="Período" value={quote.days > 0 ? pluralizeDays(quote.days) : '—'} />

        {/* As linhas do detalhamento ficam como filhas diretas do <dl>:
            um <div> dentro de <dl> só pode conter pares <dt>/<dd>. */}
        {showBreakdown &&
          quote.lines.map((line, index) => (
            <div
              key={line.label}
              className={cn(
                'flex justify-between gap-4 text-xs text-mist-600',
                index === 0 && 'mt-1 border-t border-mist-300 pt-3',
              )}
            >
              <dt>{line.label}</dt>
              <dd className="shrink-0 tabular-nums">{formatCurrency(line.total)}</dd>
            </div>
          ))}

        {showBreakdown && quote.discount > 0 && (
          <div className="flex justify-between gap-4 text-xs font-medium text-success">
            <dt>Economia com pacote</dt>
            <dd className="shrink-0 tabular-nums">−{formatCurrency(quote.discount)}</dd>
          </div>
        )}

        <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-mist-300 pt-3">
          <dt className="text-sm font-semibold text-ink">Valor estimado</dt>
          <dd className="font-display text-xl font-bold text-ink tabular-nums">
            {quote.days > 0 ? formatCurrency(quote.total) : '—'}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-[0.6875rem] leading-relaxed text-mist-600">
        Valor estimado com base na diária do veículo e no período escolhido. A confirmação da
        disponibilidade e as condições da locação são tratadas pela nossa equipe no WhatsApp.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-mist-600">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
