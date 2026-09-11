import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { MapPin, WhatsApp } from '@/components/ui/Icons';
import { buildWhatsAppUrl, generalMessage } from '@/lib/whatsapp';

/**
 * Mapa da loja.
 *
 * Enquanto o endereço não for informado, mostramos um espaço reservado em vez
 * de apontar para um lugar que não é o da ROGAN. Para ativar o mapa, preencha
 * `address.mapsEmbedUrl` em `src/config/site.ts` (ou a variável de ambiente
 * NEXT_PUBLIC_MAPS_EMBED_URL) com a URL de incorporação do Google Maps.
 */
export function MapEmbed() {
  const { mapsEmbedUrl, mapsLinkUrl, fallback } = siteConfig.address;

  if (mapsEmbedUrl) {
    return (
      <div className="flex flex-col gap-3">
        <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-mist-200 sm:aspect-[16/7]">
          <iframe
            src={mapsEmbedUrl}
            title={`Mapa com a localização da ${siteConfig.name} em ${siteConfig.city}-${siteConfig.state}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="size-full border-0"
          />
        </div>
        {mapsLinkUrl && (
          <Button href={mapsLinkUrl} external variant="outline" size="sm" className="w-fit">
            Como chegar
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex aspect-[16/10] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-mist-300 bg-mist-100/60 px-6 text-center sm:aspect-[16/7]">
      <span
        aria-hidden="true"
        className="grid size-12 place-items-center rounded-full bg-white text-mist-600"
      >
        <MapPin className="size-6" />
      </span>
      <div>
        <p className="font-display text-base font-bold text-ink">{fallback}</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-mist-600">
          Estamos em {siteConfig.city}-{siteConfig.state}. Assim que o endereço da loja for
          definido, ele aparece aqui junto com o mapa. Por enquanto, combinamos o ponto de retirada
          com você pelo WhatsApp.
        </p>
      </div>
      <Button
        href={buildWhatsAppUrl(generalMessage('Gostaria de saber onde retirar o veículo.'))}
        external
        variant="dark"
        size="sm"
        icon={<WhatsApp className="size-4 text-whats" />}
      >
        Combinar a retirada
      </Button>
    </div>
  );
}
