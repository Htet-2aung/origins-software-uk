import type { Metadata } from 'next';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import CookieConsent from '@/app/components/CookieConsent';
import AssistantFloating from '@/app/components/AssistantFloating';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Origins Software | Software built to hold up', template: '%s | Origins Software' },
  description: 'Origins Software partners with ambitious teams on dependable digital products, software platforms, cloud infrastructure and AI-enabled workflows.',
  applicationName: 'Origins Software',
  category: 'technology',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://origins-software.com'),
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Origins Software',
    title: 'Origins Software | Software built to hold up',
    description: 'Dependable digital products, software platforms, cloud infrastructure and AI-enabled workflows.',
  },
  twitter: { card: 'summary', title: 'Origins Software | Software built to hold up', description: 'Dependable digital products, software platforms, cloud infrastructure and AI-enabled workflows.' },
  robots: { index: true, follow: true },
  icons: {
    icon: '/origins-icon.png',
    apple: '/origins-icon.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Remote stylesheet loading avoids Next.js' next/font/google import-map failure. Local/system fallbacks remain available if Google Fonts cannot be reached. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700&family=Saira+Stencil+One&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>{children}<CookieConsent /><AssistantFloating /></ThemeProvider>
      </body>
    </html>
  );
}
