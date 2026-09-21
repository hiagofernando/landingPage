/**
 * Assinatura dos links "Fechar locação" e "Liberar carro" da ficha.
 *
 * O link vai para o WhatsApp da equipe e não pode ser adivinhável: quem tiver
 * a referência de um pedido (ela aparece na mensagem do cliente) não pode
 * conseguir fechar ou liberar o carro só trocando a palavra na URL. Cada ação
 * tem a sua assinatura, feita com o segredo que só o servidor conhece.
 *
 * Usa Web Crypto, que existe tanto no Worker quanto no Node 20.
 */
import { timingSafeEqual } from './http';

export type NegotiationAction = 'fechar' | 'liberar';

export const NEGOTIATION_ACTIONS: readonly NegotiationAction[] = ['fechar', 'liberar'];

/** Tamanho do token na URL. 32 caracteres base64url = 192 bits. */
const TOKEN_LENGTH = 32;

function base64url(bytes: ArrayBuffer): string {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function isNegotiationAction(value: unknown): value is NegotiationAction {
  return value === 'fechar' || value === 'liberar';
}

/** Token que autoriza `action` sobre o pedido `ref`. */
export async function signAction(
  secret: string,
  ref: string,
  action: NegotiationAction,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${ref}:${action}`),
  );
  return base64url(signature).slice(0, TOKEN_LENGTH);
}

/** Confere o token (em tempo constante — ver `timingSafeEqual`). */
export async function verifyAction(
  secret: string,
  ref: string,
  action: NegotiationAction,
  token: unknown,
): Promise<boolean> {
  if (typeof token !== 'string' || token.length !== TOKEN_LENGTH) return false;
  return timingSafeEqual(await signAction(secret, ref, action), token);
}
