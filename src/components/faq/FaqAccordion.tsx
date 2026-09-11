'use client';

import { useState } from 'react';
import type { FaqItem } from '@/types';
import { cn } from '@/lib/cn';
import { ChevronDown } from '@/components/ui/Icons';

/**
 * Acordeão de perguntas frequentes.
 * Botões com aria-expanded e região associada — funciona por teclado e é
 * anunciado corretamente por leitores de tela.
 */
export function FaqAccordion({
  items,
  defaultOpenId,
}: {
  items: FaqItem[];
  defaultOpenId?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);

  return (
    <div className="divide-y divide-mist-200 border-y border-mist-200">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.id)}
                aria-expanded={open}
                aria-controls={`faq-${item.id}`}
                id={`faq-botao-${item.id}`}
                className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-accent-700"
              >
                <span className="font-display text-[0.9375rem] font-semibold text-ink sm:text-base">
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full border border-mist-300 text-ink transition-transform duration-300',
                    open && 'rotate-180 border-ink bg-ink text-paper',
                  )}
                >
                  <ChevronDown className="size-4" />
                </span>
              </button>
            </h3>

            <div
              id={`faq-${item.id}`}
              role="region"
              aria-labelledby={`faq-botao-${item.id}`}
              hidden={!open}
              className="pb-6"
            >
              <p className="max-w-3xl text-[0.9375rem] leading-relaxed text-mist-600">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
