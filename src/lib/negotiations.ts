import type { ISODate, PublicNegotiation, Vehicle } from '@/types';
import { isValidISODate, rangesOverlap } from './dates';

/**
 * ============================================================================
 *  NEGOCIAÇÕES PELO WHATSAPP — REGRAS PURAS
 * ============================================================================
 *  O ciclo de um pedido:
 *
 *    1. o cliente clica em "Continuar pelo WhatsApp" → o site guarda um pedido
 *       PENDENTE com uma referência curta, que vai escrita na mensagem;
 *    2. a mensagem chega no WhatsApp do bot → a automação (Showroom, no n8n)
 *       lê a referência e avisa o site → o período fica EM NEGOCIAÇÃO;
 *    3. a equipe toca no link da ficha → LOCADO (vira período indisponível)
 *       ou LIBERADO (a negociação some).
 *
 *  Por que o passo 2 existe em vez de marcar direto no clique: clicar só
 *  prova que a pessoa abriu o WhatsApp. Se ela desistir antes de enviar, o
 *  carro ficaria em negociação à toa. Só o WhatsApp sabe se a mensagem chegou.
 *
 *  A negociação vale para as DATAS pedidas, não para o carro inteiro: um
 *  carro negociado de 01 a 05/10 continua livre de 10 a 15/10. Carro alugado
 *  não é carro vendido.
 * ============================================================================
 */

/** Formato do código do carro (`Vehicle.code`). */
export const VEHICLE_CODE_PATTERN = /^[A-Z]{2}-\d{3,5}$/;

/**
 * As duas regex com que a automação do WhatsApp lê a mensagem.
 *
 * O n8n não importa este arquivo: elas estão copiadas no nó "Organizador WP".
 * Ficam aqui para que os testes garantam que o site escreve algo que a
 * automação consegue ler. Mudou uma, mude a outra.
 *
 * A de código é a mesma do Showroom original; a de referência é da variante
 * locadora.
 */
export const AUTOMATION_CODE_REGEX = /c[oó]d\.?\s*([A-Za-z]{2}-\d{3,5})/i;
export const AUTOMATION_REF_REGEX = /\bref\s+([A-Z2-9]{6})\b/i;

/**
 * Alfabeto da referência: sem 0/O, 1/I/L, para ninguém confundir se precisar
 * ditar ou redigitar a mensagem.
 */
const REF_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const REF_LENGTH = 6;

export const REF_PATTERN = new RegExp(`^[${REF_ALPHABET}]{${REF_LENGTH}}$`);

/** Referência nova para um pedido. ~887 milhões de combinações. */
export function generateRef(): string {
  const bytes = new Uint8Array(REF_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => REF_ALPHABET[byte % REF_ALPHABET.length]).join('');
}

/** Normaliza (maiúsculas, sem espaço) e valida uma referência. */
export function normalizeRef(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const ref = value.trim().toUpperCase();
  return REF_PATTERN.test(ref) ? ref : null;
}

/**
 * Etiqueta que vai no fim da mensagem do WhatsApp.
 *
 * `cód.` bate com a regex que o Showroom já usa; `ref` é o que liga a
 * mensagem ao pedido feito no site. Sem `ref` (ex.: "tirar dúvida"), a
 * mensagem ainda identifica o carro, mas não abre negociação — não há datas.
 */
export function messageTag(code: string, ref?: string): string {
  return ref ? `(cód. ${code} · ref ${ref})` : `(cód. ${code})`;
}

/**
 * Soma ao veículo os períodos já LOCADOS vindos do WhatsApp.
 *
 * Devolve um veículo novo: a checagem de disponibilidade continua a mesma
 * função pura de sempre, só que enxergando também o que foi fechado pela
 * equipe depois do último deploy.
 */
export function applyFleetStatus(vehicle: Vehicle, entries: PublicNegotiation[]): Vehicle {
  const rented = entries.filter(
    (entry) => entry.code === vehicle.code && entry.status === 'locado',
  );
  if (rented.length === 0) return vehicle;

  return {
    ...vehicle,
    unavailablePeriods: [
      ...vehicle.unavailablePeriods,
      ...rented.map((entry) => ({
        start: entry.pickupDate,
        end: entry.returnDate,
        reason: 'locado pelo WhatsApp',
      })),
    ],
  };
}

/**
 * Avisa o site do pedido que está saindo para o WhatsApp. Só no navegador.
 *
 * Fica FORA de `analytics.ts` de propósito: o medidor respeita "Não me
 * rastreie" e pula o envio, mas isto não é medição — sem este aviso a
 * negociação nunca abre e o selo não aparece. Também não leva nome nem
 * telefone.
 *
 * `sendBeacon` porque a aba está sendo trocada pelo WhatsApp neste instante.
 */
export function registerPendingRequest(input: {
  ref: string;
  vehicleSlug: string;
  pickupDate: ISODate;
  returnDate: ISODate;
}): void {
  if (typeof navigator === 'undefined') return;

  const body = JSON.stringify({
    ref: input.ref,
    veiculo: input.vehicleSlug,
    retirada: input.pickupDate,
    devolucao: input.returnDate,
  });

  try {
    const blob = new Blob([body], { type: 'application/json' });
    if (navigator.sendBeacon?.('/api/negociacoes/pedidos', blob)) return;
    void fetch('/api/negociacoes/pedidos', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Sem o aviso a conversa segue normal no WhatsApp, só sem selo no site.
  }
}

/**
 * O período escolhido cruza com uma negociação em andamento deste carro?
 *
 * Sem datas escolhidas a resposta é sempre `false`: a negociação vale para
 * datas específicas, então sem datas não há como dizer que ela atrapalha.
 */
export function isUnderNegotiation(
  vehicle: Vehicle,
  entries: PublicNegotiation[],
  pickupDate?: ISODate | '',
  returnDate?: ISODate | '',
): boolean {
  if (!isValidISODate(pickupDate) || !isValidISODate(returnDate)) return false;

  return entries.some(
    (entry) =>
      entry.code === vehicle.code &&
      entry.status === 'em_negociacao' &&
      rangesOverlap(pickupDate, returnDate, entry.pickupDate, entry.returnDate),
  );
}
