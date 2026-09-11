import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { getVehicleSlugs } from '@/data/repository';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getVehicleSlugs();
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteConfig.url}/frota`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    {
      url: `${siteConfig.url}/como-funciona`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    { url: `${siteConfig.url}/faq`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteConfig.url}/contato`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const vehicleRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${siteConfig.url}/frota/${slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...vehicleRoutes];
}
