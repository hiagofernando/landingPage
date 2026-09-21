# Changelog

Histórico do que mudou no site da ROGAN, do mais recente para o mais antigo.

O site ainda não foi lançado publicamente, então não há versões numeradas: as
entradas são por data. O hash ao lado de cada bloco leva ao commit completo
(`git show <hash>`).

---

## 2026-09-20

### Adicionado

- **Medição do funil** (`2a2ef1d`). O site passa a registrar os passos até o
  WhatsApp: formulário aberto, formulário inválido, solicitação enviada, clique
  em WhatsApp solto (com a origem: hero, rodapé, topo, flutuante...) e busca sem
  resultado. Medidor próprio em `src/lib/analytics.ts` — sem cookie, sem script
  de terceiros e respeitando Do Not Track, por isso sem banner de consentimento.
- **Captura de solicitações** (`2a2ef1d`). `src/app/api/eventos/route.ts` grava
  nome, telefone, carro e datas **antes** de a aba sair para o WhatsApp. Antes,
  quem abria o WhatsApp e não enviava a mensagem sumia sem deixar rastro. Usa o
  KV `ROGAN_LEADS` quando o binding existir; sem ele, cai no log do Worker.
- **`npm run otimizar-fotos`** (`2a2ef1d`). Converte as fotos de `public/frota`
  para WebP no tamanho certo. Necessário porque o otimizador do `next/image` não
  roda na Cloudflare sem o binding de Cloudflare Images — o arquivo em `public/`
  é o que o visitante baixa.
- **Filtros da frota na URL** (`2a2ef1d`). Categoria, câmbio, combustível e
  "apenas disponíveis" entram na query string junto com o período, então um link
  compartilhado preserva a busca inteira. Lógica em `src/lib/urls.ts`, com testes.
- **Skills de entrevista e handoff** (`c5c8edf`, `5cb875f`): `/grill-me`,
  `/grill-with-docs` e `/handoff`, em `.claude/skills/`.

### Alterado

- **Hero ficou muito mais leve** (`2a2ef1d`). O carrossel montava os 7 slides
  empilhados na mesma caixa visível, então o navegador baixava a frota inteira
  antes de a página aparecer. Agora monta só o slide atual e os vizinhos: 3
  imagens em vez de 7.
- **Fotos da frota em WebP** (`2a2ef1d`): 2875 KB → 799 KB (−72%).
- **Filtro com uma opção só não aparece** (`2a2ef1d`). Toda a frota é manual e
  flex, então câmbio e combustível eram dois selects que não filtravam nada.
  Voltam sozinhos quando houver variedade.
- **Seção "Por que a ROGAN" usa foto de um carro real** (`2a2ef1d`), no lugar da
  ilustração SVG.
- **Cópia da frota na home** (`2a2ef1d`): prometia "picape de cabine dupla", que
  a ROGAN não tem. A frota é de 5 hatches e 2 sedãs.
- **Aviso do formulário** (`2a2ef1d`) passa a dizer que nome e contato ficam
  registrados com a equipe, já que agora é o que de fato acontece.
- **README e `.env.example`** (`2a2ef1d`): diziam 12 veículos (são 7), fotos em
  SVG (são WebP) e publicação na Vercel (é Cloudflare).
- **`CLAUDE.md`** (`a36000a`) passa a registrar o que é fácil de errar no
  projeto, em vez de ser só um ponteiro para o `AGENTS.md`.

### Removido

- **`dangerouslyAllowSVG`** do `next.config.mjs` (`2a2ef1d`). Nenhuma tela usa
  mais SVG de veículo, e a flag permitia que o otimizador servisse SVG — formato
  capaz de carregar script.

### Pendente

- `public/frota/exemplos/*.jpg` e `public/frota/*.svg` ficaram órfãos e ainda
  estão no repositório.
- O binding KV `ROGAN_LEADS` ainda não foi criado: até lá as solicitações só
  aparecem em `npx wrangler tail`.
- Não existe tela para a ROGAN ler as solicitações.

---

## 2026-09-19

- **Frota reduzida a 7 modelos** (`f0943ac`), só os que têm imagem de exemplo —
  a pedido do cliente, para não exibir carro sem foto na demonstração. Os outros
  8 modelos seguem no histórico do git.
- **Cores reais da marca** (`c599298`): o azul da ROGAN no lugar do esquema
  provisório, e carrossel no hero.
- **`AGENTS.md` e `CLAUDE.md`** (`498739f`) gerados pelo `next dev`.

## 2026-09-12

- **Frota atualizada com os 15 carros reais** (`5373a40`), lidos dos posts do
  Instagram da ROGAN.

## 2026-09-11

- **Primeira versão completa do site** (`33fe768`): home, frota com filtros,
  página do veículo, como funciona, FAQ, contato, sitemap e robots.
- **Período preservado entre páginas** (`47d24f5`), e correção do reveal ao
  re-renderizar.
- **Publicação na Cloudflare via vinext** (`64ab7b7`, `eaac759`), com o Worker
  `rogan-locadora` conectado.
- **Diária fixa de R$150** (`9bec37f`) para toda a frota, com pacote semanal de
  R$900 e mensal de R$3000.
