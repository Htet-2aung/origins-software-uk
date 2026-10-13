import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageShell from '@/app/components/PageShell';
import PageHero from '@/app/components/PageHero';
import { workPatterns } from '@/app/data/siteContent';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return workPatterns.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = workPatterns.find((pattern) => pattern.slug === slug);
  if (!item) return { title: 'Work pattern not found' };
  return { title: item.title, description: item.description, alternates: { canonical: `/work/${item.slug}` }, openGraph: { title: item.title, description: item.description } };
}

export default async function WorkPatternPage({ params }: Props) {
  const { slug } = await params;
  const item = workPatterns.find((pattern) => pattern.slug === slug);
  if (!item) notFound();

  return <PageShell>
    <PageHero eyebrow={`${item.number} / ${item.sector} / Solution pattern`} title={item.title} description={item.description} cta="Apply this thinking to your project" />
    <div className="pattern-note"><div className="pattern-note-mark" aria-hidden="true">i</div><p><strong>About this example.</strong> This page describes a representative solution pattern to explain our approach. It is not a claim about a named client, a completed engagement or measured business outcomes.</p></div>
    <section className="content-section detail-layout">
      <div className="detail-statement" data-motion><div className="section-kicker">Questions worth resolving early</div><h2>Good architecture begins with the constraints.</h2><p>The implementation should follow the environment, risk profile and operational reality. These questions help make the trade-offs visible before they become expensive to change.</p></div>
      <div className="detail-list">{item.questions.map((question, index) => <article className="detail-list-row" key={question} data-motion><span>{String(index + 1).padStart(2, '0')}</span><h3>{question}</h3><span className="detail-list-mark" aria-hidden="true">↗</span></article>)}</div>
    </section>
    <section className="detail-principles-band"><div className="content-section detail-principles-inner"><div><div className="section-kicker">Relevant disciplines</div><h2>Systems thinking, not isolated components.</h2></div><ul>{item.disciplines.map((discipline) => <li key={discipline}>{discipline}</li>)}</ul></div></section>
    <section className="content-section case-cta"><div><div className="section-kicker">Your next step</div><h2>Translate the pattern into your operating context.</h2></div><Link className="button-primary" href="/contact">Talk to the team <span aria-hidden="true">↗</span></Link></section>
  </PageShell>;
}
