import { getDataStore, getSecret } from '@/lib/cloudflare';
import { json, readJsonObject } from '@/lib/http';
import { normalizeRef } from '@/lib/negotiations';
import { closeNegotiation, releaseNegotiation } from '@/lib/negotiation-store';
import { isNegotiationAction, verifyAction } from '@/lib/negotiation-tokens';

/**
 * ============================================================================
 *  NEGOCIAÇÕES — PASSO 3 DE 3
 * ============================================================================
 *  A equipe tocou em "Fechar locação" ou "Liberar carro" na ficha, confirmou
 *  na página `/negociacao/[ref]`, e o botão de lá chama isto.
 *
 *  Corpo: { "acao": "fechar" | "liberar", "t": "<token do link>" }
 *
 *  Sem login: quem prova a autorização é o token, assinado pelo servidor para
 *  AQUELA referência e AQUELA ação. Só existe na ficha que foi para a equipe.
 * ============================================================================
 */

export const dynamic = 'force-dynamic';

const TAMANHO_MAXIMO = 300;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ref: string }> },
): Promise<Response> {
  const ref = normalizeRef((await params).ref);
  const input = await readJsonObject(request, TAMANHO_MAXIMO);
  const action = input?.acao;

  if (!ref || !isNegotiationAction(action)) return json({ erro: 'pedido inválido' }, 400);

  const secret = await getSecret('ROGAN_API_SECRET');
  const store = await getDataStore();
  if (!secret || !store) return json({ erro: 'servidor não configurado' }, 503);

  if (!(await verifyAction(secret, ref, action, input?.t))) {
    return json({ erro: 'link inválido' }, 403);
  }

  if (action === 'fechar') {
    const closed = await closeNegotiation(store, ref);
    return closed
      ? json({ status: closed.status })
      : json({ erro: 'negociação não encontrada' }, 404);
  }

  const released = await releaseNegotiation(store, ref);
  return released ? json({ status: 'liberado' }) : json({ erro: 'negociação não encontrada' }, 404);
}
