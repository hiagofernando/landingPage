import { siteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from '@/components/ui/Icons';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal } from '@/components/shared/Reveal';

const steps = [
  {
    title: 'Escolha as datas',
    text: 'Informe quando quer retirar e devolver o carro. O site já filtra o que está livre nesse período.',
  },
  {
    title: 'Escolha o carro',
    text: 'Compare os modelos disponíveis pelo que importa: lugares, porta-malas, câmbio e consumo.',
  },
  {
    title: 'Confira a estimativa',
    text: 'O valor aparece na hora, com o detalhamento das diárias e dos pacotes semanal e mensal.',
  },
  {
    title: 'Fale com a ROGAN no WhatsApp',
    text: 'A mensagem vai pronta, com carro, datas e valor. A partir daí, uma pessoa da equipe assume.',
  },
];

interface HowItWorksProps {
  /** `light` usa fundo claro; `dark`, fundo escuro. */
  variant?: 'light' | 'dark';
  showCta?: boolean;
}

export function HowItWorks({ variant = 'light', showCta = true }: HowItWorksProps) {
  const dark = variant === 'dark';

  return (
    <section
      id="como-funciona"
      aria-labelledby="como-funciona-titulo"
      className={dark ? 'bg-ink text-paper' : 'bg-paper'}
    >
      <div className="container-page py-16 lg:py-24">
        <SectionHeading
          eyebrow="Como funciona"
          tone={dark ? 'light' : 'dark'}
          title={<span id="como-funciona-titulo">Da escolha ao WhatsApp em quatro passos</span>}
          description="Sem cadastro, sem pagamento online, sem burocracia. O site organiza a informação; a locação é fechada com a nossa equipe."
        />

        <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.title} as="li" delay={index * 70}>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={
                      dark
                        ? 'font-display text-3xl font-extrabold text-accent'
                        : 'font-display text-3xl font-extrabold text-accent-600'
                    }
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`h-px flex-1 ${dark ? 'bg-ink-700' : 'bg-mist-200'}`}
                  />
                </div>
                <h3
                  className={`font-display text-lg font-bold ${dark ? 'text-paper' : 'text-ink'}`}
                >
                  {step.title}
                </h3>
                <p
                  className={`text-[0.875rem] leading-relaxed ${dark ? 'text-mist-400' : 'text-mist-600'}`}
                >
                  {step.text}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>

        <div
          className={`mt-12 flex flex-col gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between ${
            dark ? 'border-ink-700 bg-ink-900' : 'border-mist-200 bg-white'
          }`}
        >
          <p
            className={`max-w-2xl text-[0.875rem] leading-relaxed ${dark ? 'text-mist-300' : 'text-mist-600'}`}
          >
            <strong className={dark ? 'font-semibold text-paper' : 'font-semibold text-ink'}>
              Importante:
            </strong>{' '}
            o envio pelo site é uma solicitação de locação, não uma reserva confirmada. A
            confirmação final e as condições são combinadas com a equipe da {siteConfig.name} pelo
            WhatsApp.
          </p>
          {showCta && (
            <Button
              href="/frota"
              variant={dark ? 'primary' : 'dark'}
              className="shrink-0"
              trailingIcon={<ArrowRight className="size-4" />}
            >
              Escolher meu carro
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
