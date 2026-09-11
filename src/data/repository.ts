import type { BookingRequest, Vehicle } from '@/types';
import { demoVehicles } from './vehicles';

/**
 * ============================================================================
 *  CAMADA DE ACESSO A DADOS
 * ============================================================================
 *  Este é o ÚNICO ponto do projeto que sabe de onde vêm os dados.
 *  Hoje ele lê o arquivo de frota demonstrativa. Para plugar um banco
 *  (Postgres, Supabase, Prisma, um CMS...), troque só o corpo das funções.
 *
 *  As funções já são assíncronas justamente para que essa troca não exija
 *  mudar nenhum componente.
 * ============================================================================
 */

export async function getVehicles(): Promise<Vehicle[]> {
  // Substituir por: return db.vehicle.findMany({ where: { available: true } })
  return demoVehicles.filter((vehicle) => vehicle.available);
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const vehicles = await getVehicles();
  return vehicles.find((vehicle) => vehicle.slug === slug) ?? null;
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  const vehicles = await getVehicles();
  return vehicles.find((vehicle) => vehicle.id === id) ?? null;
}

/**
 * Seleção da vitrine da home: um veículo de cada categoria, do mais barato
 * para o mais caro. Assim a home mostra a variedade real da frota em vez de
 * repetir quatro compactos parecidos.
 */
export async function getFeaturedVehicles(limit = 4): Promise<Vehicle[]> {
  const vehicles = await getVehicles();
  const byCategory = new Map<string, Vehicle>();

  for (const vehicle of [...vehicles].sort((a, b) => a.dailyPrice - b.dailyPrice)) {
    if (!byCategory.has(vehicle.category)) byCategory.set(vehicle.category, vehicle);
  }

  const featured = [...byCategory.values()];

  // Se houver menos categorias que o limite, completa com o restante da frota.
  if (featured.length < limit) {
    for (const vehicle of vehicles) {
      if (featured.length >= limit) break;
      if (!featured.includes(vehicle)) featured.push(vehicle);
    }
  }

  return featured.slice(0, limit);
}

/** Slugs usados para gerar as páginas estáticas de cada veículo. */
export async function getVehicleSlugs(): Promise<string[]> {
  const vehicles = await getVehicles();
  return vehicles.map((vehicle) => vehicle.slug);
}

/** Menor diária da frota — usada no texto "a partir de". */
export async function getLowestDailyPrice(): Promise<number | null> {
  const vehicles = await getVehicles();
  if (vehicles.length === 0) return null;
  return Math.min(...vehicles.map((vehicle) => vehicle.dailyPrice));
}

/**
 * Registro da solicitação de locação.
 *
 * Nesta primeira versão o site NÃO grava nada: a solicitação vai direto para o
 * WhatsApp, onde uma pessoa continua o atendimento. A função existe para que,
 * quando houver banco, baste implementar o corpo dela e chamá-la no
 * `BookingForm` antes de abrir o WhatsApp.
 */
export async function createBookingRequest(
  input: Omit<BookingRequest, 'id' | 'status' | 'createdAt'>,
): Promise<BookingRequest> {
  return {
    ...input,
    id: `req-${Date.now()}`,
    status: 'solicitada',
    createdAt: new Date().toISOString(),
  };
}
