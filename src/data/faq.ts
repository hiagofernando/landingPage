import type { FaqItem } from '@/types';

/**
 * ============================================================================
 *  PERGUNTAS FREQUENTES
 * ============================================================================
 *  As respostas abaixo são propositalmente neutras nos pontos que dependem da
 *  política da ROGAN (documentos, caução, quilometragem, seguro). Nada foi
 *  inventado. Assim que a empresa definir essas regras, substitua os textos
 *  marcados com [DEFINIR] e remova o aviso de "confirme no atendimento".
 * ============================================================================
 */
export const faqItems: FaqItem[] = [
  {
    id: 'como-funciona',
    category: 'locacao',
    question: 'Como funciona o aluguel na ROGAN?',
    answer:
      'Você escolhe as datas de retirada e devolução, vê no site quais carros estão livres nesse período e seleciona o que preferir. O site mostra o valor estimado e monta uma mensagem pronta com esses dados. Ao clicar em "Continuar pelo WhatsApp", essa mensagem abre no aplicativo e a nossa equipe continua o atendimento a partir daí.',
  },
  {
    id: 'reserva-confirmada',
    category: 'atendimento',
    question: 'A reserva fica confirmada pelo site?',
    answer:
      'Não. O que sai do site é uma solicitação de locação. A confirmação acontece na conversa com a nossa equipe no WhatsApp, depois de checarmos a disponibilidade do veículo e combinarmos as condições com você.',
  },
  {
    id: 'um-dia',
    category: 'locacao',
    question: 'Posso alugar por apenas um dia?',
    answer:
      'Pode. A locação é feita por diária, e uma diária já é suficiente. Se a retirada e a devolução forem no mesmo dia, o período conta como uma diária.',
  },
  {
    id: 'semana-mes',
    category: 'valores',
    question: 'Posso alugar por uma semana ou por um mês?',
    answer:
      'Sim. Além da diária, trabalhamos com pacotes de 7 e de 30 dias, que saem mais em conta do que somar diárias avulsas. O site já aplica o melhor encaixe automaticamente quando você escolhe o período.',
  },
  {
    id: 'valor',
    category: 'valores',
    question: 'Como vejo o valor da locação?',
    answer:
      'Escolha as datas na busca ou na página do veículo. O site calcula a quantidade de diárias e mostra o valor estimado para aquele período, com o detalhamento do cálculo. Esse valor serve para você se planejar; o valor final é confirmado no atendimento.',
  },
  {
    id: 'estimativa',
    category: 'valores',
    question: 'O valor mostrado no site é o valor final?',
    answer:
      'É uma estimativa baseada na diária do veículo e no período que você escolheu. Eventuais condições específicas da locação são tratadas no atendimento, antes de fechar.',
  },
  {
    id: 'whatsapp',
    category: 'atendimento',
    question: 'Como funciona o atendimento pelo WhatsApp?',
    answer:
      'Quem responde é uma pessoa da equipe da ROGAN, não um robô. A mensagem já chega com o veículo, as datas e o valor estimado que você viu no site, então a conversa começa direto no que interessa: confirmar a disponibilidade e combinar a retirada.',
  },
  {
    id: 'retirada',
    category: 'retirada',
    question: 'Onde retiro o veículo?',
    answer:
      'A retirada é feita em Carpina-PE. O endereço completo será publicado aqui em breve. Enquanto isso, combinamos o ponto de retirada com você pelo WhatsApp.',
  },
  {
    id: 'documentos',
    category: 'locacao',
    question: 'Quais documentos são necessários?',
    answer:
      'As exigências de documentação são informadas pela nossa equipe no atendimento, antes de fechar a locação. Chame no WhatsApp e a gente passa a lista completa para o seu caso.',
  },
  {
    id: 'regiao',
    category: 'retirada',
    question: 'A ROGAN atende quais cidades?',
    answer:
      'Atendemos Carpina-PE e cidades da região. Se você está em uma cidade vizinha, fale com a gente pelo WhatsApp para confirmarmos o atendimento no seu caso.',
  },
  {
    id: 'antecedencia',
    category: 'locacao',
    question: 'Com quanta antecedência preciso solicitar?',
    answer:
      'Quanto antes, melhor — principalmente em feriados, São João, fim de ano e férias, quando a frota fica mais disputada. Mas se a sua necessidade é para hoje ou amanhã, mande mensagem mesmo assim: a gente verifica o que está livre.',
  },
  {
    id: 'cancelamento',
    category: 'atendimento',
    question: 'E se eu precisar mudar as datas?',
    answer:
      'Como a confirmação é feita no atendimento, é só avisar a nossa equipe pelo WhatsApp. Vamos verificar a disponibilidade para o novo período e ajustar o que for possível.',
  },
];
