@AGENTS.md

## O projeto

Landing page de conversão da ROGAN Locadora (Carpina-PE). Objetivo único: levar o
visitante a uma conversa no WhatsApp com veículo, datas e valor já preenchidos. O
site **não** confirma reserva nem processa pagamento.

O README é a documentação completa. Este arquivo tem só o que é fácil de errar.

## Antes de commitar

```bash
npm run checar-tudo   # typecheck + lint + testes + build
```

Commit e push para `claude/rogan-rental-website-sk1nn3` a cada atualização — a
Cloudflare publica a partir dessa branch, então o push é o que coloca no ar.

## Cloudflare, não Vercel

Publica em Cloudflare Workers via vinext (`npm run deploy:vinext`). Duas
consequências que já causaram confusão:

- **O otimizador do `next/image` não roda.** Ele só funciona com o binding de
  Cloudflare Images (`imagesOptimizer()`), que não está configurado. Na prática,
  o arquivo em `public/` é exatamente o que o visitante baixa. Ao adicionar foto,
  rode `npm run otimizar-fotos` — sem isso uma foto de celular vai inteira, no 4G.
- **Variáveis de ambiente** vão com `wrangler secret put` ou no painel do Worker,
  não em painel da Vercel.

## Medição do funil

`src/lib/analytics.ts` (cliente) → `src/app/api/eventos/route.ts` (servidor).
Medidor próprio: sem cookie, sem script de terceiros, respeita Do Not Track — por
isso não precisa de banner de consentimento. Não troque por GA/Pixel sem tratar
consentimento.

**Ao criar um evento novo, mude dois lugares** ou ele é descartado com 400:

1. a união `EventName` em `src/lib/analytics.ts`;
2. o conjunto `EVENTOS_VALIDOS` em `src/app/api/eventos/route.ts`.

Use `sendBeacon` (já é o padrão do `trackEvent`): o evento mais importante,
`solicitacao_enviada`, dispara enquanto a aba está saindo para o WhatsApp — um
`fetch` comum se perderia aí.

`solicitacao_enviada` carrega nome e telefone e é gravado **antes** do
redirecionamento, para que quem abre o WhatsApp e não envia a mensagem não vire
lead perdido. Se mexer nesse fluxo, mantenha o aviso em texto no formulário.

**KV:** grava em `ROGAN_KV` quando o binding existir; sem ele cai em
`console.log` (visível em `npx wrangler tail`). O binding ainda não foi criado —
o passo a passo está no README, seção 3.1.

## "Em negociação" pelo WhatsApp

README seção 3.2 tem o fluxo. O que é fácil de quebrar:

- **Contrato com o n8n.** A automação acha o carro e o pedido na mensagem por
  regex: `AUTOMATION_CODE_REGEX` e `AUTOMATION_REF_REGEX` em
  `src/lib/negotiations.ts`. O n8n tem cópias delas — **mudou o formato da
  etiqueta `(cód. KA-1003 · ref 7F2KAX)`, do `Vehicle.code` ou de uma regex, mude
  no nó "Organizador WP" também**. O teste "contrato com a automação" pega o
  lado do site.
- **Vale para datas, não para o carro.** Carro alugado não é carro vendido:
  a negociação de 01–05/10 não afeta 10–15/10. Não "simplifique" para o carro
  inteiro.
- **Negociação não bloqueia pedido** (só `locado` bloqueia) e **não expira
  sozinha** — decisões da ROGAN, não descuido.
- **Marca quando a mensagem chega, não no clique.** O clique só grava um pedido
  pendente. Não mova a abertura da negociação para o navegador.
- **Link que muda estado nunca é GET.** O WhatsApp abre todo link para montar a
  prévia; por isso os links da ficha abrem `/negociacao/[ref]` e só o botão faz
  `POST`.
- **O pedido pendente não passa pelo `trackEvent`**: ele pula quem tem Do Not
  Track, e aí a negociação nunca abriria. Fica em `registerPendingRequest`.
- **Sem `stale-while-revalidate` no `GET /api/negociacoes`.** O navegador também
  respeita, e mostrava lista velha por até 1 min — carro recém-locado aparecia
  livre.
- **Estado só no `negotiation-store.ts`**, sobre a interface `KVStore`. Os testes
  rodam o ciclo inteiro com `memoryStore(new Map())`.
- Em produção, sem `ROGAN_KV` ou sem `ROGAN_API_SECRET`, as rotas respondem 503
  de propósito. Não ponha valor de reserva para o segredo.

## Armadilhas de conteúdo

- **Texto não pode prometer carro que a frota não tem.** Hoje são 5 hatches e 2
  sedãs em `src/data/vehicles.ts` — nada de picape ou SUV na cópia.
- **Filtro com uma opção só não aparece** (`FleetExplorer`). Toda a frota é manual
  e flex, então câmbio e combustível ficam escondidos; voltam sozinhos quando
  houver variedade.
- **Modo demonstração fica ligado** enquanto as fotos forem geradas por IA.
  `NEXT_PUBLIC_DEMO_MODE=false` só depois das fotos reais e dos dados da empresa.
- Ano e câmbio de cada carro são estimativas por modelo, não confirmados pela
  ROGAN. Idem `trunk`.

## Onde a lógica mora

Não duplique estes — todos têm teste em `scripts/regras.test.ts`:

- preço: `src/lib/pricing.ts`
- disponibilidade: `src/lib/availability.ts`
- período e filtros na URL: `src/lib/urls.ts`
- mensagens do WhatsApp: `src/lib/whatsapp.ts`
- negociações: regras em `src/lib/negotiations.ts`, estado em
  `src/lib/negotiation-store.ts`
- KV e segredos: `src/lib/cloudflare.ts` (só servidor)
- dados da empresa: `src/config/site.ts` (arquivo único)

Páginas buscam os dados e passam por prop; componentes não buscam sozinhos
(`Hero`, `FleetPreview`, `WhyRogan` seguem esse padrão).

Identificadores em inglês, comentários e textos de tela em português.

## Pendências conhecidas

- `public/frota/exemplos/*.jpg` e `public/frota/*.svg` estão órfãos (substituídos
  por WebP e pela foto real no `WhyRogan`). Só ocupam espaço no deploy.
- Não existe tela para a ROGAN ler as solicitações — hoje só por linha de comando.
- Negociação só funciona em produção depois de: criar `ROGAN_KV`, definir
  `ROGAN_API_SECRET`, apontar `NEXT_PUBLIC_WHATSAPP_NUMBER` para o número do bot
  e criar a variante locadora do fluxo no n8n.

## Skills do projeto

Ficam em `.claude/skills/` e valem para qualquer sessão neste repositório (inclusive na web):

- `/grill-me`: entrevista sobre um plano ou ideia, em rodadas de perguntas numeradas, cada uma com a resposta recomendada. Use antes de implementar algo com decisões em aberto.
- `/grill-with-docs`: a mesma entrevista, mas registra o vocabulário do projeto em `CONTEXT.md` e as decisões difíceis de reverter em `docs/adr/`.
- `/handoff`: resume a conversa em um documento para outra sessão continuar o trabalho.

`grilling` e `domain-modeling` são usadas pelas skills acima; não chame diretamente.

Ao usar `/grill-me` ou `/grill-with-docs`, não escreva nem altere código até eu confirmar que chegamos a um entendimento comum.
