import type { Vehicle } from '@/types';

/**
 * ============================================================================
 *  FROTA — MODELOS E PREÇO REAIS, ANO/CÂMBIO AINDA PLACEHOLDER
 * ============================================================================
 *  Confirmado pelo cliente:
 *   - Preço: diária fixa de R$150 para toda a frota, pacote semanal R$900 e
 *     mensal R$3000 (ver `calculateQuote` em `src/lib/pricing.ts`).
 *   - Marca e modelo de cada carro: lidos de uma montagem de posts do
 *     Instagram da ROGAN, em resolução alta o suficiente para ler o texto
 *     de cada card com segurança.
 *   - Lista reduzida a propósito: só os 7 modelos abaixo têm imagem de
 *     exemplo (ver `examplePhoto`). Os outros 8 modelos que apareciam na
 *     montagem de posts (Siena EL, Palio Way, mais 2 Fox, Gol G6, 2x Palio
 *     Fire, Voyage 1.6) foram removidos daqui por pedido do cliente — não
 *     ficar com carro sem foto na versão de demonstração. Se algum deles
 *     voltar à frota, é só reaproveitar os dados que estavam no histórico
 *     do git deste arquivo.
 *
 *  AINDA NÃO confirmado pelo cliente (estimados por modelo, não pelo carro
 *  real/placa específico — podem estar errados):
 *   - `year` e `transmission`: chutados a partir do que é típico para cada
 *     geração/versão desses modelos no Brasil, não da unidade real da ROGAN.
 *   - `trunk`: capacidade de porta-malas de catálogo do modelo, não medida.
 *
 *  FOTOS (`/public/frota/exemplos`): imagens geradas por IA usadas SÓ para a
 *  versão de demonstração do site (por isso o `DemoNotice` continua ativo —
 *  não desligar `NEXT_PUBLIC_DEMO_MODE` enquanto elas estiverem aqui). Não
 *  são fotos dos carros reais da ROGAN: mostram o modelo certo, mas
 *  zero-km, cor de catálogo e cidade genérica — nada disso bate com a
 *  condição real de um carro popular usado de frota de locação em
 *  Carpina-PE. Antes de tirar o site do modo demonstração, TROCAR TODAS
 *  por fotos de celular dos carros reais.
 *
 *  Antes de considerar a frota 100% real:
 *    1. confirmar com o cliente ano e câmbio de cada carro listado abaixo;
 *    2. decidir se os 8 modelos removidos voltam à frota (e com que foto);
 *    3. pedir as fotos reais de cada carro (celular, sem moldura) e trocar
 *       `examplePhoto(...)` pelos arquivos reais em `/public/frota`;
 *    4. desligar o aviso de demonstração com NEXT_PUBLIC_DEMO_MODE=false.
 *
 *  Campos obrigatórios estão descritos em `src/types/index.ts`.
 * ============================================================================
 */

/**
 * Imagem de exemplo gerada por IA (só para demonstração — ver comentário no
 * topo do arquivo). NÃO é foto do carro real.
 *
 * Os arquivos são WebP gerados por `npm run otimizar-fotos`. Rode o mesmo
 * script ao trocar por fotos reais: no Cloudflare o visitante baixa o arquivo
 * exatamente como ele está em `public/`.
 */
function examplePhoto(file: string, name: string) {
  return [
    {
      src: `/frota/exemplos/${file}.webp`,
      alt: `Imagem ilustrativa gerada por IA representando um ${name} — não é foto do veículo real da ROGAN`,
    },
  ];
}

export const demoVehicles: Vehicle[] = [
  {
    id: 'veh-001',
    slug: 'chevrolet-celta-lt',
    name: 'Chevrolet Celta LT',
    brand: 'Chevrolet',
    model: 'Celta LT',
    year: 2013,
    category: 'hatch',
    transmission: 'manual',
    fuel: 'flex',
    seats: 5,
    trunk: 285,
    doors: 4,
    airConditioning: true,
    dailyPrice: 150,
    weeklyPrice: 900,
    monthlyPrice: 3000,
    photos: examplePhoto('chevrolet-celta-lt', 'Chevrolet Celta LT'),
    description:
      'Compacto simples e econômico, ótimo para o dia a dia dentro de Carpina e cidades vizinhas.',
    highlights: ['Baixo consumo', 'Fácil de estacionar', 'Ar-condicionado'],
    available: true,
    status: 'ativo',
    unavailablePeriods: [],
  },
  {
    id: 'veh-002',
    slug: 'volkswagen-fox-vermelho',
    name: 'Volkswagen Fox (vermelho)',
    brand: 'Volkswagen',
    model: 'Fox',
    year: 2015,
    category: 'hatch',
    transmission: 'manual',
    fuel: 'flex',
    seats: 5,
    trunk: 262,
    doors: 4,
    airConditioning: true,
    dailyPrice: 150,
    weeklyPrice: 900,
    monthlyPrice: 3000,
    photos: examplePhoto('volkswagen-fox-vermelho', 'Volkswagen Fox'),
    description:
      'Compacto alemão, ágil no trânsito e com boa dirigibilidade para quem roda bastante na cidade.',
    highlights: ['Ágil no trânsito', 'Bem revisado', 'Ar-condicionado'],
    available: true,
    status: 'ativo',
    unavailablePeriods: [],
  },
  {
    id: 'veh-003',
    slug: 'ford-ka',
    name: 'Ford Ka',
    brand: 'Ford',
    model: 'Ka',
    year: 2017,
    category: 'hatch',
    transmission: 'manual',
    fuel: 'flex',
    seats: 5,
    trunk: 284,
    doors: 4,
    airConditioning: true,
    dailyPrice: 150,
    weeklyPrice: 900,
    monthlyPrice: 3000,
    photos: examplePhoto('ford-ka', 'Ford Ka'),
    description:
      'Um dos compactos mais vendidos do país, simples de dirigir e com peças fáceis de encontrar.',
    highlights: ['Fácil de dirigir', 'Baixo consumo', 'Ar-condicionado'],
    available: true,
    status: 'ativo',
    unavailablePeriods: [],
  },
  {
    id: 'veh-004',
    slug: 'toyota-etios',
    name: 'Toyota Etios',
    brand: 'Toyota',
    model: 'Etios',
    year: 2018,
    category: 'sedan',
    transmission: 'manual',
    fuel: 'flex',
    seats: 5,
    trunk: 444,
    doors: 4,
    airConditioning: true,
    dailyPrice: 150,
    weeklyPrice: 900,
    monthlyPrice: 3000,
    photos: examplePhoto('toyota-etios', 'Toyota Etios'),
    description:
      'Sedã espaçoso, com bom espaço interno para quem viaja em família ou com passageiros.',
    highlights: ['Espaço interno', 'Porta-malas grande', 'Ar-condicionado'],
    available: true,
    status: 'ativo',
    unavailablePeriods: [],
  },
  {
    id: 'veh-005',
    slug: 'fiat-uno-vivace',
    name: 'Fiat Uno Vivace',
    brand: 'Fiat',
    model: 'Uno Vivace',
    year: 2013,
    category: 'hatch',
    transmission: 'manual',
    fuel: 'flex',
    seats: 5,
    trunk: 280,
    doors: 4,
    airConditioning: true,
    dailyPrice: 150,
    weeklyPrice: 900,
    monthlyPrice: 3000,
    photos: examplePhoto('fiat-uno-vivace', 'Fiat Uno Vivace'),
    description: 'Compacto leve e econômico, ideal para uso urbano no dia a dia.',
    highlights: ['Baixo consumo', 'Fácil de manobrar', 'Ar-condicionado'],
    available: true,
    status: 'ativo',
    unavailablePeriods: [],
  },
  {
    id: 'veh-006',
    slug: 'fiat-grand-siena',
    name: 'Fiat Grand Siena',
    brand: 'Fiat',
    model: 'Grand Siena',
    year: 2018,
    category: 'sedan',
    transmission: 'manual',
    fuel: 'flex',
    seats: 5,
    trunk: 500,
    doors: 4,
    airConditioning: true,
    dailyPrice: 150,
    weeklyPrice: 900,
    monthlyPrice: 3000,
    photos: examplePhoto('fiat-grand-siena', 'Fiat Grand Siena'),
    description:
      'Sedã com porta-malas dos maiores da categoria, boa opção para viagem com bagagem.',
    highlights: ['Porta-malas grande', 'Confortável na estrada', 'Ar-condicionado'],
    available: true,
    status: 'ativo',
    unavailablePeriods: [],
  },
  {
    id: 'veh-007',
    slug: 'fiat-mobi',
    name: 'Fiat Mobi',
    brand: 'Fiat',
    model: 'Mobi',
    year: 2021,
    category: 'hatch',
    transmission: 'manual',
    fuel: 'flex',
    seats: 4,
    trunk: 235,
    doors: 4,
    airConditioning: true,
    dailyPrice: 150,
    weeklyPrice: 900,
    monthlyPrice: 3000,
    photos: examplePhoto('fiat-mobi', 'Fiat Mobi'),
    description:
      'Compacto, econômico e fácil de estacionar. Boa escolha para quem vai rodar dentro de Carpina e nas cidades vizinhas no dia a dia.',
    highlights: ['Baixo consumo', 'Fácil de manobrar', 'Ar-condicionado'],
    available: true,
    status: 'ativo',
    unavailablePeriods: [],
  },
];
