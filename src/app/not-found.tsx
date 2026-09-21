import { Button } from '@/components/ui/Button';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { WhatsApp } from '@/components/ui/Icons';
import { buildWhatsAppUrl, generalMessage } from '@/lib/whatsapp';

export default function NotFound() {
  return (
    <section className="bg-paper">
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
        <span className="eyebrow text-accent-700">Erro 404</span>
        <h1 className="max-w-xl text-[2rem] leading-[1.1] font-extrabold text-ink sm:text-[2.5rem]">
          Essa página saiu da rota
        </h1>
        <p className="max-w-md text-[0.9375rem] leading-relaxed text-mist-600">
          O endereço que você tentou abrir não existe ou foi movido. Volte para a frota e escolha um
          carro, ou chame a gente no WhatsApp.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/frota" size="lg">
            Ver carros disponíveis
          </Button>
          <WhatsAppButton
            href={buildWhatsAppUrl(generalMessage())}
            origem="pagina_404"
            size="lg"
            variant="outline"
            icon={<WhatsApp className="size-5 text-whats-700" />}
          >
            Falar no WhatsApp
          </WhatsAppButton>
        </div>
      </div>
    </section>
  );
}
