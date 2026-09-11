/**
 * ============================================================================
 *  CONFIGURAÇÃO CENTRAL DA ROGAN
 * ============================================================================
 *
 *  ESTE É O ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR PARA COLOCAR O SITE NO AR
 *  COM OS DADOS REAIS DA EMPRESA.
 *
 *  Tudo que está marcado com `placeholder: true` ainda NÃO foi informado pela
 *  ROGAN. O site trata esses campos com textos neutros ("Endereço em breve")
 *  em vez de inventar informação. Assim que o dado real chegar:
 *
 *    1. substitua o valor;
 *    2. mude `placeholder` para `false`;
 *    3. rode `npm run build`.
 *
 *  Também é possível sobrescrever os principais campos por variáveis de
 *  ambiente (.env.local) sem tocar no código — veja README.md.
 * ============================================================================
 */

/**
 * Número usado enquanto o WhatsApp oficial não for informado.
 * Formato: código do país + DDD + número, somente dígitos.
 */
export const WHATSAPP_PLACEHOLDER = '5581900000000';

const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '') || WHATSAPP_PLACEHOLDER;

export interface PlaceholderValue {
  value: string;
  /** true = dado ainda não fornecido pela ROGAN. */
  placeholder: boolean;
}

export const siteConfig = {
  /* ------------------------------------------------------------------ */
  /* IDENTIDADE                                                          */
  /* ------------------------------------------------------------------ */
  name: 'ROGAN',
  legalName: 'ROGAN Locação de Veículos',
  tagline: 'Locação de veículos',
  city: 'Carpina',
  state: 'PE',
  stateName: 'Pernambuco',
  region: 'Carpina-PE e região',

  /**
   * URL final do site. Trocar antes de publicar (usada no sitemap, no
   * canonical e nas tags Open Graph).
   */
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.roganlocadora.com.br',

  /**
   * Faixa discreta no topo avisando que a frota e os valores são
   * demonstrativos. Desligue com NEXT_PUBLIC_DEMO_MODE=false depois de
   * cadastrar os dados reais.
   */
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== 'false',

  /* ------------------------------------------------------------------ */
  /* CONTATO                                                             */
  /* ------------------------------------------------------------------ */
  whatsapp: {
    /** Somente dígitos: 55 + DDD + número. */
    number: whatsappNumber,
    /** Versão formatada, usada na tela. Atualize junto com o número. */
    display: process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY || '(81) 9 0000-0000',
    isPlaceholder: whatsappNumber === WHATSAPP_PLACEHOLDER,
  },

  phone: {
    value: '',
    placeholder: true,
  } satisfies PlaceholderValue,

  email: {
    value: '',
    placeholder: true,
  } satisfies PlaceholderValue,

  instagram: {
    /** Handle sem o @. */
    handle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'roganlocadora',
    url: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/roganlocadora',
    /** Confirmar o perfil oficial antes de publicar. */
    placeholder: !process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  },

  address: {
    /** Ex.: 'Av. Exemplo, 123 - Centro'. */
    street: '',
    city: 'Carpina',
    state: 'PE',
    zip: '',
    /** Texto exibido enquanto o endereço não for informado. */
    fallback: 'Endereço em breve',
    /** Cole aqui a URL de incorporação do Google Maps (atributo src do iframe). */
    mapsEmbedUrl: process.env.NEXT_PUBLIC_MAPS_EMBED_URL || '',
    /** Link "como chegar". */
    mapsLinkUrl: process.env.NEXT_PUBLIC_MAPS_LINK_URL || '',
    placeholder: true,
  },

  /**
   * Horário de atendimento. Enquanto `placeholder` for true, o site mostra
   * `fallback` em vez de inventar horários.
   */
  openingHours: {
    lines: [
      { days: 'Segunda a sexta', hours: '' },
      { days: 'Sábado', hours: '' },
      { days: 'Domingo e feriados', hours: '' },
    ],
    fallback: 'Horário de atendimento em breve',
    note: 'Atendimento pelo WhatsApp durante o horário comercial.',
    placeholder: true,
  },

  /* ------------------------------------------------------------------ */
  /* SEO                                                                 */
  /* ------------------------------------------------------------------ */
  seo: {
    title: 'ROGAN | Aluguel de carros em Carpina-PE',
    titleTemplate: '%s | ROGAN Locadora',
    // Até ~155 caracteres: acima disso o Google corta o trecho na busca.
    description:
      'Aluguel de carros em Carpina-PE. Escolha as datas, veja os veículos disponíveis, confira o valor estimado e fale com a nossa equipe pelo WhatsApp.',
    keywords: [
      'aluguel de carros em Carpina',
      'locadora de carros em Carpina',
      'aluguel de veículos em Carpina-PE',
      'carros para alugar em Carpina',
      'locação de veículos Carpina',
      'aluguel de carro por dia Carpina',
      'aluguel de carro mensal Pernambuco',
    ],
    locale: 'pt_BR',
  },

  /* ------------------------------------------------------------------ */
  /* NAVEGAÇÃO                                                           */
  /* ------------------------------------------------------------------ */
  nav: [
    { label: 'Início', href: '/' },
    { label: 'Frota', href: '/frota' },
    { label: 'Como funciona', href: '/como-funciona' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contato', href: '/contato' },
  ],
} as const;

export type SiteConfig = typeof siteConfig;

/** Endereço pronto para exibição (ou o texto neutro de fallback). */
export function getFormattedAddress(): string {
  const { street, city, state, zip, fallback, placeholder } = siteConfig.address;
  if (placeholder || !street) return fallback;
  return [street, `${city} - ${state}`, zip].filter(Boolean).join(', ');
}

/** Linhas de horário prontas para exibição, ou `null` se ainda não informado. */
export function getOpeningHours(): { days: string; hours: string }[] | null {
  const { lines, placeholder } = siteConfig.openingHours;
  if (placeholder) return null;
  const filled = lines.filter((line) => line.hours.trim().length > 0);
  return filled.length > 0 ? filled.map((line) => ({ ...line })) : null;
}
