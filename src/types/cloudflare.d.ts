/**
 * Tipo do runtime da Cloudflare.
 *
 * O projeto não instala `@cloudflare/workers-types` (milhares de linhas para
 * usar um método). Declaramos só o que o site toca.
 *
 * Este arquivo NÃO pode ter `import`/`export` no topo: sem isso ele é um
 * arquivo global, que é o único lugar onde `declare module` cria um módulo
 * novo em vez de tentar aumentar um já existente.
 */

declare module 'cloudflare:workers' {
  /**
   * Bindings declarados em `wrangler.jsonc`. Só existe quando o código roda
   * dentro do Worker — em `next dev` este módulo não resolve.
   */
  export const env: Record<string, unknown>;
}
