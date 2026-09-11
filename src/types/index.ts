/**
 * Modelos de domínio da ROGAN.
 *
 * Todos os tipos aqui foram desenhados para espelhar tabelas de um banco de
 * dados relacional. Quando o banco existir, basta trocar a implementação em
 * `src/data/repository.ts` — nenhum componente precisa mudar.
 */

/** Data no formato `YYYY-MM-DD`. Usamos string para evitar bugs de fuso horário. */
export type ISODate = string;

export type VehicleCategory = 'hatch' | 'sedan' | 'suv' | 'picape' | 'utilitario';

export type Transmission = 'manual' | 'automatico';

export type Fuel = 'flex' | 'gasolina' | 'etanol' | 'diesel' | 'hibrido' | 'eletrico';

/** Situação cadastral do veículo (independe do período consultado). */
export type VehicleStatus = 'ativo' | 'manutencao' | 'inativo';

export interface VehiclePhoto {
  /** Caminho em /public ou URL absoluta de um CDN. */
  src: string;
  alt: string;
}

/** Período em que o veículo não pode ser locado (locação existente, manutenção, etc). */
export interface UnavailablePeriod {
  start: ISODate;
  end: ISODate;
  reason?: string;
}

export interface Vehicle {
  id: string;
  /** Usado na URL: /frota/[slug] */
  slug: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  transmission: Transmission;
  fuel: Fuel;
  seats: number;
  /** Capacidade do porta-malas em litros. */
  trunk: number;
  doors: number;
  airConditioning: boolean;
  dailyPrice: number;
  /** Preço fechado do pacote semanal (7 diárias). */
  weeklyPrice: number;
  /** Preço fechado do pacote mensal (30 diárias). */
  monthlyPrice: number;
  photos: VehiclePhoto[];
  description: string;
  highlights: string[];
  /** Disponibilidade geral do veículo no catálogo. */
  available: boolean;
  status: VehicleStatus;
  unavailablePeriods: UnavailablePeriod[];
}

/** Solicitação de locação enviada pelo site (não é uma reserva confirmada). */
export interface BookingRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  pickupDate: ISODate;
  returnDate: ISODate;
  estimatedTotal: number;
  status: BookingRequestStatus;
  createdAt: string;
  notes?: string;
}

export type BookingRequestStatus = 'solicitada' | 'em_atendimento' | 'confirmada' | 'cancelada';

export interface SeasonalCampaign {
  id: string;
  name: string;
  /** Início da campanha (inclusive). */
  startDate: ISODate;
  /** Fim da campanha (inclusive). */
  endDate: ISODate;
  /** Etiqueta curta exibida acima do título. Ex.: "São João 2026". */
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  /** Caminho da imagem/banner opcional da campanha. */
  image?: string;
  /** Mensagem pré-preenchida do WhatsApp durante a campanha. */
  whatsappMessage?: string;
  active: boolean;
  /** Campanha institucional usada quando nenhuma sazonal está ativa. */
  isDefault?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'locacao' | 'valores' | 'atendimento' | 'retirada';
}

/** Filtros aplicados na página de frota. */
export interface FleetFilters {
  category: VehicleCategory | 'todas';
  transmission: Transmission | 'todos';
  fuel: Fuel | 'todos';
  onlyAvailable: boolean;
}

export interface DateRange {
  pickupDate: ISODate | '';
  returnDate: ISODate | '';
}
