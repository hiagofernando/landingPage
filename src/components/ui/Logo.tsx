import Link from 'next/link';
import { cn } from '@/lib/cn';
import { siteConfig } from '@/config/site';

interface LogoProps {
  /** `dark` para fundos claros, `light` para fundos escuros. */
  tone?: 'dark' | 'light';
  /** Envolve a logo em um link para a home. */
  asLink?: boolean;
  className?: string;
  showTagline?: boolean;
}

/**
 * LOGOTIPO PROVISÓRIO DA ROGAN.
 *
 * A empresa ainda não forneceu um logotipo definitivo. Esta é uma marca
 * tipográfica provisória: o monograma "R" com um ponto em azul (cor real da
 * marca), ao lado da palavra ROGAN em tipografia pesada.
 *
 * Para trocar pelo logotipo oficial, substitua o conteúdo deste componente
 * (por exemplo, por uma tag <Image> apontando para o arquivo definitivo).
 * Nenhum outro arquivo precisa mudar: todo o site usa este componente.
 */
export function Logo({ tone = 'dark', asLink = true, className, showTagline }: LogoProps) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-[10px] transition-colors',
          tone === 'dark' ? 'bg-ink' : 'bg-paper',
        )}
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" focusable="false">
          {/* Monograma provisório: "R" de ROGAN com um ponto de destaque */}
          <path
            d="M5 20 L9.5 4h5.2a4.3 4.3 0 0 1 0 8.6h-3.4L15 20"
            fill="none"
            stroke={tone === 'dark' ? '#FAF9F6' : '#0A1930'}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18.2" cy="18.4" r="1.9" fill="#3B9EFF" />
        </svg>
      </span>

      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-[1.375rem] leading-none font-extrabold tracking-[-0.02em]',
            tone === 'dark' ? 'text-ink' : 'text-paper',
          )}
        >
          ROGAN
        </span>
        {showTagline && (
          <span
            className={cn(
              'mt-1 text-[0.625rem] font-medium tracking-[0.16em] uppercase',
              tone === 'dark' ? 'text-mist-600' : 'text-mist-400',
            )}
          >
            {siteConfig.tagline}
          </span>
        )}
      </span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link href="/" aria-label={`${siteConfig.name} — página inicial`} className="rounded-lg">
      {content}
    </Link>
  );
}
