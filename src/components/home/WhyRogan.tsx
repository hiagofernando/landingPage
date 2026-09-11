import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { Check } from '@/components/ui/Icons';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal } from '@/components/shared/Reveal';

const reasons = [
  {
    title: 'Atendimento humano, do começo ao fim',
    text: 'Nada de robô repetindo menu. Você fala com alguém da equipe, que confirma a disponibilidade e resolve o que for preciso.',
  },
  {
    title: 'Perto de você',
    text: `Somos uma locadora de ${siteConfig.city}. Conhecemos a região, as estradas daqui e o que cada cliente costuma precisar.`,
  },
  {
    title: 'Do jeito que o seu período pedir',
    text: 'Um dia para resolver um compromisso, uma semana de férias ou o mês inteiro para trabalhar. Você escolhe.',
  },
  {
    title: 'O valor antes da conversa',
    text: 'Você já entra no WhatsApp sabendo quanto fica. Sem precisar perguntar preço e esperar resposta para decidir.',
  },
];

export function WhyRogan() {
  return (
    <section aria-labelledby="por-que-titulo" className="bg-paper">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
        <div>
          <SectionHeading
            eyebrow={`Por que a ${siteConfig.name}`}
            title={<span id="por-que-titulo">Você escolhe o carro. A gente cuida do resto.</span>}
            description="A ROGAN existe para resolver um problema simples: você precisa de um carro por alguns dias e não quer perder tempo com burocracia para conseguir."
          />

          <ul className="mt-9 flex flex-col gap-6">
            {reasons.map((reason, index) => (
              <Reveal key={reason.title} as="li" delay={index * 60}>
                <div className="flex gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent-100 text-accent-700"
                  >
                    <Check className="size-3.5" />
                  </span>
                  <div>
                    <h3 className="font-display text-[0.9375rem] font-bold text-ink">
                      {reason.title}
                    </h3>
                    <p className="mt-1 text-[0.875rem] leading-relaxed text-mist-600">
                      {reason.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-mist-200 bg-mist-100">
            <Image
              src="/frota/sedan-studio.svg"
              alt="Ilustração de um sedã representando os veículos da ROGAN"
              fill
              sizes="(min-width: 1024px) 46vw, 100vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-5 right-5 rounded-xl border border-mist-200 bg-white p-4 shadow-[0_16px_40px_-24px_rgba(11,11,13,0.5)] sm:left-8 sm:right-auto sm:max-w-xs">
            <p className="font-display text-sm font-bold text-ink">
              Locadora de {siteConfig.city}-{siteConfig.state}
            </p>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-mist-600">
              Atendemos {siteConfig.region}. Retirada combinada diretamente com a nossa equipe.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
