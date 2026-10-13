import Image from 'next/image';
import Link from 'next/link';

const columns = [
  { title: 'Explore', links: [['Services', '/services'], ['Engineering standards', '/features'], ['Selected work', '/work'], ['Our process', '/process'], ['About Origins', '/about'], ['Company information', '/company']] },
  { title: 'Contact', links: [['Start a project', '/contact'], ['Client portal', process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL || 'https://portal.origins-software.com'], ['support@origins-software.com', 'mailto:support@origins-software.com']] },
  { title: 'Policies', links: [['Privacy', '/legal/privacy'], ['Terms of service', '/legal/terms'], ['Service terms', '/legal/service-terms'], ['Cookie policy', '/legal/cookies'], ['Privacy & settings', '/settings'], ['Security', '/legal/security'], ['Accessibility', '/legal/accessibility'], ['Acceptable use', '/legal/acceptable-use']] },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand-column">
          <Link href="/" className="footer-brand brand-lockup" aria-label="Origins Software home">
            <Image src="/origins-icon.png" alt="" width={84} height={84} className="brand-icon" />
            <span className="brand-lockup-type"><span className="brand-origins">ORIGINS</span><span className="brand-software">SOFTWARE</span></span>
          </Link>
          <p className="footer-lead">Independent software engineering for complex products, platforms and operations.</p>
          <Link className="footer-contact-link" href="/contact">Start a conversation <span>↗</span></Link>
        </div>
        {columns.map((column) => (
          <div key={column.title} className="footer-column">
            <div className="footer-heading">{column.title}</div>
            <div className="footer-links">
              {column.links.map(([label, href]) => href.startsWith('mailto:') || href.startsWith('http')
                ? <a key={href} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>{label}</a>
                : <Link key={href} href={href}>{label}</Link>)}
            </div>
          </div>
        ))}
      </div>

      <div className="footer-company-bar">
        <span>Origins Software</span>
        <span>Clear thinking. Careful engineering.</span>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Origins Software. All rights reserved.</span>
        <Link href="#top">Back to top ↑</Link>
      </div>
    </footer>
  );
}
