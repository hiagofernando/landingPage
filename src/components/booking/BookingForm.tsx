'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { DateRange, Vehicle } from '@/types';
import { checkAvailability } from '@/lib/availability';
import { maskPhone } from '@/lib/format';
import { calculateDays, calculateQuote } from '@/lib/pricing';
import { buildWhatsAppUrl, bookingRequestMessage } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics';
import { hasErrors, validateBookingForm } from '@/lib/validation';
import type { BookingFormErrors } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Alert, ArrowRight, Check, WhatsApp } from '@/components/ui/Icons';
import { DateRangePicker } from '@/components/search/DateRangePicker';
import { BookingSummary } from './BookingSummary';

interface BookingFormProps {
  vehicle: Vehicle;
  initialRange: DateRange;
  onSent?: () => void;
}

/**
 * Formulário de solicitação de locação.
 *
 * Pede o mínimo possível (nome, WhatsApp e datas), mostra o resumo em tempo
 * real e encaminha para o WhatsApp com a mensagem pronta. Nada é gravado:
 * a conversa continua com uma pessoa da equipe.
 */
export function BookingForm({ vehicle, initialRange, onSent }: BookingFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [range, setRange] = useState<DateRange>(initialRange);
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [sent, setSent] = useState(false);

  const days = calculateDays(range.pickupDate || '', range.returnDate || '');
  const quote = useMemo(() => calculateQuote(vehicle, days), [vehicle, days]);

  const availability = checkAvailability(vehicle, range.pickupDate, range.returnDate);
  const blocked = !availability.available;

  const whatsappUrl = buildWhatsAppUrl(
    bookingRequestMessage({
      vehicle,
      customerName: name || 'cliente',
      customerPhone: phone,
      pickupDate: range.pickupDate || '',
      returnDate: range.returnDate || '',
      days,
      estimatedTotal: quote.total,
    }),
  );

  const handleContinue = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const validation = validateBookingForm({ name, phone, ...range });
    setErrors(validation);

    if (hasErrors(validation) || blocked) {
      event.preventDefault();
      // Saber ONDE as pessoas travam é metade do trabalho de melhorar o funil.
      trackEvent('formulario_invalido', {
        veiculo: vehicle.slug,
        origem: blocked ? 'periodo_indisponivel' : 'campos_incompletos',
      });
      // Leva o foco para o primeiro campo com erro.
      const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }

    /**
     * O passo mais importante do site. Registrado ANTES de a aba ir para o
     * WhatsApp: se a pessoa não apertar enviar lá, a ROGAN ainda assim fica
     * com o nome, o telefone e o carro para retomar o contato.
     */
    trackEvent(
      'solicitacao_enviada',
      {
        veiculo: vehicle.slug,
        dias: days,
        valor: quote.total,
        retirada: range.pickupDate || undefined,
        devolucao: range.returnDate || undefined,
      },
      { nome: name, telefone: phone || undefined },
    );

    setSent(true);
    onSent?.();
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-whats/12 text-whats-700">
          <Check className="size-7" />
        </span>
        <div>
          <h3 className="font-display text-lg font-bold text-ink">
            Sua solicitação foi aberta no WhatsApp
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-mist-600">
            É só enviar a mensagem que já está escrita. A partir daí, uma pessoa da equipe da ROGAN
            confirma a disponibilidade do {vehicle.name} e combina os detalhes com você.
          </p>
        </div>
        <Button
          href={whatsappUrl}
          external
          variant="whatsapp"
          icon={<WhatsApp className="size-4" />}
        >
          Abrir o WhatsApp de novo
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <Field
          label="Seu nome"
          placeholder="Como podemos te chamar?"
          value={name}
          autoComplete="name"
          error={errors.name}
          onChange={(event) => {
            setName(event.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
        />
        <Field
          label="Seu WhatsApp"
          placeholder="(81) 90000-0000"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          error={errors.phone}
          onChange={(event) => {
            setPhone(maskPhone(event.target.value));
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
          }}
        />
      </div>

      <DateRangePicker
        value={range}
        onChange={(next) => {
          setRange(next);
          setErrors((prev) => ({ ...prev, pickupDate: undefined, returnDate: undefined }));
        }}
        errors={{ pickupDate: errors.pickupDate, returnDate: errors.returnDate }}
      />

      {blocked && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-100 p-4 text-sm text-danger"
        >
          <Alert className="mt-0.5 size-4.5 shrink-0" />
          <div>
            <p className="font-semibold">{availability.message}</p>
            <p className="mt-1 text-danger/80">
              Escolha outro período ou{' '}
              <Link href="/frota" className="font-semibold underline underline-offset-2">
                confira outras opções disponíveis
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      <BookingSummary
        vehicle={vehicle}
        pickupDate={range.pickupDate || ''}
        returnDate={range.returnDate || ''}
        quote={quote}
      />

      <div className="flex flex-col gap-3">
        <Button
          href={whatsappUrl}
          external
          onClick={handleContinue}
          variant="whatsapp"
          size="lg"
          fullWidth
          icon={<WhatsApp className="size-5" />}
          trailingIcon={<ArrowRight className="size-4" />}
          aria-disabled={blocked || undefined}
          className={blocked ? 'pointer-events-none opacity-55' : undefined}
        >
          Continuar pelo WhatsApp
        </Button>
        <p className="text-center text-[0.6875rem] leading-relaxed text-mist-600">
          Ao continuar, abrimos o WhatsApp com a mensagem já escrita e registramos seu nome e
          contato com a equipe da ROGAN, que usa esses dados apenas para falar com você sobre esta
          locação.
        </p>
      </div>
    </div>
  );
}
