import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  className?: string;
  /** Nível semântico do título. */
  as?: 'h2' | 'h3';
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
  className,
  as: Tag = 'h2',
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex max-w-2xl flex-col gap-3.5',
        align === 'center' && 'mx-auto items-center text-center',
        className,
      )}
    >
      {eyebrow && (
        <span className={cn('eyebrow', tone === 'dark' ? 'text-accent-700' : 'text-accent')}>
          {eyebrow}
        </span>
      )}
      <Tag
        className={cn(
          'text-[1.75rem] leading-[1.12] font-bold sm:text-[2.125rem] lg:text-[2.5rem]',
          tone === 'dark' ? 'text-ink' : 'text-paper',
        )}
      >
        {title}
      </Tag>
      {description && (
        <p
          className={cn(
            'text-[0.9375rem] leading-relaxed sm:text-base',
            tone === 'dark' ? 'text-mist-600' : 'text-mist-400',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
