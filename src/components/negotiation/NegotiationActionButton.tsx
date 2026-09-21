'use client';

import { useState } from 'react';
import type { NegotiationAction } from '@/lib/negotiation-tokens';
import { Button } from '@/components/ui/Button';
import { Alert, Check } from '@/components/ui/Icons';

interface NegotiationActionButtonProps {
  /** Referência do pedido (`ref` é nome reservado de prop no React). */
  negotiationRef: string;
  action: NegotiationAction;
  token: string;
  /** Já está no estado pedido (ex.: fechar algo já locado). */
  alreadyDone?: boolean;
}

type State = 'idle' | 'sending' | 'done' | 'error';

const LABELS: Record<NegotiationAction, { button: string; done: string }> = {
  fechar: {
    button: 'Confirmar: locação fechada',
    done: 'Locação fechada. O período já aparece como indisponível no site.',
  },
  liberar: {
    button: 'Confirmar: liberar o carro',
    done: 'Carro liberado. O período voltou a ficar livre no site.',
  },
};

/** Botão que de fato muda a negociação. O link da ficha só abre a página. */
export function NegotiationActionButton({
  negotiationRef,
  action,
  token,
  alreadyDone,
}: NegotiationActionButtonProps) {
  const [state, setState] = useState<State>(alreadyDone ? 'done' : 'idle');
  const [error, setError] = useState('');

  const submit = async () => {
    setState('sending');
    try {
      const response = await fetch(`/api/negociacoes/${negotiationRef}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: action, t: token }),
      });
      if (response.ok) {
        setState('done');
        return;
      }
      const body = (await response.json().catch(() => ({}))) as { erro?: string };
      setError(body.erro ?? 'Não deu certo. Tente de novo em instantes.');
      setState('error');
    } catch {
      setError('Sem conexão. Confira a internet e tente de novo.');
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <p
        role="status"
        className="flex items-start gap-2.5 rounded-xl bg-success/10 p-4 font-medium text-success"
      >
        <Check className="mt-0.5 size-4 shrink-0" />
        {alreadyDone ? 'Esta locação já estava fechada.' : LABELS[action].done}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={submit}
        disabled={state === 'sending'}
        variant={action === 'fechar' ? 'primary' : 'dark'}
        size="lg"
        fullWidth
      >
        {state === 'sending' ? 'Salvando…' : LABELS[action].button}
      </Button>
      {state === 'error' && (
        <p role="alert" className="flex items-start gap-2 text-sm text-danger">
          <Alert className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
