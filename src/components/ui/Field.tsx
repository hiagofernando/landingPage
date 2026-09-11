'use client';

import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Alert } from './Icons';

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  /** `light` para usar sobre fundo escuro. */
  tone?: 'default' | 'light';
  containerClassName?: string;
}

/**
 * Campo de formulário com rótulo sempre visível, dica opcional e mensagem de
 * erro associada via aria-describedby (leitores de tela anunciam o erro).
 */
export function Field({
  label,
  error,
  hint,
  icon,
  tone = 'default',
  className,
  containerClassName,
  ...inputProps
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ');

  const light = tone === 'light';

  return (
    <div className={cn('flex w-full flex-col gap-1.5', containerClassName)}>
      <label
        htmlFor={id}
        className={cn('text-[0.8125rem] font-semibold', light ? 'text-mist-300' : 'text-ink-700')}
      >
        {label}
      </label>

      <div className="relative">
        {icon && (
          <span
            className={cn(
              'pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2',
              light ? 'text-mist-500' : 'text-mist-600',
            )}
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            'h-12 w-full rounded-xl border text-[0.9375rem] transition-colors outline-none',
            'placeholder:text-mist-600',
            icon ? 'pr-3.5 pl-11' : 'px-3.5',
            light
              ? 'border-ink-700 bg-ink-900 text-paper focus:border-accent'
              : 'border-mist-300 bg-white text-ink focus:border-ink',
            error && (light ? 'border-danger' : 'border-danger bg-danger-100/40'),
            className,
          )}
          {...inputProps}
        />
      </div>

      {hint && !error && (
        <p id={hintId} className={cn('text-xs', light ? 'text-mist-500' : 'text-mist-600')}>
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-start gap-1.5 text-xs font-medium text-danger"
        >
          <Alert className="mt-px size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
