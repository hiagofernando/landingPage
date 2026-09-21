import { getKV } from '@/lib/cloudflare';
import { asNumber, asText, readJsonObject } from '@/lib/http';

/**
 * ============================================================================
 *  RECEPTOR DE EVENTOS DO FUNIL E DE SOLICITAÇÕES
 * ============================================================================
 *  Recebe o que `src/lib/analytics.ts` envia do navegador.
 *
 *  Dois motivos para isso existir:
 *
 *  1. MEDIR. Sem isto ninguém sabe quantas pessoas chegam no botão do
 *     WhatsApp, qual carro puxa mais ou se a campanha sazonal funciona.
 *
 *  2. NÃO PERDER O CLIENTE. O site termina em `wa.me` com a mensagem pronta —
 *     mas se a pessoa fechar o WhatsApp sem apertar enviar, a ROGAN nunca fica
 *     sabendo que existiu alguém interessado. Gravando a solicitação ANTES do
 *     redirecionamento, esse lead vira uma lista de retomada.
 *
 *  Onde os dados ficam:
 *    - com o binding KV `ROGAN_KV` configurado, gravamos lá (ver README);
 *    - sem ele, cai no log do Worker (`npx wrangler tail`). Aqui, ao contrário
 *      das negociações, log serve: evento perdido não quebra nada na tela.
 * ============================================================================
 */

/** Precisa do runtime do Worker: não dá para pré-renderizar. */
export const dynamic = 'force-dynamic';

/** Nomes aceitos. Qualquer outra coisa é descartada. */
const EVENTOS_VALIDOS = new Set([
  'formulario_aberto',
  'formulario_invalido',
  'solicitacao_enviada',
  'whatsapp_direto',
  'busca_sem_resultado',
]);

/** Um payload de evento não passa nem perto disso. Corta abuso. */
const TAMANHO_MAXIMO = 2_000;

/** Quanto tempo a solicitação fica guardada: 180 dias. */
const VALIDADE_SEGUNDOS = 60 * 60 * 24 * 180;

interface StoredEvent {
  nome: string;
  sessao: string;
  caminho: string;
  referencia?: string;
  veiculo?: string;
  dias?: number;
  valor?: number;
  origem?: string;
  retirada?: string;
  devolucao?: string;
  contato?: { nome: string; telefone?: string };
  em: string;
}

export async function POST(request: Request): Promise<Response> {
  const input = await readJsonObject(request, TAMANHO_MAXIMO);
  if (!input) return new Response(null, { status: 400 });

  const name = asText(input.nome);
  if (!name || !EVENTOS_VALIDOS.has(name)) {
    return new Response(null, { status: 400 });
  }

  const rawContact = input.contato as Record<string, unknown> | undefined;
  const contactName = asText(rawContact?.nome);

  const event: StoredEvent = {
    nome: name,
    sessao: asText(input.sessao) ?? 'sem-sessao',
    caminho: asText(input.caminho) ?? '/',
    referencia: asText(input.referencia),
    veiculo: asText(input.veiculo),
    dias: asNumber(input.dias),
    valor: asNumber(input.valor),
    origem: asText(input.origem),
    retirada: asText(input.retirada),
    devolucao: asText(input.devolucao),
    contato: contactName
      ? { nome: contactName, telefone: asText(rawContact?.telefone) }
      : undefined,
    em: new Date().toISOString(),
  };

  // `lead:` para o que tem contato de gente (o que a ROGAN liga de volta),
  // `evento:` para o resto. Prefixos separados deixam listar um sem o outro.
  const prefix = event.contato ? 'lead' : 'evento';
  const key = `${prefix}:${event.em}:${event.sessao.slice(0, 8)}`;

  const kv = await getKV();

  if (kv) {
    try {
      await kv.put(key, JSON.stringify(event), { expirationTtl: VALIDADE_SEGUNDOS });
    } catch (error) {
      // KV fora do ar não pode derrubar o site: registra e segue.
      console.error('[rogan] falha ao gravar no KV', key, error);
    }
  } else {
    // Sem binding: o log do Worker é a única trilha. Visível em `wrangler tail`.
    console.log(`[rogan] ${key} ${JSON.stringify(event)}`);
  }

  // 204: o navegador não precisa de resposta. `sendBeacon` ignora o corpo.
  return new Response(null, { status: 204 });
}
