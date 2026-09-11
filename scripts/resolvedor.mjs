import { existsSync } from 'node:fs';
import { dirname, resolve as resolvePath } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Resolvedor mínimo para rodar os arquivos TypeScript do projeto direto no
 * Node (sem bundler), usado apenas por `npm run verificar`.
 *
 * Faz duas coisas que o Node não faz sozinho:
 *   1. entende o atalho `@/` como `src/`;
 *   2. completa a extensão `.ts` nos imports sem extensão.
 */
const SRC = fileURLToPath(new URL('../src/', import.meta.url));

export function resolve(specifier, context, nextResolve) {
  let target = null;

  if (specifier.startsWith('@/')) {
    target = resolvePath(SRC, specifier.slice(2));
  } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const base = context.parentURL ? dirname(fileURLToPath(context.parentURL)) : process.cwd();
    target = resolvePath(base, specifier);
  }

  if (target) {
    for (const candidate of [target, `${target}.ts`, `${target}/index.ts`]) {
      if (candidate.endsWith('.ts') && existsSync(candidate)) {
        return nextResolve(pathToFileURL(candidate).href, context);
      }
    }
  }

  return nextResolve(specifier, context);
}
