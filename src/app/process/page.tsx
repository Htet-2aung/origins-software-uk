import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/app/components/PageShell';
import PageHero from '@/app/components/PageHero';
import { processStages } from '@/app/data/siteContent';

export const metadata: Metadata = {
  title: 'Process',
  description: 'A considered software delivery process from discovery and architecture through engineering, release and operation.',
  openGraph: { title: 'Process | Origins Software', description: 'A considered delivery path from discovery through engineering and operation.' },
  alternates: { canonical: '/process' },
};

export default function ProcessPage() {
  return <PageShell>
    <PageHero eyebrow="Methodology / 04 stages" title="A calm delivery process with fewer surprises." description="The process is intentionally simple: understand the problem, agree on the shape of the work, build in small increments, then leave the system in a maintainable state." />
    <section className="content-section process-list" aria-label="Delivery stages">
      {processStages.map((stage) => <Link key={stage.slug} href={`/process/${stage.slug}`} className="process-row process-row-link" data-motion><div className="process-no">{stage.number}</div><div><div className="process-subtitle">{stage.subtitle}</div><h2>{stage.title}</h2><p>{stage.description}</p><span className="process-detail-link">Explore this stage <span aria-hidden="true">↗</span></span></div><div className="process-line" aria-hidden="true" /></Link>)}
    </section>
    <section className="content-section two-col"><div><div className="section-kicker">What clients see</div><h2>Visibility without project theatre.</h2></div><div className="prose"><p>Expect clear status, decision logs, scope changes, delivery notes and practical next steps. When assumptions change, they are surfaced early enough to act on.</p><Link className="text-link" href="/contact">Start with a discovery conversation <span>→</span></Link></div></section>
  </PageShell>;
}
