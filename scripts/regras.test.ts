import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  addDays,
  daysBetween,
  formatDateBR,
  formatDateLong,
  isValidISODate,
  pluralizeDays,
  rangesOverlap,
  today,
} from '@/lib/dates';
import { calculateDays, calculateQuote, pricingRules } from '@/lib/pricing';
import { checkAvailability } from '@/lib/availability';
import { validateDateRange, validateName, validatePhone } from '@/lib/validation';
import { maskPhone } from '@/lib/format';
import {
  blackFriday,
  carnavalTuesday,
  getActiveCampaign,
  mothersDay,
  resolveWindow,
} from '@/data/campaigns';
import { bookingRequestMessage, buildWhatsAppUrl } from '@/lib/whatsapp';
import {
  DEFAULT_FLEET_FILTERS,
  fleetQuery,
  fleetUrl,
  readFleetFilters,
  vehicleUrl,
} from '@/lib/urls';
import { demoVehicles } from '@/data/vehicles';
import type { Vehicle } from '@/types';

/** Veículo de teste com preços redondos, para as contas ficarem óbvias. */
const carro: Vehicle = {
  ...demoVehicles[0],
  id: 'teste',
  slug: 'teste',
  name: 'Carro de Teste',
  dailyPrice: 100,
  weeklyPrice: 600,
  monthlyPrice: 2000,
  unavailablePeriods: [{ start: '2026-07-10', end: '2026-07-15', reason: 'teste' }],
};

describe('datas', () => {
  it('valida o formato YYYY-MM-DD', () => {
    assert.equal(isValidISODate('2026-02-28'), true);
    assert.equal(isValidISODate('2026-02-30'), false, 'fevereiro não tem dia 30');
    assert.equal(isValidISODate('2028-02-29'), true, '2028 é bissexto');
    assert.equal(isValidISODate('2026-13-01'), false);
    assert.equal(isValidISODate('28/02/2026'), false);
    assert.equal(isValidISODate(''), false);
  });

  it('conta dias atravessando mês e ano', () => {
    assert.equal(daysBetween('2026-01-31', '2026-02-01'), 1);
    assert.equal(daysBetween('2026-12-31', '2027-01-01'), 1);
    assert.equal(daysBetween('2026-03-01', '2026-02-28'), -1);
    assert.equal(daysBetween('2026-01-01', '2027-01-01'), 365);
  });

  it('soma dias', () => {
    assert.equal(addDays('2026-02-27', 2), '2026-03-01');
    assert.equal(addDays('2026-01-01', -1), '2025-12-31');
  });

  it('detecta sobreposição de períodos', () => {
    const bloqueio = ['2026-07-10', '2026-07-15'] as const;
    assert.equal(rangesOverlap('2026-07-01', '2026-07-05', ...bloqueio), false, 'antes');
    assert.equal(rangesOverlap('2026-07-16', '2026-07-20', ...bloqueio), false, 'depois');
    assert.equal(rangesOverlap('2026-07-08', '2026-07-11', ...bloqueio), true, 'encosta no início');
    assert.equal(rangesOverlap('2026-07-14', '2026-07-18', ...bloqueio), true, 'encosta no fim');
    assert.equal(rangesOverlap('2026-07-11', '2026-07-13', ...bloqueio), true, 'dentro');
    assert.equal(rangesOverlap('2026-07-01', '2026-07-31', ...bloqueio), true, 'engloba');
    assert.equal(rangesOverlap('2026-07-15', '2026-07-15', ...bloqueio), true, 'último dia');
  });

  it('formata para o padrão brasileiro', () => {
    assert.equal(formatDateBR('2026-10-12'), '12/10/2026');
    assert.equal(formatDateLong('2026-10-12'), '12 de outubro de 2026');
    assert.equal(formatDateBR('data-ruim'), '');
    assert.equal(pluralizeDays(1), '1 diária');
    assert.equal(pluralizeDays(3), '3 diárias');
  });
});

describe('cálculo de diárias', () => {
  it('mesmo dia conta como uma diária', () => {
    assert.equal(pricingRules.sameDayCountsAsOneDay, true);
    assert.equal(calculateDays('2026-05-10', '2026-05-10'), 1);
  });

  it('conta a diferença de dias', () => {
    assert.equal(calculateDays('2026-05-10', '2026-05-11'), 1);
    assert.equal(calculateDays('2026-05-10', '2026-05-17'), 7);
    assert.equal(calculateDays('2026-05-10', '2026-06-09'), 30);
  });

  it('devolve zero quando a devolução é anterior à retirada', () => {
    assert.equal(calculateDays('2026-05-10', '2026-05-09'), 0);
  });
});

describe('preço estimado', () => {
  it('cobra diárias avulsas em períodos curtos', () => {
    const orcamento = calculateQuote(carro, 3);
    assert.equal(orcamento.total, 300);
    assert.equal(orcamento.discount, 0);
    assert.equal(orcamento.lines.length, 1);
  });

  it('usa o pacote semanal a partir de 7 diárias', () => {
    const orcamento = calculateQuote(carro, 7);
    assert.equal(orcamento.total, 600);
    assert.equal(orcamento.discount, 100, 'economiza em relação a 7 diárias cheias');
    assert.equal(orcamento.fullDailyTotal, 700);
  });

  it('usa o pacote mensal a partir de 30 diárias', () => {
    const orcamento = calculateQuote(carro, 30);
    assert.equal(orcamento.total, 2000);
    assert.equal(orcamento.averageDailyPrice, 66.67);
  });

  it('combina mês + semana + diária no melhor encaixe', () => {
    // 38 diárias = 1 pacote mensal (30) + 1 semanal (7) + 1 avulsa
    const orcamento = calculateQuote(carro, 38);
    assert.equal(orcamento.total, 2000 + 600 + 100);
    assert.equal(orcamento.lines.length, 3);
    assert.equal(orcamento.lines[0].quantity, 1);
    assert.equal(orcamento.lines[2].quantity, 1);
  });

  it('devolve zero para período inválido', () => {
    const orcamento = calculateQuote(carro, 0);
    assert.equal(orcamento.total, 0);
    assert.equal(orcamento.lines.length, 0);
  });

  it('todo veículo da frota demo tem pacote mais barato que a soma das diárias', () => {
    for (const veiculo of demoVehicles) {
      assert.ok(
        veiculo.weeklyPrice < veiculo.dailyPrice * 7,
        `${veiculo.name}: pacote semanal não compensa`,
      );
      assert.ok(
        veiculo.monthlyPrice < veiculo.dailyPrice * 30,
        `${veiculo.name}: pacote mensal não compensa`,
      );
    }
  });
});

describe('disponibilidade', () => {
  it('marca como disponível fora do período bloqueado', () => {
    const r = checkAvailability(carro, '2026-07-01', '2026-07-05');
    assert.equal(r.available, true);
  });

  it('bloqueia quando o período encosta na locação existente', () => {
    const r = checkAvailability(carro, '2026-07-14', '2026-07-20');
    assert.equal(r.available, false);
    assert.equal(r.reason, 'periodo_ocupado');
    assert.equal(r.message, 'Indisponível para estas datas');
  });

  it('considera disponível quando não há datas escolhidas', () => {
    assert.equal(checkAvailability(carro).available, true);
  });

  it('respeita o status de manutenção', () => {
    const emManutencao = { ...carro, status: 'manutencao' as const };
    const r = checkAvailability(emManutencao, '2026-01-01', '2026-01-02');
    assert.equal(r.available, false);
    assert.equal(r.reason, 'manutencao');
  });
});

describe('validação de formulário', () => {
  it('recusa devolução anterior à retirada', () => {
    // `today()` usa o fuso de Recife — o mesmo do site, não o do servidor.
    const futuro = addDays(today(), 30);
    const erros = validateDateRange(futuro, addDays(futuro, -1));
    assert.ok(erros.returnDate);
  });

  it('recusa retirada no passado', () => {
    const ontem = addDays(today(), -1);
    const erros = validateDateRange(ontem, addDays(ontem, 3));
    assert.ok(erros.pickupDate);
  });

  it('aceita um período válido', () => {
    const erros = validateDateRange(addDays(today(), 5), addDays(today(), 9));
    assert.deepEqual(erros, {});
  });

  it('valida telefone brasileiro', () => {
    assert.equal(validatePhone('(81) 98888-7777'), undefined, 'celular válido');
    assert.equal(validatePhone('(81) 3333-4444'), undefined, 'fixo válido');
    assert.ok(validatePhone('98888-7777'), 'sem DDD deve falhar');
    assert.ok(validatePhone('(81) 88888-7777'), 'celular sem o 9 deve falhar');
    assert.ok(validatePhone(''), 'vazio deve falhar');
  });

  it('valida nome', () => {
    assert.equal(validateName('Ana Lima'), undefined);
    assert.ok(validateName(''));
    assert.ok(validateName('A'));
  });

  it('aplica máscara de telefone', () => {
    assert.equal(maskPhone('81988887777'), '(81) 98888-7777');
    assert.equal(maskPhone('8133334444'), '(81) 3333-4444');
    assert.equal(maskPhone('81'), '(81');
  });
});

describe('campanhas sazonais', () => {
  it('calcula feriados móveis', () => {
    assert.equal(carnavalTuesday(2026), '2026-02-17');
    assert.equal(carnavalTuesday(2027), '2027-02-09');
    assert.equal(mothersDay(2026), '2026-05-10', '2º domingo de maio');
    assert.equal(blackFriday(2026), '2026-11-27', 'última sexta de novembro');
  });

  it('resolve janelas que viram o ano', () => {
    const janela = resolveWindow({ kind: 'annual', start: '12-27', end: '01-04' }, 2026);
    assert.equal(janela.start, '2026-12-27');
    assert.equal(janela.end, '2027-01-04');
  });

  it('ativa a campanha certa para a data', () => {
    assert.equal(getActiveCampaign('2026-06-20').id, 'sao-joao');
    assert.equal(getActiveCampaign('2026-10-12').id, 'outubro');
    assert.equal(getActiveCampaign('2026-12-30').id, 'reveillon');
    assert.equal(getActiveCampaign('2027-01-02').id, 'reveillon', 'janela que virou o ano');
    assert.equal(getActiveCampaign('2026-02-14').id, 'carnaval');
  });

  it('cai na campanha institucional quando não há data comemorativa', () => {
    const campanha = getActiveCampaign('2026-03-18');
    assert.equal(campanha.isDefault, true);
    assert.equal(campanha.id, 'institucional');
  });
});

describe('mensagem do WhatsApp', () => {
  it('monta a solicitação com todos os dados', () => {
    const texto = bookingRequestMessage({
      vehicle: carro,
      customerName: 'Ana Lima',
      customerPhone: '(81) 98888-7777',
      pickupDate: '2026-07-01',
      returnDate: '2026-07-08',
      days: 7,
      estimatedTotal: 600,
    });

    for (const trecho of ['Carro de Teste', '01/07/2026', '08/07/2026', '7 diárias', 'Ana Lima']) {
      assert.ok(texto.includes(trecho), `faltou "${trecho}" na mensagem`);
    }
    assert.ok(/600/.test(texto), 'faltou o valor');
    assert.ok(
      texto.includes('confirmar a disponibilidade'),
      'a mensagem precisa pedir confirmação, não afirmar reserva',
    );
    assert.ok(!/reserva confirmada/i.test(texto));
  });

  it('gera um link wa.me com a mensagem codificada', () => {
    const url = buildWhatsAppUrl('Olá, tudo bem?');
    assert.ok(url.startsWith('https://wa.me/'));
    assert.ok(url.includes('?text=Ol%C3%A1'));
  });
});

describe('links que preservam o período', () => {
  const periodo = { pickupDate: '2026-07-01', returnDate: '2026-07-08' };

  it('leva as datas para a página do veículo', () => {
    assert.equal(
      vehicleUrl('jeep-renegade', periodo),
      '/frota/jeep-renegade?retirada=2026-07-01&devolucao=2026-07-08',
    );
  });

  it('volta para a frota mantendo as datas', () => {
    assert.equal(fleetUrl(periodo), '/frota?retirada=2026-07-01&devolucao=2026-07-08');
  });

  it('sem período, gera a URL limpa', () => {
    assert.equal(vehicleUrl('jeep-renegade'), '/frota/jeep-renegade');
    assert.equal(fleetUrl(), '/frota');
    assert.equal(fleetUrl({ pickupDate: '', returnDate: '' }), '/frota');
  });

  it('ignora datas inválidas', () => {
    assert.equal(vehicleUrl('x', { pickupDate: '2026-02-30', returnDate: '' }), '/frota/x');
  });
});

describe('filtros da frota na URL', () => {
  const semPeriodo = { pickupDate: '', returnDate: '' };

  it('sem filtros, não suja a URL', () => {
    assert.equal(fleetQuery(semPeriodo, DEFAULT_FLEET_FILTERS), '');
  });

  it('escreve só o que difere do padrão', () => {
    const query = fleetQuery(semPeriodo, { ...DEFAULT_FLEET_FILTERS, category: 'sedan' });
    assert.equal(query, 'categoria=sedan');
  });

  it('leva período e filtros juntos', () => {
    const query = fleetQuery(
      { pickupDate: '2026-07-01', returnDate: '2026-07-08' },
      { ...DEFAULT_FLEET_FILTERS, category: 'sedan', onlyAvailable: false },
    );
    assert.equal(query, 'retirada=2026-07-01&devolucao=2026-07-08&categoria=sedan&disponiveis=0');
  });

  it('lê de volta exatamente o que escreveu', () => {
    const original = {
      ...DEFAULT_FLEET_FILTERS,
      category: 'hatch' as const,
      transmission: 'automatico' as const,
      fuel: 'diesel' as const,
      onlyAvailable: false,
    };
    const lido = readFleetFilters(new URLSearchParams(fleetQuery(semPeriodo, original)));
    assert.deepEqual(lido, original);
  });

  it('cai no padrão quando a URL traz valor inventado', () => {
    const lido = readFleetFilters(
      new URLSearchParams('categoria=foguete&cambio=turbina&combustivel=querosene'),
    );
    assert.deepEqual(lido, DEFAULT_FLEET_FILTERS);
  });

  it('URL vazia devolve o padrão', () => {
    assert.deepEqual(readFleetFilters(new URLSearchParams('')), DEFAULT_FLEET_FILTERS);
  });
});

describe('frota demonstrativa', () => {
  it('não tem slug nem id repetido', () => {
    assert.equal(new Set(demoVehicles.map((v) => v.slug)).size, demoVehicles.length);
    assert.equal(new Set(demoVehicles.map((v) => v.id)).size, demoVehicles.length);
  });

  it('tem todos os campos obrigatórios preenchidos', () => {
    for (const v of demoVehicles) {
      assert.ok(v.name && v.model && v.description, `${v.slug}: texto faltando`);
      assert.ok(v.photos.length > 0, `${v.slug}: sem imagem`);
      assert.ok(
        v.photos.every((p) => p.alt.length > 0),
        `${v.slug}: imagem sem alt`,
      );
      assert.ok(v.seats > 0 && v.trunk > 0 && v.year > 2000, `${v.slug}: ficha técnica inválida`);
      assert.ok(v.dailyPrice > 0, `${v.slug}: sem preço`);
    }
  });
});
