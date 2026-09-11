import type { ISODate, SeasonalCampaign } from '@/types';
import { addDays, isSameOrAfter, isSameOrBefore, today } from '@/lib/dates';

/**
 * ============================================================================
 *  CAMPANHAS SAZONAIS
 * ============================================================================
 *  O hero da home troca de mensagem sozinho conforme a data. Não é preciso
 *  mexer no site em cada feriado.
 *
 *  Como adicionar uma campanha:
 *    1. copie um dos blocos abaixo;
 *    2. defina a janela (`window`);
 *    3. escreva `eyebrow`, `title`, `subtitle` e `cta`;
 *    4. pronto — se a data de hoje cair na janela, ela entra no ar.
 *
 *  Se duas campanhas se sobrepõem, vence a de maior `priority`.
 *  Se nenhuma estiver ativa, entra a campanha institucional padrão.
 * ============================================================================
 */

/** Janelas possíveis de uma campanha. */
export type CampaignWindow =
  /** Datas fixas, uma única vez. */
  | { kind: 'fixed'; start: ISODate; end: ISODate }
  /** Repete todo ano no mesmo dia do calendário (`MM-DD`). Aceita virada de ano. */
  | { kind: 'annual'; start: string; end: string }
  /**
   * Feriado móvel: a função recebe o ano e devolve a data-âncora.
   * `before`/`after` definem quantos dias antes e depois a campanha fica no ar.
   */
  | { kind: 'moveable'; anchor: (year: number) => ISODate; before: number; after: number };

export interface CampaignDefinition extends Omit<
  SeasonalCampaign,
  'startDate' | 'endDate' | 'active'
> {
  window: CampaignWindow;
  /** Maior vence em caso de sobreposição. */
  priority: number;
}

/* ------------------------------------------------------------------ */
/* Cálculo de feriados móveis                                          */
/* ------------------------------------------------------------------ */

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function iso(year: number, month: number, day: number): ISODate {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Domingo de Páscoa (algoritmo gregoriano anônimo / Meeus). */
function easterSunday(year: number): ISODate {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return iso(year, month, day);
}

/** Terça-feira de Carnaval = Páscoa - 47 dias. */
export function carnavalTuesday(year: number): ISODate {
  return addDays(easterSunday(year), -47);
}

/** N-ésimo dia da semana do mês. `weekday`: 0 = domingo. */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): ISODate {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const offset = (weekday - firstWeekday + 7) % 7;
  return iso(year, month, 1 + offset + (nth - 1) * 7);
}

/** Último dia da semana do mês. */
function lastWeekdayOfMonth(year: number, month: number, weekday: number): ISODate {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastWeekday = new Date(Date.UTC(year, month - 1, lastDay)).getUTCDay();
  const offset = (lastWeekday - weekday + 7) % 7;
  return iso(year, month, lastDay - offset);
}

/** Dia das Mães no Brasil: 2º domingo de maio. */
export const mothersDay = (year: number) => nthWeekdayOfMonth(year, 5, 0, 2);
/** Dia dos Pais no Brasil: 2º domingo de agosto. */
export const fathersDay = (year: number) => nthWeekdayOfMonth(year, 8, 0, 2);
/** Black Friday: última sexta-feira de novembro. */
export const blackFriday = (year: number) => lastWeekdayOfMonth(year, 11, 5);

/* ------------------------------------------------------------------ */
/* Campanhas                                                           */
/* ------------------------------------------------------------------ */

/** Campanha institucional — entra no ar quando nenhuma sazonal está ativa. */
export const defaultCampaign: SeasonalCampaign = {
  id: 'institucional',
  name: 'Institucional',
  startDate: '1970-01-01',
  endDate: '2999-12-31',
  eyebrow: 'Locadora em Carpina-PE',
  title: 'Seu carro pronto para o seu caminho.',
  subtitle:
    'Aluguel de veículos em Carpina-PE e região, com atendimento rápido pelo WhatsApp. Escolha as datas, veja o que está disponível e fale com a gente.',
  cta: 'Escolher meu carro',
  active: true,
  isDefault: true,
};

export const campaignDefinitions: CampaignDefinition[] = [
  {
    id: 'carnaval',
    name: 'Carnaval',
    window: { kind: 'moveable', anchor: carnavalTuesday, before: 12, after: 2 },
    eyebrow: 'Carnaval',
    title: 'Carnaval com carro na porta.',
    subtitle:
      'Bloco em Carpina, prévia em Recife ou uns dias no sítio: garanta seu carro antes que a frota fique comprometida.',
    cta: 'Ver carros disponíveis',
    priority: 60,
  },
  {
    id: 'dia-das-maes',
    name: 'Dia das Mães',
    window: { kind: 'moveable', anchor: mothersDay, before: 12, after: 1 },
    eyebrow: 'Dia das Mães',
    title: 'Leve sua mãe para passear.',
    subtitle:
      'Um almoço fora, uma visita à família, um fim de semana diferente. Alugue por um dia ou pelo fim de semana inteiro.',
    cta: 'Escolher meu carro',
    priority: 55,
  },
  {
    id: 'namorados',
    name: 'Dia dos Namorados',
    window: { kind: 'annual', start: '06-03', end: '06-13' },
    eyebrow: 'Dia dos Namorados',
    title: 'Um fim de semana só de vocês dois.',
    subtitle:
      'Praia, serra ou uma noite fora de casa. Escolha o carro, veja o valor estimado e fale com a gente pelo WhatsApp.',
    cta: 'Ver carros disponíveis',
    priority: 55,
  },
  {
    id: 'sao-joao',
    name: 'São João',
    window: { kind: 'annual', start: '06-14', end: '06-30' },
    eyebrow: 'São João',
    title: 'São João pede estrada.',
    subtitle:
      'Caruaru, Bezerros, Gravatá ou o forró aqui perto. Alugue por diária, fim de semana ou pelo mês do arraiá inteiro.',
    cta: 'Ver carros disponíveis',
    priority: 65,
  },
  {
    id: 'ferias-julho',
    name: 'Férias de julho',
    window: { kind: 'annual', start: '07-01', end: '07-31' },
    eyebrow: 'Férias de julho',
    title: 'Férias com a família na estrada.',
    subtitle:
      'Espaço para todo mundo e para a bagagem. Escolha as datas e veja quais carros estão livres no período.',
    cta: 'Escolher meu carro',
    priority: 45,
  },
  {
    id: 'dia-dos-pais',
    name: 'Dia dos Pais',
    window: { kind: 'moveable', anchor: fathersDay, before: 10, after: 1 },
    eyebrow: 'Dia dos Pais',
    title: 'O passeio que o pai queria fazer.',
    subtitle:
      'Reúna a família e pegue a estrada sem depender de carona. Locação por diária, semana ou mês.',
    cta: 'Escolher meu carro',
    priority: 55,
  },
  {
    id: 'sete-de-setembro',
    name: 'Feriado de 7 de Setembro',
    window: { kind: 'annual', start: '08-31', end: '09-08' },
    eyebrow: 'Feriadão de setembro',
    title: 'Feriado prolongado começa com o carro reservado.',
    subtitle:
      'Nos feriadões a procura aumenta. Consulte a disponibilidade com antecedência e garanta o seu.',
    cta: 'Ver carros disponíveis',
    priority: 50,
  },
  {
    id: 'outubro',
    name: 'Feriado de outubro',
    window: { kind: 'annual', start: '10-04', end: '10-13' },
    eyebrow: 'Feriado de outubro',
    title: 'Feriado de outubro pede estrada, família e bons momentos.',
    subtitle:
      'Dia das Crianças e Nossa Senhora Aparecida no mesmo feriado. Escolha as datas e veja o que está disponível.',
    cta: 'Escolher meu carro',
    priority: 55,
  },
  {
    id: 'black-friday',
    name: 'Black Friday',
    window: { kind: 'moveable', anchor: blackFriday, before: 6, after: 3 },
    eyebrow: 'Semana da Black Friday',
    title: 'Vai precisar de carro em dezembro? Fale com a gente agora.',
    subtitle:
      'Dezembro lota rápido. Consulte as condições para diária, semana ou mês e deixe seu período encaminhado.',
    cta: 'Consultar disponibilidade',
    priority: 50,
  },
  {
    id: 'natal',
    name: 'Natal',
    window: { kind: 'annual', start: '12-10', end: '12-26' },
    eyebrow: 'Natal',
    title: 'Natal em família, com carro para todo mundo.',
    subtitle:
      'Visitar parentes, buscar quem chega de viagem, resolver as compras. Alugue pelos dias que precisar.',
    cta: 'Escolher meu carro',
    priority: 60,
  },
  {
    id: 'reveillon',
    name: 'Réveillon',
    window: { kind: 'annual', start: '12-27', end: '01-04' },
    eyebrow: 'Réveillon',
    title: 'Virada na praia? Garanta seu carro.',
    subtitle:
      'Fim de ano é o período mais concorrido. Escolha as datas e confirme a disponibilidade pelo WhatsApp.',
    cta: 'Ver carros disponíveis',
    priority: 65,
  },
  {
    id: 'ferias-janeiro',
    name: 'Férias de janeiro',
    window: { kind: 'annual', start: '01-05', end: '01-31' },
    eyebrow: 'Férias de janeiro',
    title: 'Janeiro é mês de praia e de estrada.',
    subtitle: 'Locação por diária, semana ou mês inteiro — do jeito que as suas férias pedirem.',
    cta: 'Escolher meu carro',
    priority: 45,
  },
];

/* ------------------------------------------------------------------ */
/* Resolução                                                           */
/* ------------------------------------------------------------------ */

/** Converte a janela da campanha em datas concretas para o ano de referência. */
export function resolveWindow(
  window: CampaignWindow,
  year: number,
): { start: ISODate; end: ISODate } {
  switch (window.kind) {
    case 'fixed':
      return { start: window.start, end: window.end };

    case 'moveable': {
      const anchor = window.anchor(year);
      return { start: addDays(anchor, -window.before), end: addDays(anchor, window.after) };
    }

    case 'annual': {
      const start = `${year}-${window.start}`;
      // Janela que vira o ano (ex.: 12-27 a 01-04).
      const wrapsYear = window.end < window.start;
      const end = `${wrapsYear ? year + 1 : year}-${window.end}`;
      return { start, end };
    }
  }
}

function toCampaign(
  definition: CampaignDefinition,
  range: { start: ISODate; end: ISODate },
  active: boolean,
): SeasonalCampaign {
  const { window: _window, priority: _priority, ...rest } = definition;
  return { ...rest, startDate: range.start, endDate: range.end, active };
}

/**
 * Campanha que deve estar no ar na data informada.
 * Testa o ano corrente e o anterior (para janelas que viram o ano).
 */
export function getActiveCampaign(referenceDate: ISODate = today()): SeasonalCampaign {
  const year = Number(referenceDate.slice(0, 4));
  const matches: { campaign: SeasonalCampaign; priority: number }[] = [];

  for (const definition of campaignDefinitions) {
    for (const candidateYear of [year - 1, year]) {
      const range = resolveWindow(definition.window, candidateYear);
      if (isSameOrAfter(referenceDate, range.start) && isSameOrBefore(referenceDate, range.end)) {
        matches.push({
          campaign: toCampaign(definition, range, true),
          priority: definition.priority,
        });
        break;
      }
    }
  }

  if (matches.length === 0) return defaultCampaign;

  matches.sort((a, b) => b.priority - a.priority);
  return matches[0].campaign;
}

/** Próximas campanhas do calendário — útil para planejamento e testes. */
export function getUpcomingCampaigns(
  referenceDate: ISODate = today(),
  limit = 4,
): SeasonalCampaign[] {
  const year = Number(referenceDate.slice(0, 4));
  const upcoming: SeasonalCampaign[] = [];

  for (const definition of campaignDefinitions) {
    for (const candidateYear of [year, year + 1]) {
      const range = resolveWindow(definition.window, candidateYear);
      if (isSameOrAfter(range.start, referenceDate)) {
        upcoming.push(toCampaign(definition, range, false));
        break;
      }
    }
  }

  return upcoming.sort((a, b) => a.startDate.localeCompare(b.startDate)).slice(0, limit);
}
