'use client';

import { useState } from 'react';
import type { DateRange, Vehicle } from '@/types';
import { trackEvent } from '@/lib/analytics';
import { Button } from '@/components/ui/Button';
import type { ButtonSize, ButtonVariant } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { BookingForm } from './BookingForm';

interface RentNowButtonProps {
  vehicle: Vehicle;
  range?: DateRange;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * Botão "Alugar agora": abre o formulário de solicitação em um modal,
 * já com o veículo e as datas selecionadas.
 */
export function RentNowButton({
  vehicle,
  range,
  label = 'Alugar agora',
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
  disabled,
}: RentNowButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        className={className}
        disabled={disabled}
        onClick={() => {
          // Abertura do formulário: é o denominador da taxa de conversão.
          trackEvent('formulario_aberto', { veiculo: vehicle.slug });
          setOpen(true);
        }}
      >
        {label}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Solicitar ${vehicle.name}`}
        description="Preencha os dados e continue a conversa no WhatsApp."
        size="lg"
      >
        <BookingForm vehicle={vehicle} initialRange={range ?? { pickupDate: '', returnDate: '' }} />
      </Modal>
    </>
  );
}
