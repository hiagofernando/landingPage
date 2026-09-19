'use client';

import { useCallback, useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * `true` quando o usuário pediu menos movimento no sistema operacional.
 *
 * Mesmo padrão de `useScrolledPast`: lido direto do navegador via
 * `useSyncExternalStore`, sem `useEffect` + `setState`. O servidor recebe
 * `false` (sem erro de hidratação); o valor real chega no primeiro paint.
 */
export function usePrefersReducedMotion(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    const mediaQuery = window.matchMedia(QUERY);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const getSnapshot = useCallback(() => window.matchMedia(QUERY).matches, []);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
