'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Revela o elemento quando ele entra na viewport.
 *
 * O estado é do React, e não um atributo escrito direto no DOM: escrito no
 * DOM, qualquer re-render do componente pai reverteria o atributo e o
 * conteúdo já revelado sumiria da tela.
 *
 * Elementos que já estão visíveis no carregamento são revelados no primeiro
 * quadro, sem esperar o IntersectionObserver — assim a primeira tela nunca
 * aparece vazia. Quem tem `prefers-reduced-motion` recebe tudo visível
 * direto pelo CSS.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(delayMs = 0) {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || revealed) return;

    let observer: IntersectionObserver | undefined;
    let timer: number | undefined;

    // A checagem espera um quadro: antes do primeiro layout não há posição.
    const frame = requestAnimationFrame(() => {
      if (typeof IntersectionObserver === 'undefined') {
        setRevealed(true);
        return;
      }

      const rect = element.getBoundingClientRect();
      const jaVisivel = rect.top < window.innerHeight && rect.bottom > 0;
      if (jaVisivel) {
        setRevealed(true);
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            observer?.unobserve(entry.target);
            timer = window.setTimeout(() => setRevealed(true), delayMs);
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
      );

      observer.observe(element);
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [delayMs, revealed]);

  return { ref, revealed };
}
