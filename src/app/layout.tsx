import type { Metadata, Viewport } from 'next';
import { Archivo, Inter } from 'next/font/google';
import { siteConfig } from '@/config/site';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloatingButton } from '@/components/layout/WhatsAppFloatingButton';
import { DemoNotice } from '@/components/layout/DemoNotice';
import { SkipLink } from '@/components/layout/SkipLink';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.seo.title,
    template: siteConfig.seo.titleTemplate,
  },
  description: siteConfig.seo.description,
  keywords: [...siteConfig.seo.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.legalName }],
  creator: siteConfig.legalName,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: siteConfig.seo.locale,
    url: siteConfig.url,
    siteName: `${siteConfig.name} — ${siteConfig.tagline}`,
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — aluguel de carros em ${siteConfig.city}-${siteConfig.state}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  category: 'Locação de veículos',
};

export const viewport: Viewport = {
  themeColor: '#0B0B0D',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Dados estruturados da empresa.
 * Só informamos o que a ROGAN de fato confirmou (nome, cidade, estado, área
 * de atuação). Telefone e endereço entram aqui quando forem definidos.
 */
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'AutoRental',
  name: siteConfig.legalName,
  alternateName: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.seo.description,
  image: `${siteConfig.url}/og.png`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: siteConfig.city,
    addressRegion: siteConfig.state,
    addressCountry: 'BR',
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: `${siteConfig.city} e região, ${siteConfig.stateName}, Brasil`,
  },
  sameAs: siteConfig.instagram.url ? [siteConfig.instagram.url] : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <SkipLink />
        <DemoNotice />
        <Header />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppFloatingButton />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}
