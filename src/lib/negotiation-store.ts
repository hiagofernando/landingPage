import type { ISODate, NegotiationStatus, PublicNegotiation, Vehicle } from '@/types';
import type { KVStore } from './cloudflare';
import { addDays, isBefore, today } from './dates';

/**
 * ============================================================================
 *  NEGOCIAÇÕES — O QUE FICA GUARDADO
 * ============================================================================
 *  Toda a leitura e escrita de estado das negociações passa por aqui, sobre a
 *  interface `KVStore`. As rotas da API só validam a entrada e chamam estas
 *  funções — e os testes rodam o ciclo inteiro com o KV em memória.
 *
 *  Chaves:
 *    pedido:<ref>      pedido do site que ainda não chegou no WhatsApp
 *    negociacao:<ref>  mensagem chegou; em negociação ou já locado
 *
 *  Validade:
 *    - pedido que ninguém enviou some em 48h (é só o clique, não é negócio);
 *    - negociação NÃO expira enquanto as datas estão valendo — só a equipe
 *      libera (decisão da ROGAN). Uma semana depois da devolução a chave é
 *      apagada sozinha: nessa altura o período já passou e ela não serve para
 *      mais nada.
 * ============================================================================
 */

const PENDING_PREFIX = 'pedido:';
const NEGOTIATION_PREFIX = 'negociacao:';

const PENDING_TTL_SECONDS = 60 * 60 * 48;
const CLEANUP_DAYS_AFTER_RETURN = 7;

/** O KV recusa expiração a menos de 60 s. Uma hora de folga evita a borda. */
const MIN_EXPIRATION_SECONDS = 60 * 60;

export interface PendingRequest {
  ref: string;
  vehicleSlug: string;
  /** `Vehicle.code`. */
  code: string;
  pickupDate: ISODate;
  returnDate: ISODate;
  createdAt: string;
}

export interface Negotiation extends PendingRequest {
  status: NegotiationStatus;
  /** WhatsApp de onde a mensagem chegou, informado pela automação. */
  contact?: string;
  startedAt: string;
  closedAt?: string;
}

/**
 * Metadados gravados junto da chave. O KV devolve metadados na listagem, então
 * a lista pública sai de UMA chamada, sem abrir negociação por negociação.
 */
interface NegotiationMetadata {
  c: string;
  p: ISODate;
  r: ISODate;
  s: 'n' | 'l';
}

function toMetadata(negotiation: Negotiation): NegotiationMetadata {
  return {
    c: negotiation.code,
    p: negotiation.pickupDate,
    r: negotiation.returnDate,
    s: negotiation.status === 'locado' ? 'l' : 'n',
  };
}

function isMetadata(value: unknown): value is NegotiationMetadata {
  const meta = value as NegotiationMetadata | undefined;
  return (
    typeof meta?.c === 'string' &&
    typeof meta.p === 'string' &&
    typeof meta.r === 'string' &&
    (meta.s === 'n' || meta.s === 'l')
  );
}

/** Quando apagar a chave: fim do dia, uma semana depois da devolução. */
function cleanupExpiration(returnDate: ISODate): number {
  const cleanupDay = addDays(returnDate, CLEANUP_DAYS_AFTER_RETURN);
  const seconds = Math.floor(Date.parse(`${cleanupDay}T23:59:59-03:00`) / 1000);
  return Math.max(seconds, Math.floor(Date.now() / 1000) + MIN_EXPIRATION_SECONDS);
}

function parse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function save(kv: KVStore, negotiation: Negotiation): Promise<void> {
  await kv.put(`${NEGOTIATION_PREFIX}${negotiation.ref}`, JSON.stringify(negotiation), {
    metadata: toMetadata(negotiation),
    expiration: cleanupExpiration(negotiation.returnDate),
  });
}

/* -------------------------------------------------------------------------- */

export interface PendingInput {
  ref: string;
  vehicle: Vehicle;
  pickupDate: ISODate;
  returnDate: ISODate;
}

/**
 * Guarda o pedido feito no site, antes de a mensagem sair.
 *
 * Nunca sobrescreve: se a referência já existe (colisão rara ou reenvio), o
 * pedido original fica — é o que está escrito na mensagem de alguém.
 */
export async function createPending(
  kv: KVStore,
  input: PendingInput,
): Promise<'created' | 'exists'> {
  const [pending, negotiation] = await Promise.all([
    kv.get(`${PENDING_PREFIX}${input.ref}`),
    kv.get(`${NEGOTIATION_PREFIX}${input.ref}`),
  ]);
  if (pending || negotiation) return 'exists';

  const record: PendingRequest = {
    ref: input.ref,
    vehicleSlug: input.vehicle.slug,
    code: input.vehicle.code,
    pickupDate: input.pickupDate,
    returnDate: input.returnDate,
    createdAt: new Date().toISOString(),
  };

  await kv.put(`${PENDING_PREFIX}${input.ref}`, JSON.stringify(record), {
    expirationTtl: PENDING_TTL_SECONDS,
  });
  return 'created';
}

/**
 * A mensagem com esta referência chegou no WhatsApp: abre a negociação.
 *
 * Idempotente de propósito. A automação roda a cada mensagem que chega, e o
 * cliente pode reenviar a mensagem pronta — chamar duas vezes devolve a mesma
 * negociação, sem duplicar nem reabrir um período que a equipe já fechou.
 *
 * `null` quando não existe pedido com essa referência (expirou, ou alguém
 * digitou uma referência inventada).
 */
export async function startNegotiation(
  kv: KVStore,
  ref: string,
  contact?: string,
): Promise<Negotiation | null> {
  const existing = await getNegotiation(kv, ref);
  if (existing) return existing;

  const pending = parse<PendingRequest>(await kv.get(`${PENDING_PREFIX}${ref}`));
  if (!pending) return null;

  const negotiation: Negotiation = {
    ...pending,
    status: 'em_negociacao',
    contact,
    startedAt: new Date().toISOString(),
  };

  await save(kv, negotiation);
  await kv.delete(`${PENDING_PREFIX}${ref}`);
  return negotiation;
}

export async function getNegotiation(kv: KVStore, ref: string): Promise<Negotiation | null> {
  return parse<Negotiation>(await kv.get(`${NEGOTIATION_PREFIX}${ref}`));
}

/** A equipe fechou: o período vira indisponível no site. */
export async function closeNegotiation(kv: KVStore, ref: string): Promise<Negotiation | null> {
  const negotiation = await getNegotiation(kv, ref);
  if (!negotiation) return null;
  if (negotiation.status === 'locado') return negotiation;

  const closed: Negotiation = {
    ...negotiation,
    status: 'locado',
    closedAt: new Date().toISOString(),
  };
  await save(kv, closed);
  return closed;
}

/**
 * A equipe liberou: a negociação some e o período volta a ficar livre.
 * Vale também para desfazer um "fechar" tocado por engano.
 */
export async function releaseNegotiation(kv: KVStore, ref: string): Promise<boolean> {
  const negotiation = await getNegotiation(kv, ref);
  if (!negotiation) return false;
  await kv.delete(`${NEGOTIATION_PREFIX}${ref}`);
  return true;
}

/**
 * O que qualquer visitante pode ver: carro, datas e situação. Nada de nome,
 * telefone ou referência. Períodos já encerrados ficam de fora.
 */
export async function listPublicNegotiations(
  kv: KVStore,
  referenceDate: ISODate = today(),
): Promise<PublicNegotiation[]> {
  const result: PublicNegotiation[] = [];
  let cursor: string | undefined;

  do {
    const page = await kv.list({ prefix: NEGOTIATION_PREFIX, cursor });
    for (const key of page.keys) {
      if (!isMetadata(key.metadata)) continue;
      const { c, p, r, s } = key.metadata;
      if (isBefore(r, referenceDate)) continue;
      result.push({
        code: c,
        pickupDate: p,
        returnDate: r,
        status: s === 'l' ? 'locado' : 'em_negociacao',
      });
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return result;
}
