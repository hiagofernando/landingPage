import { Badge } from '@/components/ui/Badge';

/**
 * Aviso de que as datas escolhidas já estão sendo negociadas por outra pessoa.
 *
 * O texto deixa claro que ainda dá para pedir (decisão da ROGAN: o selo não
 * bloqueia). Quem pede agora entra na fila caso a primeira negociação caia —
 * e o selo, sozinho, já mostra que o carro é procurado.
 */
export function NegotiationNotice() {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-accent/25 bg-accent-100/60 p-4 text-sm text-ink-700"
    >
      <span
        aria-hidden="true"
        className="mt-1.5 size-2 shrink-0 animate-pulse rounded-full bg-accent-600"
      />
      <div>
        <p className="font-semibold text-ink">Em negociação para estas datas</p>
        <p className="mt-1 leading-relaxed text-mist-600">
          Outro cliente está conversando com a equipe sobre este carro neste período. Você ainda
          pode enviar o seu pedido: se a outra negociação não fechar, a gente te chama.
        </p>
      </div>
    </div>
  );
}

/** Selo curto para o canto da foto nos cards da frota. */
export function NegotiationBadge() {
  return (
    <Badge
      tone="accent"
      icon={
        <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-accent-600" />
      }
    >
      Em negociação
    </Badge>
  );
}
