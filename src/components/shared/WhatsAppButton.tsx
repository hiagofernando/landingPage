'use client';

import type { ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics';
import { Button } from '@/components/ui/Button';
import type { ButtonSize, ButtonVariant } from '@/components/ui/Button';

interface WhatsAppButtonProps {
  /** Link `wa.me` já montado por `buildWhatsAppUrl`. */
  href: string;
  /**
   * De onde partiu o clique: 'hero', 'rodape', 'faq', 'contato'...
   * É o que responde "qual CTA do site realmente traz conversa".
   */
  origem: string;
  /** Slug do veículo, quando o botão está em cima de um carro. */
  veiculo?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Botão de WhatsApp que registra o clique antes de sair do site.
 *
 * Existe para que as páginas possam continuar sendo componentes de servidor:
 * só este pedacinho vira JavaScript no navegador, em vez de a página inteira.
 */
export function WhatsAppButton({
  href,
  origem,
  veiculo,
  children,
  ...buttonProps
}: WhatsAppButtonProps) {
  return (
    <Button
      href={href}
      external
      onClick={() => trackEvent('whatsapp_direto', { origem, veiculo })}
      {...buttonProps}
    >
      {children}
    </Button>
  );
}

interface WhatsAppLinkProps {
  href: string;
  origem: string;
  className?: string;
  children: ReactNode;
}

/**
 * Mesma ideia do `WhatsAppButton`, para os lugares onde o WhatsApp aparece
 * como link de texto (rodapé, cartão de contato) em vez de botão.
 */
export function WhatsAppLink({ href, origem, className, children }: WhatsAppLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackEvent('whatsapp_direto', { origem })}
    >
      {children}
    </a>
  );
}
