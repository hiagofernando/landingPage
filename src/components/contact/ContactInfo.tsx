import { getFormattedAddress, getOpeningHours, siteConfig } from '@/config/site';
import { buildWhatsAppUrl, generalMessage } from '@/lib/whatsapp';
import { WhatsAppLink } from '@/components/shared/WhatsAppButton';
import { Clock, Instagram, MapPin, WhatsApp } from '@/components/ui/Icons';

/** Cartões de contato. Campos ainda não informados aparecem como pendentes. */
export function ContactInfo() {
  const hours = getOpeningHours();
  const address = getFormattedAddress();
  const addressPending = siteConfig.address.placeholder;

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      <li className="flex flex-col gap-3 rounded-2xl border border-mist-200 bg-white p-5">
        <span className="grid size-10 place-items-center rounded-full bg-whats/12 text-whats-700">
          <WhatsApp className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-bold text-ink">WhatsApp</h3>
          <p className="mt-1 text-sm text-mist-600">
            O canal principal de atendimento da {siteConfig.name}.
          </p>
        </div>
        <WhatsAppLink
          href={buildWhatsAppUrl(generalMessage())}
          origem="cartao_contato"
          className="mt-auto font-display text-[0.9375rem] font-semibold text-ink underline underline-offset-4 transition-colors hover:text-accent-700"
        >
          {siteConfig.whatsapp.display}
        </WhatsAppLink>
      </li>

      <li className="flex flex-col gap-3 rounded-2xl border border-mist-200 bg-white p-5">
        <span className="grid size-10 place-items-center rounded-full bg-accent-100 text-accent-700">
          <Instagram className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-bold text-ink">Instagram</h3>
          <p className="mt-1 text-sm text-mist-600">Novidades da frota e das campanhas.</p>
        </div>
        <a
          href={siteConfig.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto font-display text-[0.9375rem] font-semibold text-ink underline underline-offset-4 transition-colors hover:text-accent-700"
        >
          @{siteConfig.instagram.handle}
        </a>
      </li>

      <li className="flex flex-col gap-3 rounded-2xl border border-mist-200 bg-white p-5">
        <span className="grid size-10 place-items-center rounded-full bg-mist-100 text-ink-600">
          <MapPin className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-bold text-ink">Endereço</h3>
          <p className="mt-1 text-sm text-mist-600">
            Retirada em {siteConfig.city}-{siteConfig.state}.
          </p>
        </div>
        <p
          className={`mt-auto font-display text-[0.9375rem] font-semibold ${
            addressPending ? 'text-mist-600 italic' : 'text-ink'
          }`}
        >
          {address}
        </p>
      </li>

      <li className="flex flex-col gap-3 rounded-2xl border border-mist-200 bg-white p-5">
        <span className="grid size-10 place-items-center rounded-full bg-mist-100 text-ink-600">
          <Clock className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-bold text-ink">Horário de atendimento</h3>
          <p className="mt-1 text-sm text-mist-600">{siteConfig.openingHours.note}</p>
        </div>
        {hours ? (
          <dl className="mt-auto flex flex-col gap-1 text-[0.875rem]">
            {hours.map((line) => (
              <div key={line.days} className="flex justify-between gap-3">
                <dt className="text-mist-600">{line.days}</dt>
                <dd className="font-semibold text-ink">{line.hours}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-auto font-display text-[0.9375rem] font-semibold text-mist-600 italic">
            {siteConfig.openingHours.fallback}
          </p>
        )}
      </li>
    </ul>
  );
}
