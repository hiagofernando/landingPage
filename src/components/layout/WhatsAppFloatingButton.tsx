'use client';

import { cn } from '@/lib/cn';
import { useScrolledPast } from '@/hooks/useScrolledPast';
import { buildWhatsAppUrl, generalMessage } from '@/lib/whatsapp';
import { WhatsApp } from '@/components/ui/Icons';

/**
 * Botão flutuante presente em todas as páginas.
 * Aparece depois de uma rolagem curta para não competir com o CTA do hero.
 */
export function WhatsAppFloatingButton() {
  const visible = useScrolledPast(320);

  return (
    // <aside> é um marco de navegação: mantém o botão dentro de um landmark.
    <aside aria-label="Atalho de contato">
      <a
        href={buildWhatsAppUrl(generalMessage())}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com a ROGAN no WhatsApp"
        className={cn(
          'group fixed right-4 bottom-4 z-40 flex items-center gap-2.5 rounded-full bg-whats py-3 pr-4 pl-3.5 text-ink',
          'shadow-[0_8px_28px_-6px_rgba(37,211,102,0.6)] transition-all duration-300 hover:bg-whats-600',
          'sm:right-6 sm:bottom-6',
          visible
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0',
        )}
      >
        <WhatsApp className="size-6 shrink-0" />
        <span className="hidden text-sm font-semibold sm:inline">Falar no WhatsApp</span>
      </a>
    </aside>
  );
}
