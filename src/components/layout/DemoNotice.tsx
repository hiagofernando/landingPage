import { siteConfig } from '@/config/site';
import { Alert } from '@/components/ui/Icons';

/**
 * Faixa de aviso exibida enquanto a frota e os valores forem demonstrativos.
 * Desligue definindo NEXT_PUBLIC_DEMO_MODE=false no ambiente de produção.
 */
export function DemoNotice() {
  if (!siteConfig.demoMode) return null;

  return (
    <aside aria-label="Aviso sobre esta versão" className="bg-ink text-paper">
      <p className="container-page flex items-center justify-center gap-2 py-2 text-center text-[0.6875rem] leading-snug font-medium sm:text-xs">
        <Alert className="size-3.5 shrink-0 text-accent" />
        <span className="sm:hidden">Versão de demonstração: frota e valores são exemplos.</span>
        <span className="hidden sm:inline">
          Versão de demonstração: veículos, valores e dados de contato são exemplos e ainda serão
          substituídos pelas informações reais da {siteConfig.name}.
        </span>
      </p>
    </aside>
  );
}
