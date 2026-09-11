import { siteConfig } from '@/config/site';
import type { ISODate, Vehicle } from '@/types';
import { formatDateBR, pluralizeDays } from './dates';
import { formatCurrency } from './format';

/**
 * Toda mensagem enviada para o WhatsApp da ROGAN é montada aqui.
 * Mudou o tom de voz? Edite só este arquivo.
 */

const WHATSAPP_BASE_URL = 'https://wa.me';

/** Monta o link do WhatsApp com a mensagem já preenchida. */
export function buildWhatsAppUrl(message?: string): string {
  const number = siteConfig.whatsapp.number;
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `${WHATSAPP_BASE_URL}/${number}${query}`;
}

/** Mensagem genérica do botão flutuante e do header. */
export function generalMessage(context?: string): string {
  const base = `Olá! Vim pelo site da ${siteConfig.name} e gostaria de falar sobre aluguel de carro.`;
  return context ? `${base}\n\n${context}` : base;
}

/** Mensagem para quem clicou no card de um veículo sem escolher datas. */
export function vehicleInterestMessage(vehicle: Vehicle): string {
  return [
    `Olá! Tenho interesse em alugar o ${vehicle.name} ${vehicle.year}.`,
    '',
    'Gostaria de saber a disponibilidade e as condições da locação.',
  ].join('\n');
}

export interface BookingMessageInput {
  vehicle: Vehicle;
  customerName: string;
  customerPhone?: string;
  pickupDate: ISODate;
  returnDate: ISODate;
  days: number;
  estimatedTotal: number;
}

/**
 * Mensagem completa da solicitação de locação.
 *
 * Texto proposital: o cliente pede para CONFIRMAR a disponibilidade. O site
 * nunca afirma que a reserva está fechada.
 */
export function bookingRequestMessage(input: BookingMessageInput): string {
  const { vehicle, customerName, customerPhone, pickupDate, returnDate, days, estimatedTotal } =
    input;

  const lines = [
    `Olá! Tenho interesse em alugar o ${vehicle.name} ${vehicle.year}.`,
    '',
    `Retirada: ${formatDateBR(pickupDate)}`,
    `Devolução: ${formatDateBR(returnDate)}`,
    `Período: ${pluralizeDays(days)}`,
    `Valor estimado no site: ${formatCurrency(estimatedTotal)}`,
    '',
    `Meu nome é ${customerName.trim()}.`,
  ];

  if (customerPhone?.trim()) {
    lines.push(`Meu contato: ${customerPhone.trim()}`);
  }

  lines.push('', 'Gostaria de confirmar a disponibilidade e saber as condições da locação.');

  return lines.join('\n');
}

/** Mensagem usada quando o cliente não encontrou nada para as datas dele. */
export function noResultsMessage(pickupDate?: string, returnDate?: string): string {
  const lines = [
    `Olá! Procurei no site da ${siteConfig.name} e não encontrei carros para as minhas datas.`,
  ];
  if (pickupDate && returnDate) {
    lines.push(
      '',
      `Retirada: ${formatDateBR(pickupDate)}`,
      `Devolução: ${formatDateBR(returnDate)}`,
    );
  }
  lines.push('', 'Vocês teriam alguma opção para esse período?');
  return lines.join('\n');
}
