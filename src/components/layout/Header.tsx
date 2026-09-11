'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { useScrolledPast } from '@/hooks/useScrolledPast';
import { siteConfig } from '@/config/site';
import { buildWhatsAppUrl, generalMessage } from '@/lib/whatsapp';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Close, Menu, WhatsApp } from '@/components/ui/Icons';

export function Header() {
  const pathname = usePathname();
  const scrolled = useScrolledPast(8);
  const [menuOpen, setMenuOpen] = useState(false);
  const whatsappUrl = buildWhatsAppUrl(generalMessage());

  // Trava o scroll do corpo enquanto o menu móvel está aberto.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300',
        scrolled
          ? 'border-b border-mist-200 bg-paper/90 shadow-[0_1px_20px_rgba(11,11,13,0.06)] backdrop-blur-md'
          : 'border-b border-transparent bg-paper',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <Logo />

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 lg:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                isActive(item.href) ? 'text-ink' : 'text-mist-600 hover:text-ink',
              )}
            >
              {item.label}
              <span
                className={cn(
                  'absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-accent transition-transform duration-300',
                  isActive(item.href) ? 'scale-x-100' : 'scale-x-0',
                )}
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* O wrapper controla a visibilidade: aplicar `hidden` direto no
              botão não funciona, porque `inline-flex` vence no CSS gerado. */}
          <span className="hidden sm:block">
            <Button
              href={whatsappUrl}
              external
              variant="dark"
              size="sm"
              icon={<WhatsApp className="size-4 text-whats" />}
            >
              Falar no WhatsApp
            </Button>
          </span>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="grid size-10 place-items-center rounded-full border border-mist-300 text-ink transition-colors hover:bg-mist-100 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* -------------------------------- Menu móvel -------------------------------- */}
      <div
        id="menu-mobile"
        hidden={!menuOpen}
        className="fixed inset-0 top-0 z-50 flex flex-col bg-ink text-paper lg:hidden"
      >
        <div className="container-page flex h-16 shrink-0 items-center justify-between">
          <Logo tone="light" />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu"
            className="grid size-10 place-items-center rounded-full border border-ink-700 text-paper transition-colors hover:bg-ink-800"
          >
            <Close className="size-5" />
          </button>
        </div>

        <nav
          aria-label="Navegação principal (móvel)"
          className="container-page flex flex-1 flex-col gap-1 overflow-y-auto pt-4 pb-8"
        >
          {siteConfig.nav.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              aria-current={isActive(item.href) ? 'page' : undefined}
              style={{ animationDelay: `${index * 40}ms` }}
              className={cn(
                'animate-slide-down flex items-center justify-between border-b border-ink-800 py-4 font-display text-2xl font-bold tracking-[-0.02em] transition-colors',
                isActive(item.href) ? 'text-accent' : 'text-paper hover:text-accent',
              )}
            >
              {item.label}
              <span aria-hidden="true" className="text-mist-600">
                {String(index + 1).padStart(2, '0')}
              </span>
            </Link>
          ))}

          <div className="mt-auto flex flex-col gap-3 pt-8">
            <Button
              href={whatsappUrl}
              external
              variant="whatsapp"
              size="lg"
              fullWidth
              onClick={() => setMenuOpen(false)}
              icon={<WhatsApp className="size-5" />}
            >
              Falar no WhatsApp
            </Button>
            <Button
              href="/frota"
              variant="light"
              size="lg"
              fullWidth
              onClick={() => setMenuOpen(false)}
            >
              Ver carros disponíveis
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
