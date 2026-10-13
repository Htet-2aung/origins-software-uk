import type { MetadataRoute } from 'next';
import { processStages, serviceSpecialties, workPatterns } from '@/app/data/siteContent';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://origins-software.com';
  const staticPaths = ['', '/about', '/features', '/services', '/work', '/process', '/company', '/contact', '/legal/privacy', '/legal/terms', '/legal/service-terms', '/legal/cookies', '/legal/security', '/legal/accessibility', '/legal/acceptable-use'];
  const dynamicPaths = [
    ...serviceSpecialties.map((item) => `/services/${item.slug}`),
    ...workPatterns.map((item) => `/work/${item.slug}`),
    ...processStages.map((item) => `/process/${item.slug}`),
  ];
  return [...staticPaths, ...dynamicPaths].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : path.split('/').length > 2 ? 0.55 : 0.7,
  }));
}
