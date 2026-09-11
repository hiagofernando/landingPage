'use client';

import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useReveal } from '@/hooks/useReveal';

/** Envolve um bloco para que ele apareça suavemente ao entrar na tela. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useReveal<HTMLDivElement>(delay);
  return (
    <Tag ref={ref} data-revealed="false" className={cn('reveal', className)}>
      {children}
    </Tag>
  );
}
