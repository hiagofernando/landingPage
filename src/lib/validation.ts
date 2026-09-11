import type { ISODate } from '@/types';
import { addDays, isBefore, isValidISODate, today } from './dates';
import { onlyDigits } from './format';
import { pricingRules } from './pricing';

/** Mensagens curtas e humanas — nada de "campo obrigatório inválido". */

export interface DateRangeErrors {
  pickupDate?: string;
  returnDate?: string;
}

export function validateDateRange(
  pickupDate: string,
  returnDate: string,
  options: { required?: boolean } = {},
): DateRangeErrors {
  const errors: DateRangeErrors = {};
  const required = options.required ?? true;
  const currentDate = today();

  if (!pickupDate) {
    if (required) errors.pickupDate = 'Escolha a data de retirada.';
  } else if (!isValidISODate(pickupDate)) {
    errors.pickupDate = 'Data de retirada inválida.';
  } else if (isBefore(pickupDate, currentDate)) {
    errors.pickupDate = 'A retirada não pode ser em uma data que já passou.';
  } else if (isBefore(addDays(currentDate, pricingRules.maxAdvanceDays), pickupDate)) {
    errors.pickupDate = 'Para datas tão distantes, fale com a gente no WhatsApp.';
  }

  if (!returnDate) {
    if (required) errors.returnDate = 'Escolha a data de devolução.';
  } else if (!isValidISODate(returnDate)) {
    errors.returnDate = 'Data de devolução inválida.';
  } else if (isValidISODate(pickupDate) && isBefore(returnDate, pickupDate)) {
    errors.returnDate = 'A devolução precisa ser no mesmo dia ou depois da retirada.';
  } else if (
    isValidISODate(pickupDate) &&
    returnDate === pickupDate &&
    !pricingRules.sameDayCountsAsOneDay
  ) {
    errors.returnDate = 'Escolha uma data de devolução a partir do dia seguinte.';
  }

  return errors;
}

/** Há alguma mensagem de erro preenchida no objeto de validação? */
export function hasErrors(errors: object): boolean {
  return Object.values(errors).some(Boolean);
}

export function validateName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return 'Informe seu nome.';
  if (trimmed.length < 2) return 'Digite seu nome completo.';
  if (trimmed.length > 80) return 'Nome muito longo.';
  return undefined;
}

/**
 * Telefone brasileiro: 10 dígitos (fixo) ou 11 dígitos (celular, que precisa
 * começar com 9 depois do DDD). DDD válido vai de 11 a 99.
 */
export function validatePhone(phone: string): string | undefined {
  const digits = onlyDigits(phone);
  if (!digits) return 'Informe seu WhatsApp com DDD.';
  if (digits.length < 10) return 'Telefone incompleto. Inclua o DDD.';
  if (digits.length > 11) return 'Telefone com dígitos demais.';

  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99) return 'DDD inválido.';

  if (digits.length === 11 && digits[2] !== '9') {
    return 'Celular deve começar com 9 depois do DDD.';
  }

  return undefined;
}

export interface BookingFormValues {
  name: string;
  phone: string;
  pickupDate: ISODate | '';
  returnDate: ISODate | '';
}

export interface BookingFormErrors {
  name?: string;
  phone?: string;
  pickupDate?: string;
  returnDate?: string;
}

export function validateBookingForm(values: BookingFormValues): BookingFormErrors {
  return {
    name: validateName(values.name),
    phone: validatePhone(values.phone),
    ...validateDateRange(values.pickupDate, values.returnDate),
  };
}
