/**
 * ============================================================================
 *  RECEPTOR DE EVENTOS DO FUNIL E DE SOLICITAÇÕES
 * ============================================================================
 *  Recebe o que `src/lib/eventos.ts` envia do navegador.
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
 *    - com o binding KV `ROGAN_LEADS` configurado, gravamos lá (ver README);
 *    - sem ele, cai no log do Worker (`npx wrangler tail`) — nada se perde de
 *      imediato, mas não fica consultável. É o estado de hoje.
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

/** Limite de caracteres por campo de texto vindo do formulário. */
const LIMITE_TEXTO = 120;

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

/** Texto curto e limpo, ou `undefined`. Nunca confie no que vem do navegador. */
function asText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const clean = value.trim().slice(0, LIMITE_TEXTO);
  return clean.length > 0 ? clean : undefined;
}

/** Número positivo e finito, ou `undefined`. */
function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
}

/** Só o método do KV que usamos aqui. */
interface KVStore {
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

/**
 * KV das solicitações, quando o binding existir.
 *
 * O módulo `cloudflare:workers` só resolve dentro do Worker — em `next dev`
 * a importação falha e seguimos sem KV, gravando no log.
 */
async function getKVStore(): Promise<KVStore | null> {
  try {
    const { env } = await import('cloudflare:workers');
    const binding = env?.ROGAN_LEADS;
    return binding ? (binding as KVStore) : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;

  try {
    const raw = await request.text();
    if (raw.length > TAMANHO_MAXIMO) {
      return new Response(null, { status: 413 });
    }
    payload = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }

  if (typeof payload !== 'object' || payload === null) {
    return new Response(null, { status: 400 });
  }

  const input = payload as Record<string, unknown>;
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

  const kv = await getKVStore();

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
