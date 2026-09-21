'use client';

import { useEffect, useState } from 'react';
import type { PublicNegotiation } from '@/types';
import { isValidISODate } from '@/lib/dates';

/**
 * Situação da frota vinda do WhatsApp: negociações abertas e períodos já
 * locados depois do último deploy.
 *
 * Buscada no navegador, e não no servidor, para que as páginas continuem
 * estáticas e servidas pela CDN. Enquanto a resposta não chega (ou se ela
 * falhar), a lista é vazia: o site funciona igual, só sem selo.
 *
 * Uma busca para a página inteira: a frota tem vários cards, e cada um
 * chamando a API seria desperdício. O resultado vale por um minuto — quem
 * navega pelo site muito tempo volta a ver o estado atualizado.
 */

const ENDPOINT = '/api/negociacoes';
const FRESH_FOR_MS = 60_000;

let cached: { at: number; request: Promise<PublicNegotiation[]> } | null = null;

/** Descarta o que não tiver a forma esperada: a resposta vem da rede. */
function sanitize(value: unknown): PublicNegotiation[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is PublicNegotiation =>
      typeof entry?.code === 'string' &&
      isValidISODate(entry.pickupDate) &&
      isValidISODate(entry.returnDate) &&
      (entry.status === 'em_negociacao' || entry.status === 'locado'),
  );
}

function load(): Promise<PublicNegotiation[]> {
  if (cached && Date.now() - cached.at < FRESH_FOR_MS) return cached.request;

  const request = fetch(ENDPOINT)
    .then((response) => (response.ok ? response.json() : null))
    .then((body: { negociacoes?: unknown } | null) => sanitize(body?.negociacoes))
    .catch(() => []);

  cached = { at: Date.now(), request };
  return request;
}

export function useFleetStatus(): PublicNegotiation[] {
  const [entries, setEntries] = useState<PublicNegotiation[]>([]);

  useEffect(() => {
    let active = true;
    load().then((loaded) => {
      if (active) setEntries(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  return entries;
}
