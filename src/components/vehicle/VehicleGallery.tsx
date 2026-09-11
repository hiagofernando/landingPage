'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { VehiclePhoto } from '@/types';
import { cn } from '@/lib/cn';
import { ChevronLeft, ChevronRight } from '@/components/ui/Icons';

/**
 * Galeria do veículo. Funciona com uma única foto (esconde as miniaturas) e
 * com várias. Navegável por teclado e por toque.
 */
export function VehicleGallery({ photos, name }: { photos: VehiclePhoto[]; name: string }) {
  const [index, setIndex] = useState(0);
  const total = photos.length;
  const current = photos[index];

  const go = (direction: 1 | -1) => setIndex((prev) => (prev + direction + total) % total);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-mist-200 bg-mist-100"
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') go(1);
          if (event.key === 'ArrowLeft') go(-1);
        }}
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          sizes="(min-width: 1024px) 58vw, 100vw"
          priority
          className="animate-fade-in object-cover"
        />

        <span className="absolute bottom-3 left-3 rounded-full bg-ink/75 px-3 py-1.5 text-[0.6875rem] font-medium text-mist-300 backdrop-blur-sm">
          Imagem ilustrativa — a foto real do veículo entra aqui
        </span>

        {total > 1 && (
          <>
            <GalleryArrow side="left" onClick={() => go(-1)} />
            <GalleryArrow side="right" onClick={() => go(1)} />
            <span className="absolute top-3 right-3 rounded-full bg-ink/75 px-2.5 py-1 text-[0.6875rem] font-medium text-paper tabular-nums backdrop-blur-sm">
              {index + 1}/{total}
            </span>
          </>
        )}
      </div>

      {total > 1 && (
        <ul className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {photos.map((photo, photoIndex) => (
            <li key={photo.src}>
              <button
                type="button"
                onClick={() => setIndex(photoIndex)}
                aria-label={`Ver imagem ${photoIndex + 1} de ${total} do ${name}`}
                aria-current={photoIndex === index}
                className={cn(
                  'relative block aspect-[4/3] w-full overflow-hidden rounded-xl border-2 transition-colors',
                  photoIndex === index
                    ? 'border-accent'
                    : 'border-transparent hover:border-mist-300',
                )}
              >
                <Image
                  src={photo.src}
                  alt=""
                  fill
                  sizes="120px"
                  loading="lazy"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GalleryArrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Imagem anterior' : 'Próxima imagem'}
      className={cn(
        'absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full',
        'bg-paper/85 text-ink shadow-[0_4px_16px_rgba(11,11,13,0.18)] backdrop-blur-sm',
        'transition-colors hover:bg-paper',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
