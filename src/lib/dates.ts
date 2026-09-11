import type { ISODate } from '@/types';

/**
 * Utilitários de data baseados em string `YYYY-MM-DD`.
 *
 * Trabalhamos com strings (e não com `Date`) porque o site roda no servidor
 * (possivelmente em UTC) e no navegador do cliente (fuso do Brasil). Comparar
 * objetos `Date` nesse cenário gera os clássicos erros de "um dia a mais".
 */

/** Fuso horário de Carpina-PE. */
export const TIMEZONE = 'America/Recife';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidISODate(value: string | undefined | null): value is ISODate {
  if (!value || !ISO_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (month < 1 || month > 12) return false;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day >= 1 && day <= daysInMonth;
}

/** Data de hoje em Carpina-PE, no formato `YYYY-MM-DD`. */
export function today(): ISODate {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Converte `YYYY-MM-DD` em um timestamp UTC estável. */
function toUTC(date: ISODate): number {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

const MS_PER_DAY = 86_400_000;

/** Diferença em dias entre duas datas (`to - from`). */
export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((toUTC(to) - toUTC(from)) / MS_PER_DAY);
}

export function addDays(date: ISODate, amount: number): ISODate {
  return new Date(toUTC(date) + amount * MS_PER_DAY).toISOString().slice(0, 10);
}

export function isBefore(a: ISODate, b: ISODate): boolean {
  return toUTC(a) < toUTC(b);
}

export function isAfter(a: ISODate, b: ISODate): boolean {
  return toUTC(a) > toUTC(b);
}

export function isSameOrBefore(a: ISODate, b: ISODate): boolean {
  return toUTC(a) <= toUTC(b);
}

export function isSameOrAfter(a: ISODate, b: ISODate): boolean {
  return toUTC(a) >= toUTC(b);
}

/** Dois intervalos inclusivos se sobrepõem? */
export function rangesOverlap(
  aStart: ISODate,
  aEnd: ISODate,
  bStart: ISODate,
  bEnd: ISODate,
): boolean {
  return isSameOrBefore(aStart, bEnd) && isSameOrAfter(aEnd, bStart);
}

/** `2026-10-12` -> `12/10/2026` */
export function formatDateBR(date: ISODate): string {
  if (!isValidISODate(date)) return '';
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

const LONG_MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** `2026-10-12` -> `12 de outubro de 2026` */
export function formatDateLong(date: ISODate): string {
  if (!isValidISODate(date)) return '';
  const [year, month, day] = date.split('-').map(Number);
  return `${day} de ${LONG_MONTHS[month - 1]} de ${year}`;
}

/** Plural de diárias. */
export function pluralizeDays(days: number): string {
  return days === 1 ? '1 diária' : `${days} diárias`;
}
