import Link from 'next/link';
import { getFormattedAddress, getOpeningHours, siteConfig } from '@/config/site';
import { buildWhatsAppUrl, generalMessage } from '@/lib/whatsapp';
import { Logo } from '@/components/ui/Logo';
import { Clock, Instagram, MapPin, WhatsApp } from '@/components/ui/Icons';

const year = new Date().getFullYear();

export function Footer() {
  const hours = getOpeningHours();
  const address = getFormattedAddress();
  const addressPending = siteConfig.address.placeholder;

  return (
    <footer className="bg-ink text-mist-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4 lg:py-16">
        {/* Marca */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          <Logo tone="light" showTagline />
          <p className="max-w-xs text-sm leading-relaxed text-mist-400">
            Aluguel de carros em {siteConfig.city}-{siteConfig.state} e região. Você escolhe o carro
            e as datas; a gente cuida do resto pelo WhatsApp.
          </p>
        </div>

        {/* Navegação */}
        <nav aria-labelledby="footer-nav" className="flex flex-col gap-4">
          <h2 id="footer-nav" className="eyebrow text-mist-500">
            Navegação
          </h2>
          <ul className="flex flex-col gap-2.5">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-mist-300 transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contato */}
        <div className="flex flex-col gap-4">
          <h2 className="eyebrow text-mist-500">Contato</h2>
          <ul className="flex flex-col gap-3.5 text-sm">
            <li>
              <a
                href={buildWhatsAppUrl(generalMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-mist-300 transition-colors hover:text-accent"
              >
                <WhatsApp className="size-4 shrink-0 text-whats" />
                <span>
                  WhatsApp
                  <span className="ml-1.5 text-mist-500">{siteConfig.whatsapp.display}</span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={siteConfig.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-mist-300 transition-colors hover:text-accent"
              >
                <Instagram className="size-4 shrink-0" />
                <span>@{siteConfig.instagram.handle}</span>
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-mist-500" />
              <span className={addressPending ? 'text-mist-500 italic' : 'text-mist-300'}>
                {address}
              </span>
            </li>
          </ul>
        </div>

        {/* Atendimento */}
        <div className="flex flex-col gap-4">
          <h2 className="eyebrow text-mist-500">Atendimento</h2>
          {hours ? (
            <ul className="flex flex-col gap-2.5 text-sm">
              {hours.map((line) => (
                <li key={line.days} className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 size-4 shrink-0 text-mist-500" />
                  <span>
                    <span className="block text-mist-300">{line.days}</span>
                    <span className="block text-mist-500">{line.hours}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-start gap-2.5 text-sm text-mist-500 italic">
              <Clock className="mt-0.5 size-4 shrink-0" />
              {siteConfig.openingHours.fallback}
            </p>
          )}
          <p className="text-xs leading-relaxed text-mist-500">{siteConfig.openingHours.note}</p>
        </div>
      </div>

      <div className="border-t border-ink-800">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-mist-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalName}. Todos os direitos reservados.
          </p>
          <p className="max-w-md sm:text-right">
            As solicitações enviadas pelo site são confirmadas pela nossa equipe no WhatsApp. Os
            valores exibidos são estimativas.
          </p>
        </div>
      </div>
    </footer>
  );
}
