import type { Metadata } from 'next';
import { getDataStore, getSecret } from '@/lib/cloudflare';
import { formatDateBR, pluralizeDays } from '@/lib/dates';
import { normalizeRef } from '@/lib/negotiations';
import { getNegotiation } from '@/lib/negotiation-store';
import { isNegotiationAction, verifyAction } from '@/lib/negotiation-tokens';
import { calculateDays } from '@/lib/pricing';
import { getVehicleBySlug } from '@/data/repository';
import { NegotiationActionButton } from '@/components/negotiation/NegotiationActionButton';

/**
 * Página que a equipe abre pelo link da ficha.
 *
 * Mostra o pedido e pede confirmação antes de mudar qualquer coisa. Existe
 * porque o WhatsApp abre todo link para montar a prévia: se o próprio link
 * fechasse a locação, ela fecharia sozinha no instante em que a ficha chega.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Negociação',
  robots: { index: false, follow: false },
};

interface NegotiationPageProps {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ acao?: string; t?: string }>;
}

export default async function NegotiationPage({ params, searchParams }: NegotiationPageProps) {
  const ref = normalizeRef((await params).ref);
  const { acao, t } = await searchParams;

  const secret = await getSecret('ROGAN_API_SECRET');
  const store = await getDataStore();

  // Token conferido aqui também, e não só no botão: um link adulterado não
  // pode nem mostrar os dados do pedido.
  const valid =
    ref !== null &&
    isNegotiationAction(acao) &&
    secret !== null &&
    (await verifyAction(secret, ref, acao, t));

  if (!valid || !store || !ref || !isNegotiationAction(acao) || !t) {
    return (
      <Shell title="Link inválido">
        <p>
          Este link não é válido. Use os links da ficha que chegou no WhatsApp, sem alterar nada no
          endereço.
        </p>
      </Shell>
    );
  }

  const negotiation = await getNegotiation(store, ref);

  if (!negotiation) {
    return (
      <Shell title="Negociação encerrada">
        <p>
          Não existe mais negociação com a referência <strong>{ref}</strong>. Ela já foi liberada
          por alguém da equipe, ou o período dela terminou.
        </p>
      </Shell>
    );
  }

  const vehicle = await getVehicleBySlug(negotiation.vehicleSlug);
  const days = calculateDays(negotiation.pickupDate, negotiation.returnDate);
  const isClosing = acao === 'fechar';

  return (
    <Shell title={isClosing ? 'Fechar locação' : 'Liberar carro'}>
      <dl className="grid gap-3 rounded-2xl border border-mist-200 bg-white p-5 text-sm">
        <Row
          label="Carro"
          value={vehicle ? `${vehicle.name} (${negotiation.code})` : negotiation.code}
        />
        <Row
          label="Período"
          value={`${formatDateBR(negotiation.pickupDate)} a ${formatDateBR(negotiation.returnDate)} · ${pluralizeDays(days)}`}
        />
        {negotiation.contact && <Row label="Cliente" value={`wa.me/${negotiation.contact}`} />}
        <Row
          label="Situação agora"
          value={negotiation.status === 'locado' ? 'Locado' : 'Em negociação'}
        />
        <Row label="Referência" value={ref} />
      </dl>

      <p>
        {isClosing
          ? 'Ao confirmar, este período passa a aparecer como indisponível no site para esse carro.'
          : 'Ao confirmar, a negociação sai do site e o período volta a ficar livre para outros clientes.'}
      </p>

      <NegotiationActionButton
        negotiationRef={ref}
        action={acao}
        token={t}
        alreadyDone={isClosing && negotiation.status === 'locado'}
      />
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-paper">
      <div className="container-page flex max-w-xl flex-col gap-5 py-14 text-[0.9375rem] leading-relaxed text-mist-600 lg:py-20">
        <span className="eyebrow text-accent-700">Equipe ROGAN</span>
        <h1 className="font-display text-3xl font-extrabold text-ink">{title}</h1>
        {children}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-mist-600">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}
