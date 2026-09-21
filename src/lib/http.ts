/**
 * Utilitários das rotas da API. Só servidor.
 */

/**
 * Lê o corpo como JSON, recusando o que passar de `maxBytes`.
 *
 * Devolve `null` para corpo grande demais, JSON inválido ou qualquer coisa que
 * não seja um objeto — as rotas respondem 400 e seguem a vida.
 */
export async function readJsonObject(
  request: Request,
  maxBytes: number,
): Promise<Record<string, unknown> | null> {
  try {
    const raw = await request.text();
    if (raw.length > maxBytes) return null;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** Texto curto e limpo, ou `undefined`. Nunca confie no que vem de fora. */
export function asText(value: unknown, maxLength = 120): string | undefined {
  if (typeof value !== 'string') return undefined;
  const clean = value.trim().slice(0, maxLength);
  return clean.length > 0 ? clean : undefined;
}

/** Número positivo e finito, ou `undefined`. */
export function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
}

/**
 * Compara dois textos em tempo constante.
 *
 * Com `===` a comparação para no primeiro caractere diferente, e o tempo de
 * resposta vaza quantos caracteres do começo estavam certos — dá para
 * descobrir um segredo letra por letra.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index++) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

/** Resposta JSON sem cache — o padrão para rota que muda estado. */
export function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}
