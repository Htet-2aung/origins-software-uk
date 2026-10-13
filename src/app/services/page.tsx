import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/app/components/PageShell';
import PageHero from '@/app/components/PageHero';
import { serviceSpecialties } from '@/app/data/siteContent';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore Origins Software specialities across digital marketing, infrastructure, applied AI, full-stack engineering, cloud, cybersecurity and computer vision.',
  openGraph: { title: 'Services | Origins Software', description: 'Explore our nine service specialities across growth, software, cloud, AI and security.' },
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return <PageShell>
    <PageHero eyebrow="Specialities / 09 disciplines" title="The expertise to take complex work from idea to operation." description="Bring us the product, infrastructure, data or workflow problem in front of you. We’ll help define the right shape of the work before deciding how to build it." />
    <section className="content-section services-list" aria-label="Our service specialities">
      {serviceSpecialties.map((service) => (
        <Link className="service-row service-row-link" href={`/services/${service.slug}`} key={service.slug} data-motion>
          <div className="service-no">{service.number}</div>
          <div className="service-main"><div className="service-category">{service.category}</div><h2>{service.title}</h2><p>{service.description}</p><span>{service.tags}</span></div>
          <div className="service-arrow" aria-hidden="true">↗</div>
        </Link>
      ))}
    </section>
    <section className="content-section two-col">
      <div><div className="section-kicker">How we engage</div><h2>Defined scope. Visible decisions. Responsible delivery.</h2></div>
      <div className="prose"><p>Some engagements need one specialist discipline. Others need product, engineering and operations to work together. We shape the team and delivery model around the problem, with assumptions, responsibilities and trade-offs made explicit.</p><Link className="button-secondary" href="/contact">Discuss your requirements <span aria-hidden="true">↗</span></Link></div>
    </section>
  </PageShell>;
}
