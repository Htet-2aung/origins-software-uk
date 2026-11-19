import type { Metadata } from 'next';
import PremiumLanding from '@/app/components/PremiumLanding';
import { localizeMetadata } from './metadata';

export async function generateMetadata(): Promise<Metadata> {
  const localized = await localizeMetadata(
    'Origins Software Studio | Software for the work that matters',
    'Origins Software Studio designs, builds and operates dependable digital products, business platforms and cloud systems for ambitious teams.',
  );
  return { ...localized, title: { absolute: localized.title } };
}

export default function Home() {
  return <PremiumLanding />;
}
