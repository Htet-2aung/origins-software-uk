import type { Metadata } from 'next';
import PremiumLanding from '@/app/components/PremiumLanding';

export const metadata: Metadata = {
  title: { absolute: 'Origins Software | Software built to hold up' },
  description: 'Dependable digital products, software platforms, cloud infrastructure and AI-enabled workflows for ambitious teams.',
  alternates: { canonical: '/' },
};

export default function Home() {
  return <PremiumLanding />;
}
