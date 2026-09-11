# ROGAN — Locação de Veículos (Carpina-PE)

Site institucional e de conversão da ROGAN. O objetivo é um só: levar o visitante
da escolha do carro até uma conversa no WhatsApp, com veículo, datas e valor
estimado já preenchidos.

```
visitante → escolhe as datas → vê os carros livres → escolhe um
   → confere a estimativa → preenche nome e WhatsApp
   → abre o WhatsApp com a mensagem pronta → atendimento humano assume
```

O site **não** confirma reservas nem processa pagamentos. O que sai daqui é uma
**solicitação de locação** — isso está dito de forma explícita em todos os
pontos do fluxo.

---

## 1. Rodando o projeto

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Script                | O que faz                                                    |
| --------------------- | ------------------------------------------------------------ |
| `npm run dev`         | ambiente de desenvolvimento                                  |
| `npm run build`       | build de produção                                            |
| `npm start`           | sobe o build de produção                                     |
| `npm run lint`        | ESLint                                                       |
| `npm run typecheck`   | checagem de tipos                                            |
| `npm run verificar`   | testa as regras de preço, datas, disponibilidade e campanhas |
| `npm run checar-tudo` | roda tudo acima em sequência                                 |

---

## 2. ⚠️ O que precisa ser trocado antes de publicar

Nada abaixo foi inventado: são os campos que a ROGAN ainda não informou. Todos
estão marcados no código e o site mostra textos neutros no lugar deles.

| O quê                  | Onde                                                | Situação hoje                     |
| ---------------------- | --------------------------------------------------- | --------------------------------- |
| Número do WhatsApp     | `src/config/site.ts` → `whatsapp` (ou `.env.local`) | placeholder `5581900000000`       |
| Endereço da loja       | `src/config/site.ts` → `address`                    | "Endereço em breve"               |
| Mapa                   | `src/config/site.ts` → `address.mapsEmbedUrl`       | espaço reservado                  |
| Horário de atendimento | `src/config/site.ts` → `openingHours`               | "Horário de atendimento em breve" |
| Instagram              | `src/config/site.ts` → `instagram`                  | handle a confirmar                |
| Domínio do site        | `src/config/site.ts` → `url`                        | domínio provisório                |
| Frota e preços         | `src/data/vehicles.ts`                              | 12 veículos demonstrativos        |
| Fotos dos veículos     | `public/frota/*.svg`                                | ilustrações provisórias           |
| Logotipo               | `src/components/ui/Logo.tsx` + `src/app/icon.svg`   | monograma provisório              |
| Respostas do FAQ       | `src/data/faq.ts`                                   | neutras nos pontos de política    |

Depois de substituir tudo:

```bash
# desliga a faixa "Versão de demonstração" no topo
NEXT_PUBLIC_DEMO_MODE=false
```

### Sobre o logotipo

A ROGAN ainda não tem logotipo definitivo. O que está no ar é uma marca
provisória: o monograma **R** com um ponto âmbar, ao lado da palavra ROGAN em
tipografia pesada. Para trocar, edite apenas `src/components/ui/Logo.tsx` — todo
o site (header, rodapé, menu móvel) usa esse componente. O favicon fica em
`src/app/icon.svg` e a imagem de compartilhamento em `public/og.png`.

### Sobre as fotos

As imagens em `public/frota` são **ilustrações**, não fotos reais da frota — e o
site diz isso na tela ("Imagem ilustrativa"). Para usar fotos de verdade:

1. coloque os arquivos em `public/frota/` (JPG ou WebP, proporção 16:10, ~1600px de largura);
2. aponte `photos` de cada veículo em `src/data/vehicles.ts` para eles;
3. escreva um `alt` que descreva o carro;
4. remova o aviso "Imagem ilustrativa" em `src/components/fleet/VehicleCard.tsx` e `src/components/vehicle/VehicleGallery.tsx`;
5. em `next.config.mjs`, as três linhas de `dangerouslyAllowSVG` podem ser removidas.

---

## 3. Como mexer no conteúdo

### Cadastrar ou editar um veículo

`src/data/vehicles.ts`. Cada carro é um objeto com os campos descritos em
`src/types/index.ts`. O campo `slug` vira a URL (`/frota/hyundai-hb20-1-0`).

Para bloquear um período (locação em andamento, manutenção), preencha
`unavailablePeriods`. O site passa a esconder o carro quando o cliente escolhe
datas que se sobrepõem e sugere alternativas na página do veículo.

### Mudar preços e a regra de cálculo

- **Valores de cada carro:** `dailyPrice`, `weeklyPrice`, `monthlyPrice` em `src/data/vehicles.ts`.
- **Regras:** `src/lib/pricing.ts` → `pricingRules`.

O cálculo usa o melhor encaixe automaticamente: 38 diárias viram
1 pacote mensal + 1 semanal + 1 diária avulsa. Retirada e devolução no mesmo dia
contam como 1 diária (`sameDayCountsAsOneDay`, configurável).

Cupons, descontos progressivos e preços sazonais já têm lugar reservado em
`pricingRules.future` — hoje não estão ativos.

### Campanhas sazonais

`src/data/campaigns.ts`. O texto do hero da home troca sozinho conforme a data:
Carnaval, Dia das Mães, São João, férias, 7 de Setembro, feriado de outubro,
Black Friday, Natal, Réveillon e mais. Feriados móveis (Carnaval, Dia das Mães,
Dia dos Pais, Black Friday) são **calculados**, não precisam ser atualizados
todo ano.

Para criar uma campanha, copie um bloco existente e ajuste a janela:

```ts
{
  id: 'minha-campanha',
  name: 'Minha campanha',
  window: { kind: 'annual', start: '09-01', end: '09-10' },
  eyebrow: 'Etiqueta curta',
  title: 'Título do hero',
  subtitle: 'Uma ou duas frases.',
  cta: 'Escolher meu carro',
  priority: 50, // em caso de sobreposição, o maior vence
}
```

Sem campanha ativa, entra a institucional (`defaultCampaign`).
A home revalida de hora em hora, então a troca acontece sem novo deploy.

### Mensagens do WhatsApp

Todo texto enviado para o WhatsApp é montado em `src/lib/whatsapp.ts`.

### Perguntas frequentes

`src/data/faq.ts`. As respostas que dependem de política da empresa
(documentos, caução, quilometragem, seguro) estão propositalmente neutras —
nada foi inventado. Substitua quando as regras forem definidas.

---

## 4. Estrutura

```
src/
├── app/                        rotas (App Router)
│   ├── page.tsx                home
│   ├── frota/page.tsx          listagem com filtros
│   ├── frota/[slug]/page.tsx   página do veículo
│   ├── como-funciona/ faq/ contato/
│   ├── sitemap.ts  robots.ts  icon.svg  not-found.tsx
│   └── globals.css             tokens de cor, tipografia e animações
├── components/
│   ├── ui/                     Button, Field, Modal, Badge, Logo, Icons
│   ├── layout/                 Header, Footer, WhatsAppFloatingButton, DemoNotice
│   ├── home/                   Hero, Highlights, FleetPreview, HowItWorks, WhyRogan, CtaSection
│   ├── search/                 DateRangePicker, SearchBar
│   ├── fleet/                  VehicleCard, FleetExplorer, EmptyState
│   ├── vehicle/                VehicleGallery, VehicleSpecs, VehicleBookingPanel
│   ├── booking/                BookingForm, BookingSummary, RentNowButton
│   ├── faq/ contact/ shared/
├── config/site.ts              ← dados da empresa (arquivo único)
├── data/                       vehicles, campaigns, faq, repository
├── lib/                        dates, pricing, availability, validation, whatsapp, format
├── hooks/
└── types/index.ts              modelos de domínio
```

---

## 5. Conectando um banco de dados

`src/data/repository.ts` é o único arquivo que sabe de onde vêm os dados, e as
funções já são assíncronas. Para plugar Postgres, Supabase, Prisma ou um CMS,
troque só o corpo delas:

```ts
export async function getVehicles(): Promise<Vehicle[]> {
  return db.vehicle.findMany({ where: { available: true } });
}
```

Nenhum componente precisa mudar. Os tipos em `src/types/index.ts`
(`Vehicle`, `BookingRequest`, `SeasonalCampaign`) já espelham tabelas.

Para **gravar as solicitações** (hoje elas vão direto para o WhatsApp, sem
persistência), implemente `createBookingRequest` e chame-a no `BookingForm`
antes de abrir o WhatsApp.

Para a **disponibilidade** vir do banco, troque `isVehicleAvailable` em
`src/lib/availability.ts` — o arquivo já traz a consulta SQL equivalente
comentada.

**Painel administrativo** não faz parte desta versão, mas a estrutura acima é o
que ele consumiria: veículos, reservas, clientes, preços, bloqueios e campanhas.

---

## 6. Publicação

O projeto é um app Next.js padrão. Na Vercel:

1. importe o repositório;
2. cadastre as variáveis do `.env.example`;
3. deploy.

As páginas são estáticas e revalidam de hora em hora (`revalidate = 3600`),
o que faz as campanhas sazonais entrarem no ar sozinhas. Em qualquer outro host
Node, `npm run build && npm start` funciona igual.

Depois de apontar o domínio, atualize `NEXT_PUBLIC_SITE_URL` — ele alimenta o
`sitemap.xml`, o `robots.txt`, as URLs canônicas e as tags de compartilhamento.

---

## 7. O que foi verificado

- `npm run verificar` — 32 testes das regras de preço, datas, disponibilidade,
  validação, campanhas sazonais e geração da mensagem do WhatsApp.
- Fluxo completo no navegador: busca por datas, filtros, estado vazio, página do
  veículo, cálculo, modal de solicitação, validação de formulário, veículo
  indisponível com sugestão de alternativas, menu móvel e links.
- Responsividade sem scroll horizontal em 360, 390, 430, 768, 1024, 1280 e 1440px.
- Acessibilidade: auditoria axe-core (WCAG 2.1 A e AA) sem violações em todas as
  páginas, no celular e no desktop, inclusive com o modal aberto. As cores de
  texto foram ajustadas para passar em 4.5:1 sobre os três fundos claros do site.
- SEO: títulos e descrições por página, Open Graph, dados estruturados
  (`AutoRental`, `Product`, `FAQPage`), sitemap, robots e URLs amigáveis.

---

## 8. Decisões que valem saber

- **Sem biblioteca de ícones ou de animação.** Ícones são SVG inline e as
  animações usam CSS + `IntersectionObserver`. Menos JavaScript no cliente.
- **`input[type=date]` nativo.** No celular abre o seletor do próprio sistema,
  que é mais rápido e mais acessível que qualquer calendário customizado. Como o
  formato do campo segue o idioma do navegador, o site repete a data por extenso
  embaixo ("12 de outubro de 2026").
- **Datas como texto `YYYY-MM-DD`.** Evita o clássico bug de "um dia a mais"
  entre o servidor (UTC) e o navegador. O "hoje" do site é sempre o de
  Carpina-PE (`America/Recife`).
- **O período fica na URL** (`?retirada=&devolucao=`), então o link pode ser
  compartilhado e a seleção sobrevive à navegação entre páginas.
- **Nenhum dado inventado sobre a ROGAN.** Sem "X anos de mercado", sem número
  de clientes, sem regras de documentação ou seguro. Onde falta informação, o
  site diz que ela vem em breve.

---

## 9. Publicando na Cloudflare (Workers)

O projeto já está configurado para rodar na Cloudflare via [vinext](https://github.com/cloudflare/vinext) — o adaptador que a própria Cloudflare recomenda hoje para Next.js em Workers. Um namespace de KV (`rogan-locadora-VINEXT_KV_CACHE`, usado para o cache de dados do ISR) já foi criado na conta e o ID está em `wrangler.jsonc`.

O que falta é só conectar o repositório pelo painel — a Cloudflare não deixa fazer isso por linha de comando sem um token de API, então esse passo é manual:

1. **Workers e Pages** → **Criar aplicativo** → conectar ao repositório `hiagofernando/landingPage`, branch `claude/rogan-rental-website-sk1nn3`.
2. O nome do Worker precisa ser **exatamente `rogan-locadora`** (tem que bater com `wrangler.jsonc`, senão o build falha).
3. Nas configurações de build, defina:
   - **Comando de build:** `npm run build:vinext`
   - **Comando de deploy:** `npm run deploy:vinext`

   (o comando padrão `npx wrangler deploy` **não** funciona aqui — o `vinext build` gera uma configuração própria em `dist/server/wrangler.json`, e é ela que precisa ser usada no deploy.)
4. Em **variáveis de ambiente de build**, adicione as mesmas do `.env.example` que fizerem sentido (pelo menos `NEXT_PUBLIC_WHATSAPP_NUMBER` e `NEXT_PUBLIC_DEMO_MODE=false` quando os dados reais estiverem prontos). Elas são embutidas no site durante o build, então precisam estar aqui — e não como "vars" do Worker em runtime.
5. Salvar. Todo push nessa branch gera um novo deploy automaticamente.

Scripts locais úteis (não mudam o `npm run dev` de sempre, que continua sendo Next.js puro):

| Script | O que faz |
| --- | --- |
| `npm run dev:vinext` | roda o site com o motor da Cloudflare, localmente |
| `npm run build:vinext` | gera o build de produção para Workers |
| `npm run start:vinext` | sobe o build gerado num Worker local (para testar antes de publicar) |
| `npm run deploy:vinext` | publica direto da sua máquina, se algum dia você tiver o `wrangler` autenticado localmente |

Compatibilidade verificada com `npx vinext check`: 81%, sem bloqueios reais para este projeto (as únicas ressalvas são cosméticas — fontes carregadas via CDN e otimização de imagem local ainda não disponível no adaptador, o que não afeta o site já que as fotos da frota são SVG).
