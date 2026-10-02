'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import SiteFooter from '@/app/components/SiteFooter';
import AIProductArchitect from '@/app/components/AIProductArchitect';
import IntegrationLayer from '@/app/components/IntegrationLayer';
import { useTheme } from '@/app/components/ThemeProvider';

const services = [
  { number: '01', title: 'Product engineering', text: 'Production-ready web and mobile products, designed around the workflows that matter.' },
  { number: '02', title: 'Cloud & infrastructure', text: 'Secure APIs, data layers, deployment pipelines and infrastructure that can grow with demand.' },
  { number: '03', title: 'AI systems', text: 'Practical AI integration, evaluation, automation and data pipelines without the hype layer.' },
  { number: '04', title: 'Security & reliability', text: 'Threat-aware architecture, observability, testing and operational hardening from day one.' },
];

const projects = [
  { type: 'FINTECH', title: 'Platform modernization', metric: '10×', label: 'throughput', tags: ['Kubernetes', 'Go', 'Kafka'] },
  { type: 'HEALTHTECH', title: 'Clinical decision support', metric: '94%', label: 'adoption', tags: ['Python', 'Vertex AI', 'FHIR'] },
  { type: 'EDTECH', title: 'Real-time collaboration', metric: '50k+', label: 'concurrent rooms', tags: ['Rust', 'WebRTC', 'Cloudflare'] },
];

const principles = [
  ['Senior by default', 'Small teams, direct communication and people who own outcomes.'],
  ['Built for production', 'Architecture, security, observability and handover are part of the work.'],
  ['Clarity over theatre', 'Clear scope, visible trade-offs and straightforward technical decisions.'],
];

export default function PremiumLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { colors, isAuto, nextChangeLabel } = useTheme();

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="origins-landing premium-landing" id="home">
      <div className="landing-noise" aria-hidden="true" />
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <div className="ambient ambient-three" aria-hidden="true" />

      <header className="landing-header">
        <div className="landing-header-inner">
          <Link href="#home" className="brand-mark" onClick={closeMenu} aria-label="Origins home">
            <span className="brand-logo-shell">
              <img src="/origins-logo.png" alt="Origins" className="landing-logo" />
            </span>
            <span className="brand-word">ORIGINS SOFTWARE</span>
          </Link>

          <button
            type="button"
            className="mobile-menu-button"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
          </button>

          <nav id="site-nav" className={`site-nav ${menuOpen ? 'is-open' : ''}`}>
            <Link href="/work" onClick={closeMenu}>Work</Link>
            <Link href="/services" onClick={closeMenu}>Services</Link>
            <Link href="/process" onClick={closeMenu}>Process</Link>
            <Link href="#ai-architect" onClick={closeMenu}>AI Studio</Link>
            <Link href="#integrations" onClick={closeMenu}>Integrations</Link>
            <Link href="/about" onClick={closeMenu}>About</Link>
            <a
              href={process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL || 'https://portal.origins-software.com'}
              className="nav-portal"
              onClick={closeMenu}
            >
              Client portal <span aria-hidden="true">↗</span>
            </a>
            <Link href="#contact" className="nav-cta" onClick={closeMenu}>
              Start a project
              <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-grid-bg" aria-hidden="true" />
        <div className="hero-content shell">
          <div className="hero-copy" data-reveal>
            <div className="eyebrow hero-eyebrow">
              <span className="status-dot" />
              Senior-led engineering studio
              <span className="time-atmosphere-pill"><i /> {isAuto ? `Live ${colors.label} atmosphere` : `${colors.label} mode`}</span>
            </div>

            <h1>
              Build what <em>matters.</em>
              <br />
              Ship with confidence.
            </h1>

            <p className="hero-lede">
              Origins turns complex product ideas into dependable software,
              infrastructure and AI systems — from first architecture to production.
            </p>

            <div className="hero-actions">
              <Link href="/contact" className="button button-primary">
                <span>Start a project</span>
                <span className="button-arrow" aria-hidden="true">↗</span>
              </Link>
              <Link href="/work" className="button button-ghost">
                <span>Explore our work</span>
                <span className="button-arrow" aria-hidden="true">↓</span>
              </Link>
            </div>

            <div className="hero-atmosphere-note">
              <span className="atmosphere-swatch" style={{ background: colors.accent }} />
              <span>{isAuto ? nextChangeLabel : 'Manual atmosphere'}</span>
              <b>{isAuto ? 'AUTO' : 'MANUAL'}</b>
            </div>

            <div className="hero-trust">
              <span>Senior-led delivery</span>
              <span className="trust-separator" />
              <span>Production-minded engineering</span>
              <span className="trust-separator" />
              <span>Direct communication</span>
            </div>
          </div>

          <div className="hero-product-wrap" data-reveal>
            <div className="hero-product-glow" aria-hidden="true" />

            <div className="product-window">
              <div className="window-bar">
                <div className="window-dots"><i /><i /><i /></div>
                <div className="window-url">
                  <span className="window-lock">●</span>
                  origins / project command
                </div>
                <span className="window-state"><i /> LIVE</span>
              </div>

              <div className="window-body">
                <aside className="window-sidebar">
                  <div className="sidebar-brand">
                    <img src="/images/origins-logo.png" alt="" />
                  </div>

                  <span className="sidebar-line active" />
                  <span className="sidebar-line" />
                  <span className="sidebar-line" />
                  <span className="sidebar-line" />
                  <span className="sidebar-spacer" />
                  <span className="sidebar-line small" />
                </aside>

                <div className="window-main">
                  <div className="mock-header">
                    <div>
                      <span className="mock-kicker">PROJECT HEALTH</span>
                      <h3>Launch sequence</h3>
                    </div>
                    <span className="mock-pill"><i /> On track</span>
                  </div>

                  <div className="mock-metrics">
                    <div>
                      <span>Delivery</span>
                      <strong>86%</strong>
                      <small>+12.4%</small>
                    </div>
                    <div>
                      <span>Quality</span>
                      <strong>98.6%</strong>
                      <small>+4.2%</small>
                    </div>
                    <div>
                      <span>Risk</span>
                      <strong>Low</strong>
                      <small>Stable</small>
                    </div>
                  </div>

                  <div className="mock-chart" aria-hidden="true">
                    <div className="chart-header">
                      <span>Delivery velocity</span>
                      <span>Last 30 days</span>
                    </div>
                    <div className="chart-grid" />
                    <svg viewBox="0 0 500 180" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="healthLine" x1="0" x2="1">
                          <stop offset="0" stopColor="currentColor" stopOpacity=".18" />
                          <stop offset=".45" stopColor="currentColor" stopOpacity=".9" />
                          <stop offset="1" stopColor="currentColor" stopOpacity=".35" />
                        </linearGradient>
                        <linearGradient id="healthFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0" stopColor="currentColor" stopOpacity=".15" />
                          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 138 C55 120 75 124 115 124 C145 124 160 92 168 92 C205 92 210 102 225 102 C250 102 265 70 278 70 C305 70 320 82 340 82 C365 82 380 45 398 45 C420 45 438 58 455 58 C475 58 490 25 500 22 L500 180 L0 180 Z"
                        fill="url(#healthFill)"
                      />
                      <path
                        d="M0 138 C55 120 75 124 115 124 C145 124 160 92 168 92 C205 92 210 102 225 102 C250 102 265 70 278 70 C305 70 320 82 340 82 C365 82 380 45 398 45 C420 45 438 58 455 58 C475 58 490 25 500 22"
                        fill="none"
                        stroke="url(#healthLine)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div className="mock-bottom-row">
                    <div className="mock-task">
                      <span className="task-check">✓</span>
                      <div>
                        <b>Architecture review</b>
                        <small>Completed today</small>
                      </div>
                    </div>
                    <div className="mock-team">
                      <span className="team-label">TEAM</span>
                      <div className="mock-avatar-stack">
                        <span>A</span><span>R</span><span>+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="floating-note note-one"><span>↗</span> faster decisions</div>
            <div className="floating-note note-two"><span>✓</span> production ready</div>
            <div className="floating-note note-three"><span>●</span> zero critical risk</div>
          </div>
        </div>
      </section>

      <section className="signal-strip shell" data-reveal>
        <div className="signal-label">What we do</div>
        <div className="signal-copy">
          Product engineering <span>·</span> Cloud infrastructure <span>·</span> AI systems <span>·</span> Security <span>·</span> Data
        </div>
      </section>

      <AIProductArchitect />

      <IntegrationLayer />

      <section className="section shell" id="capabilities">
        <div className="section-heading" data-reveal>
          <div>
            <div className="eyebrow">Capabilities</div>
            <h2>Technical depth,<br /><em>without the overhead.</em></h2>
          </div>
          <p>
            We work where product ambition meets technical complexity.
            One senior team, from architecture through launch.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <article
              className="service-card"
              key={service.number}
              data-reveal
              style={{ '--delay': `${index * 70}ms` } as CSSProperties}
            >
              <div className="service-topline">
                <div className="service-number">{service.number}</div>
                <div className="service-arrow" aria-hidden="true">↗</div>
              </div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
              <div className="card-shine" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="section work-section" id="work">
        <div className="shell">
          <div className="section-heading compact" data-reveal>
            <div>
              <div className="eyebrow">Selected work</div>
              <h2>Shipped systems.<br /><em>Measured outcomes.</em></h2>
            </div>
            <Link href="/work" className="text-link">View all work <span>↗</span></Link>
          </div>

          <div className="projects-stack">
            {projects.map((project, index) => (
              <article className={`project-card project-${index + 1}`} key={project.title} data-reveal>
                <div className="project-visual">
                  <div className="project-orbit orbit-a" />
                  <div className="project-orbit orbit-b" />
                  <div className="project-window-mini">
                    <div className="mini-top">
                      <span>{project.type}</span>
                      <i />
                    </div>
                    <div className="mini-lines"><span /><span /><span /><span /></div>
                    <div className="mini-bars"><b /><b /><b /><b /><b /></div>
                  </div>
                </div>
                <div className="project-info">
                  <span className="project-type">{project.type}</span>
                  <h3>{project.title}</h3>
                  <div className="project-result"><strong>{project.metric}</strong><span>{project.label}</span></div>
                  <div className="tag-row">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section method-section" id="method">
        <div className="shell method-grid">
          <div className="section-heading vertical" data-reveal>
            <div className="eyebrow">Our method</div>
            <h2>Move from<br /><em>uncertainty</em> to shipping.</h2>
            <p>
              Every engagement is structured to reduce risk early, make decisions
              visible and keep the path to production short.
            </p>
          </div>

          <div className="steps" data-reveal>
            {[
              ['01', 'Frame', 'Align on outcomes, constraints, scope and what success looks like.'],
              ['02', 'Architect', 'Choose the right system shape, stack and delivery plan before momentum gets expensive.'],
              ['03', 'Build', 'Ship in small, reviewable slices with testing, observability and feedback built in.'],
              ['04', 'Launch', 'Harden, document, hand over and keep improving after the first release.'],
            ].map(([number, title, text]) => (
              <div className="step" key={number}>
                <span className="step-number">{number}</span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section principles-section" id="about">
        <div className="shell">
          <div className="section-heading centered" data-reveal>
            <div className="eyebrow">Why Origins</div>
            <h2>Small team.<br /><em>Large technical range.</em></h2>
          </div>

          <div className="principles-grid">
            {principles.map(([title, text], index) => (
              <div
                className="principle"
                key={title}
                data-reveal
                style={{ '--delay': `${index * 80}ms` } as CSSProperties}
              >
                <span className="principle-mark">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section" id="contact">
        <div className="shell cta-card" data-reveal>
          <div className="cta-orb" aria-hidden="true" />
          <div className="eyebrow">Let's build</div>
          <h2>Have a difficult problem?<br /><em>Bring it to us.</em></h2>
          <p>
            Tell us what you're building, where it's stuck and what needs to be
            true for launch. We'll bring the technical plan.
          </p>
          <div className="hero-actions">
            <Link href="/contact" className="button button-primary">
              <span>Start a conversation</span>
              <span className="button-arrow" aria-hidden="true">↗</span>
            </Link>
            <Link href="/work" className="button button-ghost">
              <span>See the work</span>
              <span className="button-arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
