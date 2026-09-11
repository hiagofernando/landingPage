import { Clock, Route, Shield, Sparkle, Users } from '@/components/ui/Icons';

/**
 * Diferenciais da ROGAN.
 * Nada de números inventados (anos de mercado, clientes atendidos): apenas o
 * que é verdadeiro sobre o modelo de atendimento.
 */
const highlights = [
  {
    icon: <Clock className="size-full" />,
    title: 'Atendimento rápido',
    text: 'Sua solicitação chega direto no WhatsApp da equipe, sem formulário longo nem espera por e-mail.',
  },
  {
    icon: <Sparkle className="size-full" />,
    title: 'Veículos selecionados',
    text: 'Carros escolhidos para o uso do dia a dia, para trabalho e para viagem em família.',
  },
  {
    icon: <Route className="size-full" />,
    title: 'Locação flexível',
    text: 'Um dia, uma semana ou um mês inteiro. Você escolhe o período que faz sentido.',
  },
  {
    icon: <Users className="size-full" />,
    title: 'Gente de verdade atendendo',
    text: 'Quem responde é uma pessoa da equipe, que confirma disponibilidade e tira suas dúvidas.',
  },
  {
    icon: <Shield className="size-full" />,
    title: 'Sem surpresa no valor',
    text: 'O site mostra a estimativa antes de você falar com a gente. O que combinarmos é o que vale.',
  },
];

export function Highlights() {
  return (
    <section aria-label="Diferenciais da ROGAN" className="border-b border-mist-200 bg-paper-alt">
      <div className="container-page py-12 lg:py-16">
        <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-8">
          {highlights.map((item) => (
            <li key={item.title} className="flex gap-3.5 lg:flex-col lg:gap-3">
              <span aria-hidden="true" className="size-6 shrink-0 text-accent-700 lg:size-7">
                {item.icon}
              </span>
              <div>
                <h3 className="font-display text-[0.9375rem] font-bold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-mist-600">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
