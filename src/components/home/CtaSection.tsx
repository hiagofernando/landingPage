import { siteConfig } from '@/config/site';
import { buildWhatsAppUrl, generalMessage } from '@/lib/whatsapp';
import { Button } from '@/components/ui/Button';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { ArrowRight, WhatsApp } from '@/components/ui/Icons';

/** Bloco de conversão final, logo antes do rodapé. */
export function CtaSection() {
  return (
    <section aria-labelledby="cta-final" className="bg-ink text-paper">
      <div className="container-page relative overflow-hidden py-16 lg:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 60% at 85% 40%, rgba(59,158,255,0.2) 0%, rgba(10,25,48,0) 70%)',
          }}
        />

        <div className="relative flex flex-col items-start gap-7 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-xl">
            <span className="eyebrow text-accent">Pronto quando você estiver</span>
            <h2
              id="cta-final"
              className="mt-3 text-[1.875rem] leading-[1.1] font-extrabold sm:text-[2.375rem]"
            >
              Pronto para pegar a estrada?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-mist-300">
              Manda mensagem com o carro e as datas que você quer. A gente confirma a
              disponibilidade e combina a retirada com você. Simples assim.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:shrink-0 lg:flex-col xl:flex-row">
            <WhatsAppButton
              href={buildWhatsAppUrl(generalMessage())}
              origem="cta_final"
              size="lg"
              variant="whatsapp"
              icon={<WhatsApp className="size-5" />}
              className="w-full sm:w-auto"
            >
              Falar com a {siteConfig.name} no WhatsApp
            </WhatsAppButton>
            <Button
              href="/frota"
              size="lg"
              variant="outline"
              className="w-full border-ink-600 text-paper hover:border-paper hover:bg-ink-800 sm:w-auto"
              trailingIcon={<ArrowRight className="size-4" />}
            >
              Ver carros disponíveis
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
