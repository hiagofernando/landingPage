import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight } from '@/components/ui/Icons';

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  children?: ReactNode;
}

/** Cabeçalho padrão das páginas internas, com trilha de navegação. */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
}: PageHeaderProps) {
  return (
    <section className="border-b border-mist-200 bg-paper-alt">
      <div className="container-page py-10 lg:py-14">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Você está aqui" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1 text-[0.8125rem] text-mist-600">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-1">
                  {index > 0 && (
                    <ChevronRight aria-hidden="true" className="size-3.5 text-mist-400" />
                  )}
                  {crumb.href ? (
                    <Link href={crumb.href} className="rounded transition-colors hover:text-ink">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-medium text-ink">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {eyebrow && <span className="eyebrow block text-accent-700">{eyebrow}</span>}
        <h1 className="mt-3 max-w-3xl text-[2rem] leading-[1.1] font-extrabold text-ink sm:text-[2.5rem]">
          {title}
        </h1>
        {description && (
          <div className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-mist-600 sm:text-base">
            {description}
          </div>
        )}
        {children && <div className="mt-7">{children}</div>}
      </div>
    </section>
  );
}
