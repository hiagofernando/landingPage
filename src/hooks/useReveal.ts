'use client';

import { useEffect, useRef } from 'react';

/**
 * Revela o elemento quando ele entra na viewport.
 * Usa IntersectionObserver (sem biblioteca de animação) e só dispara uma vez.
 * Quem tem `prefers-reduced-motion` já recebe o conteúdo visível pelo CSS.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(delayMs = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      element.dataset.revealed = 'true';
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          window.setTimeout(() => {
            element.dataset.revealed = 'true';
          }, delayMs);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [delayMs]);

  return ref;
}
