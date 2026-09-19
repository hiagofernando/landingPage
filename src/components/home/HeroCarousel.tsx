'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { ChevronLeft, ChevronRight } from '@/components/ui/Icons';

export interface HeroCarouselSlide {
  src: string;
  alt: string;
  name: string;
}

interface HeroCarouselProps {
  slides: HeroCarouselSlide[];
}

const AUTOPLAY_MS = 5000;

/**
 * Carrossel do hero: alterna entre as imagens de exemplo da frota.
 *
 * Pausa sozinho com `prefers-reduced-motion`, ao passar o mouse e com o
 * foco do teclado dentro do carrossel. Sem biblioteca externa — mesmo
 * espírito dos outros hooks do projeto (useScrolledPast, useReveal).
 */
export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const count = slides.length;

  useEffect(() => {
    if (count <= 1 || paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [count, paused, reducedMotion]);

  if (count === 0) return null;

  const current = slides[index];
  const goTo = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Exemplos de carros da frota ROGAN"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') goTo(index + 1);
        if (event.key === 'ArrowLeft') goTo(index - 1);
      }}
    >
      <div className="relative aspect-[16/11] overflow-hidden rounded-2xl border border-ink-800 sm:aspect-[16/10]">
        {slides.map((slide, slideIndex) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            sizes="(min-width: 1024px) 44vw, 100vw"
            priority={slideIndex === 0}
            className="object-cover transition-opacity duration-700 ease-out"
            style={{ opacity: slideIndex === index ? 1 : 0 }}
            aria-hidden={slideIndex !== index}
          />
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Carro anterior"
              className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink-700 bg-ink-900/80 text-paper transition-colors hover:bg-ink-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Próximo carro"
              className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-ink-700 bg-ink-900/80 text-paper transition-colors hover:bg-ink-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <ChevronRight className="size-4" />
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.src}
                  type="button"
                  onClick={() => goTo(slideIndex)}
                  aria-label={`Ver ${slide.name}`}
                  aria-current={slideIndex === index}
                  className={`size-2 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    slideIndex === index ? 'bg-accent' : 'bg-ink-600'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <p className="mt-3 text-center text-[0.6875rem] text-mist-500 lg:text-right" aria-live="polite">
        Imagem ilustrativa do {current.name} — fotos reais da frota entram aqui.
      </p>
    </div>
  );
}
