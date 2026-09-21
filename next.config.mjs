/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    /**
     * As fotos da frota são WebP local, gerado por `npm run otimizar-fotos`.
     *
     * `dangerouslyAllowSVG` saiu daqui: ligá-lo faz o otimizador processar e
     * servir SVG, que é um formato capaz de carregar script. Nenhuma tela usa
     * mais SVG de veículo — as ilustrações provisórias em `public/frota/*.svg`
     * ficaram órfãs e podem ser apagadas.
     *
     * ATENÇÃO: no Cloudflare o otimizador do `next/image` só funciona com o
     * binding de Cloudflare Images (ver `imagesOptimizer()` no README do
     * @vinext/cloudflare, hoje NÃO configurado em vite.config.ts). Enquanto
     * ele não entrar, `formats` não tem efeito em produção e o arquivo que
     * está em `public/` é exatamente o que o visitante baixa. É por isso que
     * o script de otimização existe.
     */
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
};

export default nextConfig;
