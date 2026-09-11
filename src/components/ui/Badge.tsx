import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type BadgeTone = 'neutral' | 'accent' | 'dark' | 'success' | 'danger' | 'outline';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-mist-100 text-ink-700',
  accent: 'bg-accent-100 text-accent-700',
  dark: 'bg-ink text-paper',
  success: 'bg-success/12 text-success',
  danger: 'bg-danger-100 text-danger',
  outline: 'border border-mist-300 text-ink-600',
};

export function Badge({
  children,
  tone = 'neutral',
  icon,
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.02em] whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
