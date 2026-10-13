import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/app/components/PageShell';
import PageHero from '@/app/components/PageHero';
import { workPatterns } from '@/app/data/siteContent';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Explore representative software, AI and platform solution patterns from Origins Software. Examples illustrate our approach and are not presented as named client case studies.',
  openGraph: { title: 'Work | Origins Software', description: 'Representative software, AI and platform solution patterns—not claims of named client projects.' },
  alternates: { canonical: '/work' },
};

export default function WorkPage() {
  return <PageShell>
    <PageHero eyebrow="Work / solution patterns" title="Systems designed around the work people actually need to do." description="Explore the engineering questions behind common product, platform and automation challenges. These are representative solution patterns, not named client case studies or claims of delivered client outcomes." cta="Discuss your project" />
    <section className="content-section work-grid" aria-label="Representative solution patterns">
      {workPatterns.map((item) => <article className="work-card work-card-link" key={item.slug} data-motion>
        <Link href={`/work/${item.slug}`} className="work-art" aria-label={`Explore ${item.title}`}><span>{item.number}</span><div className="work-orbit" aria-hidden="true" /><div className="work-art-label">SYSTEM PATTERN</div></Link>
        <div className="work-copy"><div className="section-kicker">{item.sector}</div><h2><Link href={`/work/${item.slug}`}>{item.title}</Link></h2><p>{item.description}</p><div className="work-meta">{item.disciplines.join(' · ')}</div><Link className="text-link work-detail-link" href={`/work/${item.slug}`}>Explore solution pattern <span aria-hidden="true">↗</span></Link></div>
      </article>)}
    </section>
    <section className="content-section case-cta"><div><div className="section-kicker">Your context is unique</div><h2>Bring the problem. We’ll work through the constraints with you.</h2></div><Link className="button-primary" href="/contact">Request a conversation <span aria-hidden="true">↗</span></Link></section>
  </PageShell>;
}
