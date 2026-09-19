import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'dark' | 'outline' | 'ghost' | 'whatsapp' | 'light';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] ' +
  'transition-[background-color,color,border-color,transform,box-shadow] duration-200 ' +
  'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 select-none';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-ink hover:bg-accent-600 shadow-[0_1px_2px_rgba(10,25,48,0.12)] hover:shadow-[0_6px_20px_-6px_rgba(43,140,232,0.55)]',
  dark: 'bg-ink text-paper hover:bg-ink-800 shadow-[0_1px_2px_rgba(10,25,48,0.18)]',
  light: 'bg-paper text-ink hover:bg-white shadow-[0_1px_2px_rgba(10,25,48,0.12)]',
  outline: 'border border-mist-300 bg-transparent text-ink hover:border-ink hover:bg-mist-100',
  ghost: 'bg-transparent text-ink hover:bg-mist-100',
  whatsapp: 'bg-whats text-ink hover:bg-whats-600 shadow-[0_1px_2px_rgba(10,25,48,0.14)]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[0.8125rem]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-[0.9375rem]',
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
    /** Abre em nova aba com rel de segurança. */
    external?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Botão único do site. Renderiza `<button>`, `<Link>` (rota interna) ou
 * `<a>` (link externo) conforme as props recebidas.
 */
export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    fullWidth,
    icon,
    trailingIcon,
    className,
    children,
    ...rest
  } = props as CommonProps & Record<string, unknown>;

  const classes = cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);

  const content = (
    <>
      {icon}
      {children}
      {trailingIcon}
    </>
  );

  if (typeof rest.href === 'string') {
    const { href, external, ...anchorProps } = rest as unknown as {
      href: string;
      external?: boolean;
    } & AnchorHTMLAttributes<HTMLAnchorElement>;

    if (
      external ||
      href.startsWith('http') ||
      href.startsWith('tel:') ||
      href.startsWith('mailto:')
    ) {
      return (
        <a
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
          className={classes}
          {...anchorProps}
        >
          {content}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...anchorProps}>
        {content}
      </Link>
    );
  }

  const buttonProps = rest as unknown as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={buttonProps.type ?? 'button'} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
