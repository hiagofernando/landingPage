import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // `/negociacao` é a página da equipe (links da ficha) e `/api` não é
    // página. A de negociação também tem `noindex`; isto evita até o rastreio.
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/negociacao/'] },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
