/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    /**
     * As imagens da frota são ilustrações SVG locais e provisórias.
     * Ao trocar por fotos reais (JPG/WebP em /public/frota ou em um CDN),
     * estas três linhas podem ser removidas e os domínios do CDN entram em
     * `remotePatterns`.
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },
};

export default nextConfig;
