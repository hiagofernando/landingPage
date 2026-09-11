/** Atalho para quem navega por teclado pular direto ao conteúdo. */
export function SkipLink() {
  return (
    <a
      href="#conteudo"
      className="sr-only-focusable focus:top-3 focus:left-3 focus:z-200 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-paper"
    >
      Pular para o conteúdo
    </a>
  );
}
