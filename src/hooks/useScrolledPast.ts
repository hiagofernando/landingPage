'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * `true` quando a página já passou de `threshold` pixels de rolagem.
 *
 * Usa `useSyncExternalStore` em vez de `useEffect` + `setState`: o valor é
 * lido direto do navegador, sem render extra no carregamento, e o servidor
 * recebe `false` de forma previsível (sem erro de hidratação).
 */
export function useScrolledPast(threshold: number): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener('scroll', onChange, { passive: true });
    return () => window.removeEventListener('scroll', onChange);
  }, []);

  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
