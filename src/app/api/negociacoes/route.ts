import { getDataStore, getSecret } from '@/lib/cloudflare';
import { asText, json, readJsonObject, timingSafeEqual } from '@/lib/http';
import { normalizeRef } from '@/lib/negotiations';
import { listPublicNegotiations, startNegotiation } from '@/lib/negotiation-store';
import { signAction } from '@/lib/negotiation-tokens';

/**
 * ============================================================================
 *  NEGOCIAÇÕES — PASSO 2 DE 3 (POST) E A LISTA PÚBLICA (GET)
 * ============================================================================
 *
 *  GET  — público. O navegador busca para desenhar o selo "Em negociação" e
 *         esconder períodos já locados. Só carro, datas e situação.
 *
 *  POST — só a automação do WhatsApp (Showroom, no n8n). Chamado quando chega
 *         uma mensagem com `ref XXXXXX`. Abre a negociação e devolve os dois
 *         links assinados que vão na ficha da equipe.
 *
 *         Cabeçalho:  Authorization: Bearer <ROGAN_API_SECRET>
 *         Corpo:      { "ref": "7F2KAX", "contato": "5581999998888" }
 *
 *         Pode ser chamado a cada mensagem: é idempotente.
 * ============================================================================
 */

export const dynamic = 'force-dynamic';

const TAMANHO_MAXIMO = 500;
const SECRET_NAME = 'ROGAN_API_SECRET';

export async function GET(): Promise<Response> {
  const store = await getDataStore();

  // Sem armazenamento a lista fica vazia em vez de dar erro: o site continua
  // funcionando, só não mostra selo. O problema aparece no log.
  if (!store) {
    console.error('[rogan] lista de negociações vazia: binding ROGAN_KV ausente');
    return json({ negociacoes: [] });
  }

  const negotiations = await listPublicNegotiations(store);
  return json({ negociacoes: negotiations }, 200, {
    // A mesma resposta serve para todos os visitantes: a borda pode segurar
    // 30 s, e cada página não vira uma leitura no KV.
    //
    // Sem `stale-while-revalidate` de propósito: o navegador também respeita
    // essa diretiva, e com ela mostrava uma lista velha por até um minuto —
    // um carro recém-locado aparecia livre para quem já tinha o site aberto.
    'Cache-Control': 'public, max-age=0, s-maxage=30',
  });
}

export async function POST(request: Request): Promise<Response> {
  const secret = await getSecret(SECRET_NAME);
  if (!secret) {
    console.error(`[rogan] ${SECRET_NAME} não configurado: automação bloqueada`);
    return json({ erro: 'servidor sem segredo configurado' }, 503);
  }

  const authorization = request.headers.get('authorization') ?? '';
  if (!timingSafeEqual(authorization, `Bearer ${secret}`)) {
    return json({ erro: 'não autorizado' }, 401);
  }

  const input = await readJsonObject(request, TAMANHO_MAXIMO);
  const ref = normalizeRef(input?.ref);
  if (!ref) return json({ erro: 'ref inválida' }, 400);

  const store = await getDataStore();
  if (!store) return json({ erro: 'armazenamento não configurado' }, 503);

  // A automação manda o chatid da Evolution ("5581...@s.whatsapp.net"); só os
  // dígitos interessam.
  const contact = asText(input?.contato)?.split('@')[0]?.replace(/\D/g, '') || undefined;

  const negotiation = await startNegotiation(store, ref, contact);
  if (!negotiation) {
    // Referência que o site não emitiu, ou pedido que expirou. A automação
    // segue a conversa normalmente, só sem selo no site.
    return json({ erro: 'pedido não encontrado' }, 404);
  }

  // Os links apontam para uma PÁGINA de confirmação, não direto para a ação:
  // o WhatsApp abre todo link para montar a prévia, e um GET que fechasse a
  // locação seria disparado sozinho só de a ficha chegar.
  const origin = new URL(request.url).origin;
  const link = async (action: 'fechar' | 'liberar') =>
    `${origin}/negociacao/${ref}?acao=${action}&t=${await signAction(secret, ref, action)}`;

  return json({
    status: negotiation.status,
    ref,
    veiculo: negotiation.vehicleSlug,
    codigo: negotiation.code,
    retirada: negotiation.pickupDate,
    devolucao: negotiation.returnDate,
    fecharUrl: await link('fechar'),
    liberarUrl: await link('liberar'),
  });
}
