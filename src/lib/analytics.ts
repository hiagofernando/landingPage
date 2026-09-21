/**
 * ============================================================================
 *  MEDIÇÃO DO FUNIL — LADO DO CLIENTE
 * ============================================================================
 *  O site tem um objetivo só: levar o visitante até uma conversa no WhatsApp.
 *  Sem medir, não dá para saber quantos chegam no botão, qual carro puxa mais
 *  ou se a campanha sazonal funciona.
 *
 *  Este é um medidor PRÓPRIO, não um script de terceiros:
 *    - não usa cookie nem localStorage;
 *    - não carrega JavaScript externo;
 *    - não identifica a pessoa (o id de sessão vive só na aba aberta);
 *    - respeita "Não me rastreie" (Do Not Track) do navegador.
 *
 *  Por isso não precisa de banner de consentimento. Os dados vão para o
 *  endpoint do próprio site (`/api/eventos`) e ficam com a ROGAN.
 * ============================================================================
 */

/** Passos do funil. Um nome por etapa — não invente nomes soltos na chamada. */
export type EventName =
  /** Abriu o formulário de solicitação (clicou em "Alugar agora"). */
  | 'formulario_aberto'
  /** Tentou continuar com o formulário incompleto ou com data bloqueada. */
  | 'formulario_invalido'
  /** Fim do funil: mandamos a pessoa para o WhatsApp com a mensagem pronta. */
  | 'solicitacao_enviada'
  /** Clicou em um WhatsApp solto (topo, botão flutuante, "tirar dúvida"). */
  | 'whatsapp_direto'
  /** Buscou um período e não sobrou nenhum carro. */
  | 'busca_sem_resultado';

export interface EventData {
  /** Slug do veículo, quando o evento acontece em cima de um carro. */
  veiculo?: string;
  /** Diárias do período escolhido. */
  dias?: number;
  /** Valor estimado mostrado na tela, em reais. */
  valor?: number;
  /** Onde o botão fica: 'hero', 'flutuante', 'card', 'painel'... */
  origem?: string;
  /** Datas do período, quando houver. */
  retirada?: string;
  devolucao?: string;
}

/**
 * Dados de contato de quem pediu a locação.
 *
 * Só vão junto do evento `solicitacao_enviada` — é a informação que a ROGAN
 * precisa para retomar o contato de quem abriu o WhatsApp e não enviou a
 * mensagem. O formulário avisa isso em texto, logo abaixo do botão.
 */
export interface EventContact {
  nome: string;
  telefone?: string;
}

const ENDPOINT = '/api/eventos';
const SESSION_KEY = 'rogan:sessao';

/** Identifica a aba atual para ligar os passos de um mesmo visitante. */
function sessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    // Navegação anônima com storage bloqueado: o evento vale mesmo sem sessão.
    return 'sem-sessao';
  }
}

/** true quando o navegador pediu explicitamente para não ser rastreado. */
function doNotTrack(): boolean {
  const nav = navigator as Navigator & { msDoNotTrack?: string };
  const win = window as Window & { doNotTrack?: string };
  return nav.doNotTrack === '1' || nav.msDoNotTrack === '1' || win.doNotTrack === '1';
}

/**
 * Registra um passo do funil.
 *
 * Nunca lança e nunca atrasa a navegação: usa `sendBeacon`, que entrega o
 * evento mesmo quando a aba está sendo trocada pelo WhatsApp. Esse detalhe é
 * o que faz o evento mais importante do site — `solicitacao_enviada` — não se
 * perder justamente na hora em que a pessoa sai da página.
 */
export function trackEvent(name: EventName, data: EventData = {}, contact?: EventContact): void {
  if (typeof window === 'undefined') return;
  if (doNotTrack()) return;

  const body = JSON.stringify({
    nome: name,
    sessao: sessionId(),
    caminho: window.location.pathname,
    referencia: document.referrer || undefined,
    ...data,
    contato: contact,
  });

  try {
    if (navigator.sendBeacon) {
      const sent = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      if (sent) return;
    }
    // `keepalive` mantém a requisição viva depois que a página é descarregada.
    void fetch(ENDPOINT, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Medição nunca pode quebrar o site. Se falhou, perdemos o evento e pronto.
  }
}
