import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageShell from '@/app/components/PageShell';
import PageHero from '@/app/components/PageHero';
import { serviceSpecialties } from '@/app/data/siteContent';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return serviceSpecialties.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceSpecialties.find((item) => item.slug === slug);
  if (!service) return { title: 'Service not found' };
  return {
    title: service.title,
    description: service.description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: service.title, description: service.description, type: 'website' },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = serviceSpecialties.find((item) => item.slug === slug);
  if (!service) notFound();

  const related = serviceSpecialties.filter((item) => item.slug !== service.slug).slice(0, 3);

  return <PageShell>
    <PageHero eyebrow={`${service.number} / ${service.category}`} title={service.title} description={service.description} cta="Discuss this speciality" />
    <section className="content-section detail-layout">
      <div className="detail-statement" data-motion><div className="section-kicker">What the work can include</div><h2>Make the technical work fit the business context.</h2><p>Every engagement starts from the operating constraints, the people involved and what the system needs to make possible. Scope and implementation choices are agreed against those realities—not against a generic checklist.</p></div>
      <div className="detail-list" aria-label={`${service.title} capabilities`}>
        {service.capabilities.map((capability, index) => <article className="detail-list-row" key={capability} data-motion><span>{String(index + 1).padStart(2, '0')}</span><h3>{capability}</h3><span className="detail-list-mark" aria-hidden="true">↗</span></article>)}
      </div>
    </section>
    <section className="detail-principles-band">
      <div className="content-section detail-principles-inner">
        <div><div className="section-kicker">Engineering considerations</div><h2>Designed for the conditions beyond launch.</h2></div>
        <ul>{service.considerations.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </section>
    <section className="content-section detail-related">
      <div className="section-heading-row"><div><div className="section-kicker">Related specialities</div><h2>Connected disciplines, when the work calls for them.</h2></div><Link className="text-link" href="/services">All services <span aria-hidden="true">↗</span></Link></div>
      <div className="related-service-list">{related.map((item) => <Link key={item.slug} href={`/services/${item.slug}`}><span>{item.number}</span><strong>{item.title}</strong><span aria-hidden="true">↗</span></Link>)}</div>
    </section>
    <section className="content-section case-cta"><div><div className="section-kicker">Have a specific challenge?</div><h2>Let’s scope the work before we prescribe the solution.</h2></div><Link className="button-primary" href="/contact">Start a conversation <span aria-hidden="true">↗</span></Link></section>
  </PageShell>;
}
