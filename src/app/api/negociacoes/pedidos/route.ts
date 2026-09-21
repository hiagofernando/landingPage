import { getDataStore } from '@/lib/cloudflare';
import { readJsonObject } from '@/lib/http';
import { normalizeRef } from '@/lib/negotiations';
import { createPending } from '@/lib/negotiation-store';
import { hasErrors, validateDateRange } from '@/lib/validation';
import { getVehicleBySlug } from '@/data/repository';

/**
 * ============================================================================
 *  PEDIDO FEITO NO SITE — PASSO 1 DE 3
 * ============================================================================
 *  O navegador chama isto no clique de "Continuar pelo WhatsApp", junto com a
 *  referência que foi escrita na mensagem. Ainda NÃO é negociação: só vira
 *  quando a mensagem chegar no WhatsApp (ver `../route.ts`).
 *
 *  Rota pública, sem autenticação — e está tudo bem: o pedido é invisível e
 *  expira em 48h se nenhuma mensagem com aquela referência chegar. Para travar
 *  um carro é preciso, além disto, mandar uma mensagem de verdade para o bot.
 *
 *  Não passa pelo "Não me rastreie" do navegador: isto não é medição, é o
 *  funcionamento do pedido. E não leva nome nem telefone.
 * ============================================================================
 */

export const dynamic = 'force-dynamic';

const TAMANHO_MAXIMO = 500;

export async function POST(request: Request): Promise<Response> {
  const input = await readJsonObject(request, TAMANHO_MAXIMO);
  if (!input) return new Response(null, { status: 400 });

  const ref = normalizeRef(input.ref);
  const slug = typeof input.veiculo === 'string' ? input.veiculo : '';
  const pickupDate = typeof input.retirada === 'string' ? input.retirada : '';
  const returnDate = typeof input.devolucao === 'string' ? input.devolucao : '';

  if (!ref) return new Response(null, { status: 400 });

  // As mesmas regras do formulário: sem data no passado, devolução depois da
  // retirada, dentro da antecedência máxima. O navegador já checou, mas quem
  // chama esta rota não é necessariamente o navegador.
  if (hasErrors(validateDateRange(pickupDate, returnDate))) {
    return new Response(null, { status: 400 });
  }

  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) return new Response(null, { status: 400 });

  const store = await getDataStore();
  if (!store) {
    console.error('[rogan] pedido não gravado: binding ROGAN_KV ausente', ref);
    return new Response(null, { status: 503 });
  }

  const result = await createPending(store, { ref, vehicle, pickupDate, returnDate });
  // 409 só para quem estiver depurando: o navegador usa sendBeacon e não lê.
  return new Response(null, { status: result === 'created' ? 204 : 409 });
}
