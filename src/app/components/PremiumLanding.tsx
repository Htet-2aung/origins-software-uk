'use client';

import Link from 'next/link';
import { useEffect, useState, useRef, MouseEvent } from 'react';
import SiteFooter from '@/app/components/SiteFooter';
import SiteHeader from '@/app/components/SiteHeader';

const capabilities = [
  { number: '01', title: 'Product engineering', text: 'Digital products built around real users, sound architecture and the work that needs to get done.', scope: 'PRODUCT · WEB · MOBILE' },
  { number: '02', title: 'Software architecture', text: 'Clear system boundaries, dependable APIs and integrations that make complexity easier to manage.', scope: 'PLATFORMS · APIS · INTEGRATION' },
  { number: '03', title: 'Cloud & operations', text: 'Practical infrastructure, delivery pipelines and observability designed for day-to-day reliability.', scope: 'CLOUD · DEVOPS · RELIABILITY' },
  { number: '04', title: 'AI & automation', text: 'Useful AI capabilities and automated workflows, shaped around real constraints rather than hype.', scope: 'AI SYSTEMS · DATA · AUTOMATION' },
  { number: '05', title: 'Security engineering', text: 'Threat-aware design, safer defaults and engineering practices that make risk visible early.', scope: 'APPLICATION SECURITY · REVIEW' },
  { number: '06', title: 'Modernisation', text: 'Incremental improvement for legacy systems, performance bottlenecks and accumulated technical debt.', scope: 'MIGRATION · REFACTORING · PERFORMANCE' },
];

const projectTypes = [
  { number: '01', sector: 'COMPUTER VISION', title: 'Turning visual data into dependable decisions', text: 'Detection and classification pipelines designed for variable environments, practical evaluation and real operating conditions.', disciplines: 'Applied machine learning / Data pipelines / Deployment' },
  { number: '02', sector: 'CONNECTED WORKFLOWS', title: 'Bringing fragmented operations into one workspace', text: 'Product experiences that connect communication, tasks, projects and the operational information teams rely on.', disciplines: 'Product engineering / Realtime systems / Integrations' },
  { number: '03', sector: 'AI & AUTOMATION', title: 'Making automated systems useful and governable', text: 'Agent-assisted workflows with explicit permissions, useful observability and human escalation when judgement matters.', disciplines: 'AI systems / Workflow orchestration / Access controls' },
];

const principles = [
  ['Accountable ownership', 'The people shaping the solution stay close to delivery, decisions and handover.'],
  ['Production before theatre', 'Testing, security, observability and maintainability belong in the work from the beginning.'],
  ['Commercial clarity', 'Scope, assumptions, milestones and trade-offs are made visible before they become surprises.'],
  ['Respect for what exists', 'We work with your business context, current systems and team—not against them.'],
];

const deliverySteps = [
  ['01', 'Understand', 'Clarify the problem, outcomes, constraints, users and existing systems.'],
  ['02', 'Design the approach', 'Agree scope, architecture, milestones, responsibilities and success measures.'],
  ['03', 'Build in increments', 'Deliver reviewable changes, test assumptions and keep decisions visible.'],
  ['04', 'Launch & hand over', 'Harden, document, release and leave your team with a system it can operate.'],
];

// --- CHART CONFIGURATION ---
const MAX_DATA_POINTS = 30;
const CHART_WIDTH = 1000;
const CHART_HEIGHT = 300; // Tighter height
const POLLING_INTERVAL = 2500;

type SystemData = { latency: number; status: string; timestamp: Date };

export default function PremiumLanding() {
  const [history, setHistory] = useState<SystemData[]>(() => {
    let currentLat = 40;
    return Array.from({ length: MAX_DATA_POINTS }).map((_, i) => {
      currentLat += (Math.random() - 0.5) * 18;
      if (currentLat < 5) currentLat = 5;
      return {
        latency: currentLat,
        status: 'NOMINAL',
        timestamp: new Date(Date.now() - (MAX_DATA_POINTS - i) * POLLING_INTERVAL)
      };
    });
  });

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    elements.forEach((element) => {
      element.classList.add('reveal-pending');
      const delay = element.getAttribute('data-delay') || '0';
      if (delay) element.style.transitionDelay = `${delay}ms`;
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.classList.remove('reveal-pending');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    elements.forEach((element) => observer.observe(element));

    const fetchStatus = async () => {
      let newData: SystemData;
      try {
        const res = await fetch('/api/status');
        if (!res.ok) throw new Error('API Offline');
        const data = await res.json();
        newData = { latency: data.latency, status: data.status, timestamp: new Date() };
      } catch {
        const lastLatency = history[history.length - 1]?.latency || 40;
        const trend = (Math.random() - 0.5) * 22;
        newData = { latency: Math.max(8, lastLatency + trend), status: 'NOMINAL', timestamp: new Date() };
      }

      setHistory(prev => {
        const newHistory = [...prev, newData];
        if (newHistory.length > MAX_DATA_POINTS) newHistory.shift();
        return newHistory;
      });
    };

    const interval = setInterval(fetchStatus, POLLING_INTERVAL);
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [history]);

  const currentData = history[history.length - 1];
  const isHealthy = currentData?.status === 'NOMINAL';
  const themeColor = isHealthy ? '#c8ff00' : '#ff4444';
  const glowColor = isHealthy ? 'rgba(200, 255, 0, 0.12)' : 'rgba(255, 68, 68, 0.12)';

  const rawMax = Math.max(...history.map(d => d.latency));
  const rawMin = Math.min(...history.map(d => d.latency));
  const diff = rawMax - rawMin || 10;
  
  const maxLat = rawMax + diff * 0.15;
  const minLat = Math.max(0, rawMin - diff * 0.15);
  const range = maxLat - minLat || 1;
  const padding = 15;

  const points = history.map((d, i) => {
    const x = (i / (MAX_DATA_POINTS - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - padding - ((d.latency - minLat) / range) * (CHART_HEIGHT - padding * 2);
    return { x, y };
  });

  // --- SMOOTH BEZIER CURVE GENERATOR ---
  const generateSmoothPath = (pts: {x: number, y: number}[]) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 >= pts.length ? i + 1 : i + 2];
      
      const tension = 0.2; // Adjust for smoother/tighter curves
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      
      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return path;
  };

  const smoothLinePath = generateSmoothPath(points);
  const smoothAreaPath = `${smoothLinePath} L ${CHART_WIDTH},${CHART_HEIGHT} L 0,${CHART_HEIGHT} Z`;
  const latestCoord = points[points.length - 1];

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const index = Math.min(MAX_DATA_POINTS - 1, Math.max(0, Math.round(xRatio * (MAX_DATA_POINTS - 1))));
    setHoverIndex(index);
  };

  return (
    <main className="origins-landing premium-override" id="main-content">
      <SiteHeader/>

      {/* --- HERO SECTION --- */}
      <section className="home-hero premium-hero" aria-labelledby="hero-title">
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-layout shell compact-hero">
          <div className="hero-copy">
            <div className="eyebrow hero-eyebrow" data-reveal><span className="status-dot pulse" /> INDEPENDENT SOFTWARE ENGINEERING</div>
            <h1 id="hero-title" className="massive-title" data-reveal data-delay="100">
              Complex problems.<br />
              Software built to <span className="lime-underline highlight-sweep">hold up.</span>
            </h1>
            <p className="hero-lede" data-reveal data-delay="200">
              Origins helps ambitious teams turn difficult ideas and tangled systems into dependable digital products, infrastructure and AI-enabled workflows.
            </p>
            <div className="hero-actions" data-reveal data-delay="300">
              <Link className="button button-primary premium-btn" href="/contact">
                Start a conversation <span className="button-arrow icon-smooth" aria-hidden="true">↗</span>
              </Link>
              <Link className="button button-ghost premium-btn-ghost" href="/services">
                Explore capabilities <span className="button-arrow icon-smooth" aria-hidden="true">↘</span>
              </Link>
            </div>
          </div>

          {/* --- PREMIUM SMOOTH CHART WIDGET --- */}
          <div className="hero-visual premium-chart-widget" data-reveal data-delay="300">
             <div className="arch-glow" style={{ background: glowColor }}></div>
             
             <div className="chart-header">
                <div>
                  <div className="chart-title mono-accent">EDGE LATENCY</div>
                  <div className="chart-subtitle">Global Routing Network</div>
                </div>
                <div className="chart-live-value" style={{ color: themeColor }}>
                  {currentData?.latency.toFixed(1)} <span className="ms-text">ms</span>
                </div>
             </div>

             <div className="chart-container" ref={chartRef} onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIndex(null)}>
                <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none" className="chart-svg">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={themeColor} stopOpacity="0.35" />
                      <stop offset="100%" stopColor={themeColor} stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="6" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  
                  {/* Subtle Radar/Grid Lines */}
                  <g className="chart-grid">
                    <line x1="0" y1={points[0]?.y || 0} x2="100%" y2={points[0]?.y || 0} opacity="0.5"/>
                    <line x1="0" y1={CHART_HEIGHT / 2} x2="100%" y2={CHART_HEIGHT / 2} opacity="0.2"/>
                  </g>

                  {/* Smooth Bezier Crypto Area & Line */}
                  <path d={smoothAreaPath} fill="url(#chartGradient)" className="chart-area-path" />
                  <path d={smoothLinePath} fill="none" stroke={themeColor} strokeWidth="3" filter="url(#glow)" className="chart-line-path" />

                  <circle cx={latestCoord?.x || 0} cy={latestCoord?.y || 0} r="5" fill="#fff" className="leading-dot" style={{ filter: `drop-shadow(0 0 10px ${themeColor})` }}/>

                  {hoverIndex !== null && history[hoverIndex] && (
                    <g className="crosshair">
                      <line x1={points[hoverIndex].x} y1="0" x2={points[hoverIndex].x} y2={CHART_HEIGHT} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                      <circle cx={points[hoverIndex].x} cy={points[hoverIndex].y} r="6" fill="#000" stroke={themeColor} strokeWidth="2.5" />
                    </g>
                  )}
                </svg>

                {/* TradingView Price Tag */}
                <div className="crypto-price-tag mono-accent" style={{ top: `${(latestCoord?.y / CHART_HEIGHT) * 100}%`, backgroundColor: themeColor }}>
                  <span className="pulse-dot"></span>{currentData?.latency.toFixed(1)}
                </div>

                {hoverIndex !== null && history[hoverIndex] && (
                  <div className="chart-tooltip mono-accent" style={{ left: `${(hoverIndex / (MAX_DATA_POINTS - 1)) * 100}%`, top: '10px' }}>
                    <div style={{ color: themeColor, fontSize: '1.2rem', fontWeight: 600 }}>
                      {history[hoverIndex].latency.toFixed(1)} <span style={{fontSize: '0.7rem'}}>ms</span>
                    </div>
                  </div>
                )}
             </div>
             
             <div className="widget-footer sleek-coord">
               <span>SYS.001</span>
               <span>STATUS: <span style={{ color: themeColor }}>{currentData?.status}</span></span>
             </div>
          </div>
        </div>
      </section>

      {/* --- PREMIUM PARTNERSHIP / ECOSYSTEM SECTION --- */}
      <section className="ecosystem-section" aria-label="Technology Partners" data-reveal>
        <div className="ecosystem-inner shell">
          <p className="mono-accent text-center ecosystem-title">INTEGRATED WITH MODERN PRIMITIVES</p>
          <div className="ecosystem-logos">
            {/* Vercel */}
            <div className="partner-logo">
              <svg width="24" height="24" viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor"/></svg>
              <span>Vercel</span>
            </div>
            {/* Supabase */}
            <div className="partner-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14h-9L12 6l4.5 10z" fill="#3ECF8E"/></svg>
              <span>Supabase</span>
            </div>
            {/* Gemini */}
            <div className="partner-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C12 8 20 12 24 12C20 12 12 16 12 24C12 16 4 12 0 12C4 12 12 8 12 0Z" fill="#8AB4F8"/></svg>
              <span>Gemini</span>
            </div>
            {/* Claude */}
            <div className="partner-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 4C11 2.895 11.895 2 13 2H17.5C18.88 2 20 3.12 20 4.5V9C20 10.105 19.105 11 18 11H13.5V14.5H20V19.5C20 20.88 18.88 22 17.5 22H6.5C5.12 22 4 20.88 4 19.5V4.5C4 3.12 5.12 2 6.5 2H11V4ZM6 19.5C6 19.776 6.224 20 6.5 20H17.5C17.776 20 18 19.776 18 19.5V16.5H11.5V9H18V4.5C18 4.224 17.776 4 17.5 4H13V6H6V19.5Z" fill="#D97757"/></svg>
              <span>Claude</span>
            </div>
            {/* Copilot */}
            <div className="partner-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="currentColor"/></svg>
              <span>Copilot</span>
            </div>
            {/* Microsoft */}
            <div className="partner-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/></svg>
              <span>Microsoft</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- CAPABILITIES --- */}
      <section className="section capabilities-section shell ultra-clean" id="capabilities">
        <div className="section-heading split-heading align-top" data-reveal>
          <div className="heading-left">
            <div className="eyebrow mono-accent">Capabilities</div>
            <h2 className="premium-h2">Deep technical work.<br /><em className="italic-accent">Clear ownership.</em></h2>
          </div>
          <p className="heading-right-text">Bring us the whole product, a complex technical layer or the system that needs to become dependable. We shape the team around the work—not the other way around.</p>
        </div>

        <div className="capability-list sleek-accordion">
          {capabilities.map((item, i) => (
            <article className="capability-row premium-row" key={item.number} data-reveal data-delay={i * 50}>
              <div className="row-left">
                <span className="capability-number mono-accent">{item.number}</span>
                <h3 className="row-title">{item.title}</h3>
              </div>
              <div className="capability-main">
                <p className="row-text">{item.text}</p>
              </div>
              <div className="row-right">
                <div className="capability-scope mono-tag">{item.scope}</div>
                <Link
                  className="row-link arrow-hover"
                  href="/services"
                  aria-label={`Learn about ${item.title}`}
                >
                  <span>↗</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* --- WORK SECTION --- */}
      <section className="work-section bento-section" id="work">
        <div className="shell">
          <div className="section-heading split-heading work-heading" data-reveal>
            <div>
              <div className="eyebrow mono-accent">The work</div>
              <h2 className="premium-h2">Problems first.<br /><em className="italic-accent">Technology second.</em></h2>
            </div>
            <div className="work-heading-aside">
              <p>Good engineering starts with the job the system needs to do. These are representative problem areas across product, platform and automation work.</p>
              <Link className="text-link premium-text-link" href="/work">Explore our approach <span className="icon-smooth">↗</span></Link>
            </div>
          </div>

          <div className="project-list bento-grid">
            {projectTypes.map((project, i) => (
              <article className="project-row bento-card" key={project.number} data-reveal data-delay={i * 100}>
                <div className="card-top">
                  <div className="project-number mono-accent">{project.number}</div>
                  <div className="eyebrow project-sector mono-tag">{project.sector}</div>
                </div>
                <div className="project-content">
                  <h3 className="card-title">{project.title}</h3>
                  <p className="card-text">{project.text}</p>
                </div>
                <div className="card-bottom">
                  <div className="project-disciplines">{project.disciplines}</div>
                  <div className="project-symbol bento-arrow" aria-hidden="true">↗</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --- METHOD --- */}
      <section className="method-section timeline-section" id="approach">
        <div className="shell method-layout method-split">
          <div className="method-intro sticky-side" data-reveal>
            <div className="eyebrow mono-accent">A considered process</div>
            <h2 className="premium-h2">Less uncertainty.<br /><em className="italic-accent">Better decisions.</em></h2>
            <p>Clear stages create room for good engineering. At each step, we make the next decision easier to see—and easier to explain.</p>
            <Link className="text-link premium-text-link mt-4" href="/process">Our delivery process <span className="icon-smooth">↗</span></Link>
          </div>
          <div className="delivery-list timeline-list">
            {deliverySteps.map(([number, title, text], i) => (
              <article className="delivery-step timeline-step" key={number} data-reveal data-delay={i * 100}>
                <div className="timeline-node"></div>
                <span className="delivery-number massive-number">{number}</span>
                <div className="timeline-content">
                  <h3 className="timeline-title">{title}</h3>
                  <p className="timeline-text">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --- PRINCIPLES --- */}
      <section className="principles-section shell clean-grid" id="about">
        <div className="section-heading centered-heading" data-reveal>
          <div className="eyebrow mono-accent">The Origins standard</div>
          <h2 className="premium-h2">Trust is earned in<br /><em className="italic-accent">the details.</em></h2>
        </div>
        <div className="principles-list bento-grid-2x2">
          {principles.map(([title, body], index) => (
            <article className="principle-row bento-card subtle-card" key={title} data-reveal data-delay={index * 100}>
              <div className="card-header">
                <span className="principle-index mono-accent">0{index + 1}</span>
                <div className="tech-line"></div>
              </div>
              <h3 className="card-title">{title}</h3>
              <p className="card-text">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="cta-section brutalist-cta" id="contact">
        <div className="shell cta-layout" data-reveal>
          <div className="cta-grid-bg" aria-hidden="true"></div>
          <div className="cta-content-wrapper">
            <div className="eyebrow mono-accent pulse-text">Start with a conversation</div>
            <h2 className="massive-title">Bring us the<br /><em className="italic-accent">difficult part.</em></h2>
            <p className="cta-p">Tell us what you are building, what is not working or what needs to happen next. We will help turn the problem into a practical plan.</p>
            <div className="hero-actions cta-actions">
              <Link className="button button-primary premium-btn" href="/contact">Talk to Origins <span className="button-arrow icon-smooth" aria-hidden="true">↗</span></Link>
              <a href="mailto:support@origins-software.com" className="button button-ghost premium-btn-ghost">Email the team <span className="button-arrow icon-smooth" aria-hidden="true">↗</span></a>
            </div>
          </div>
          <div className="cta-footer-metrics">
            <span className="mono-accent">ORIGINS SOFTWARE</span>
            <span className="mono-accent right-align">ENGINEERED WITH INTENT.</span>
          </div>
        </div>
      </section>

      <SiteFooter/>

      {/* --- PREMIUM STYLES --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --premium-ease: cubic-bezier(0.16, 1, 0.3, 1);
          --surface-bg: #030303;
          --surface-border: rgba(255, 255, 255, 0.08);
          --text-primary: #ffffff;
          --text-secondary: #888888;
        }

        .premium-override { background-color: var(--surface-bg); color: var(--text-primary); overflow-x: hidden; }

        .reveal-pending { opacity: 0; transform: translateY(30px); }
        .is-visible { opacity: 1; transform: translateY(0); transition: opacity 1s var(--premium-ease), transform 1s var(--premium-ease); will-change: opacity, transform; }

        .massive-title { font-size: clamp(2.5rem, 5vw, 4.5rem); line-height: 1.05; letter-spacing: -0.03em; font-weight: 400; margin-bottom: 1.5rem; }
        .premium-h2 { font-size: clamp(2rem, 3.5vw, 3.5rem); line-height: 1.1; letter-spacing: -0.02em; font-weight: 400; }
        .italic-accent { font-style: italic; color: var(--text-secondary); font-weight: 300; }
        .mono-accent { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-secondary); }

        /* TIGHTER HERO LAYOUT */
        .premium-hero { position: relative; padding-top: 10vh; padding-bottom: 3rem; display: flex; align-items: center; }
        .compact-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .hero-noise { position: absolute; inset: 0; opacity: 0.03; pointer-events: none; background: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E'); }

        /* PREMIUM FROSTED CHART WIDGET */
        .premium-chart-widget {
          position: relative; width: 100%; height: 380px; 
          border: 1px solid rgba(255,255,255,0.12); border-radius: 16px;
          background: linear-gradient(180deg, rgba(20,20,20,0.6) 0%, rgba(0,0,0,0.8) 100%);
          backdrop-filter: blur(20px); box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          display: flex; flex-direction: column; overflow: hidden;
        }
        
        .arch-glow { position: absolute; width: 100%; height: 100%; top: 0; left: 0; filter: blur(60px); transition: background 1s ease; pointer-events: none; opacity: 0.4; mix-blend-mode: screen; }

        .chart-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.5rem; position: relative; z-index: 10; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .chart-title { color: #fff; font-weight: 500; }
        .chart-subtitle { font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; }
        .chart-live-value { font-family: monospace; font-size: 2.5rem; line-height: 1; font-weight: 300; transition: color 0.5s ease; text-shadow: 0 0 20px currentColor; }
        .ms-text { font-size: 1rem; color: var(--text-secondary); }

        .chart-container { position: absolute; inset: 0; top: 85px; bottom: 45px; cursor: crosshair; z-index: 5; }
        .chart-svg { width: 100%; height: 100%; display: block; overflow: visible; }
        
        .chart-grid line { stroke: rgba(255,255,255,0.08); stroke-width: 1; stroke-dasharray: 2 4; transition: y1 2.5s linear, y2 2.5s linear; }
        .chart-area-path, .chart-line-path, .leading-dot { transition: all 2.5s linear; }

        .crypto-price-tag {
          position: absolute; right: 0; transform: translateY(-50%); padding: 4px 10px; color: #000; font-weight: bold; border-radius: 4px 0 0 4px;
          display: flex; align-items: center; gap: 6px; box-shadow: -4px 0 15px rgba(0,0,0,0.5); transition: top 2.5s linear, background-color 0.5s ease; pointer-events: none;
        }
        .pulse-dot { width: 6px; height: 6px; background: rgba(0,0,0,0.6); border-radius: 50%; animation: pulse 1s infinite alternate; }
        @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.2); opacity: 1; } }

        .chart-tooltip {
          position: absolute; transform: translateX(-50%); background: rgba(0,0,0,0.9);
          border: 1px solid rgba(255,255,255,0.1); padding: 0.5rem 1rem; border-radius: 8px; pointer-events: none;
          text-align: center; white-space: nowrap; box-shadow: 0 10px 20px rgba(0,0,0,0.5); z-index: 20;
        }

        .widget-footer { position: absolute; bottom: 0; width: 100%; display: flex; justify-content: space-between; padding: 0.75rem 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); font-family: monospace; font-size: 0.7rem; color: var(--text-secondary); background: rgba(0,0,0,0.2); }

        /* PREMIUM ECOSYSTEM STRIP */
        .ecosystem-section { padding: 4rem 0 2rem; border-bottom: 1px solid var(--surface-border); }
        .ecosystem-title { margin-bottom: 2rem; opacity: 0.5; font-size: 0.7rem; }
        .ecosystem-logos { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2rem; padding: 0 2rem; opacity: 0.7; }
        .partner-logo { display: flex; align-items: center; gap: 0.75rem; font-weight: 500; font-size: 0.95rem; filter: grayscale(100%); transition: filter 0.3s ease, opacity 0.3s ease; opacity: 0.6; }
        .partner-logo:hover { filter: grayscale(0%); opacity: 1; }
        .partner-logo svg { flex-shrink: 0; }

        /* BUTTONS & LINKS */
        .premium-btn { background: #ffffff; color: #000000; border-radius: 99px; padding: 1rem 2rem; font-weight: 500; transition: transform 0.4s var(--premium-ease), box-shadow 0.4s var(--premium-ease); }
        .premium-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(255,255,255,0.1); }
        .premium-btn-ghost { border: 1px solid var(--surface-border); border-radius: 99px; padding: 1rem 2rem; transition: background 0.4s var(--premium-ease); }
        .premium-btn-ghost:hover { background: rgba(255,255,255,0.05); }
        .icon-smooth { display: inline-block; transition: transform 0.4s var(--premium-ease); }
        .premium-btn:hover .icon-smooth, .premium-btn-ghost:hover .icon-smooth, .premium-text-link:hover .icon-smooth { transform: translate(3px, -3px); }

        /* TIGHTER BENTO GRIDS & SECTIONS */
        .capabilities-section { padding-top: 6rem; }
        .bento-section { padding: 5rem 0; }
        .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 3rem; }
        .bento-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--surface-border); padding: 2rem; display: flex; flex-direction: column; justify-content: space-between; min-height: 320px; transition: transform 0.4s var(--premium-ease), background 0.4s var(--premium-ease); border-radius: 8px; }
        .bento-card:hover { background: rgba(255, 255, 255, 0.04); transform: translateY(-3px); }
        
        .card-top { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
        .card-title { font-size: 1.3rem; font-weight: 400; margin-bottom: 0.75rem; }
        .card-text { color: var(--text-secondary); line-height: 1.5; font-size: 0.95rem; }
        .card-bottom { margin-top: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid var(--surface-border); padding-top: 1rem; }
        .bento-arrow { font-size: 1.2rem; color: var(--text-secondary); transition: transform 0.3s; }
        .bento-card:hover .bento-arrow { transform: translate(3px, -3px); color: #fff; }

        .bento-grid-2x2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 3rem; }
        .subtle-card { min-height: 200px; }
        .tech-line { height: 1px; background: var(--surface-border); flex-grow: 1; margin-left: 1rem; }
        .card-header { display: flex; align-items: center; margin-bottom: 1.5rem; }

        /* ROW ACCORDION */
        .sleek-accordion { display: flex; flex-direction: column; margin-top: 3rem; }
        .premium-row { display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 2rem; padding: 2rem 0; border-bottom: 1px solid var(--surface-border); align-items: center; transition: background 0.3s ease, padding 0.3s ease; }
        .premium-row:first-child { border-top: 1px solid var(--surface-border); }
        .premium-row:hover { background: rgba(255,255,255,0.015); padding-left: 1rem; padding-right: 1rem; }
        .row-left { display: flex; gap: 1.5rem; align-items: baseline; }
        .row-title { font-size: 1.3rem; font-weight: 400; }
        .row-text { color: var(--text-secondary); font-size: 1rem; max-width: 500px; line-height: 1.5; }
        .row-right { display: flex; justify-content: space-between; align-items: center; }
        .mono-tag { font-family: monospace; font-size: 0.65rem; padding: 0.3rem 0.6rem; border: 1px solid var(--surface-border); border-radius: 4px; color: var(--text-secondary); }

        /* TIMELINE */
        .method-split { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; position: relative; padding-top: 5rem; }
        .sticky-side { position: sticky; top: 15vh; height: fit-content; }
        .timeline-list { position: relative; border-left: 1px solid var(--surface-border); padding-left: 2.5rem; }
        .timeline-step { position: relative; margin-bottom: 4rem; }
        .timeline-node { position: absolute; left: -2.5rem; top: 0; width: 9px; height: 9px; background: var(--surface-bg); border: 1px solid #fff; border-radius: 50%; transform: translateX(-50%); }
        .massive-number { font-size: 3rem; font-weight: 300; line-height: 1; color: rgba(255,255,255,0.05); display: block; margin-bottom: 0.5rem; }
        .timeline-title { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .timeline-text { color: var(--text-secondary); line-height: 1.6; font-size: 1rem; }

        /* BRUTALIST CTA */
        .brutalist-cta { padding: 8rem 0; position: relative; overflow: hidden; }
        .cta-grid-bg { position: absolute; inset: 0; background-image: linear-gradient(var(--surface-border) 1px, transparent 1px), linear-gradient(90deg, var(--surface-border) 1px, transparent 1px); background-size: 40px 40px; opacity: 0.2; mask-image: radial-gradient(circle at center, black, transparent 70%); }
        .cta-content-wrapper { position: relative; z-index: 1; text-align: center; max-width: 800px; margin: 0 auto; }
        .cta-p { font-size: 1.1rem; color: var(--text-secondary); margin: 1.5rem auto 2.5rem; max-width: 600px; line-height: 1.5; }
        .cta-actions { justify-content: center; }
        .cta-footer-metrics { display: flex; justify-content: space-between; border-top: 1px solid var(--surface-border); margin-top: 5rem; padding-top: 1.5rem; position: relative; z-index: 1; }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .compact-hero { grid-template-columns: 1fr; gap: 3rem; }
          .premium-row { grid-template-columns: 1fr; gap: 1rem; }
          .row-left { display: flex; flex-direction: column; gap: 0.25rem; }
          .bento-grid, .bento-grid-2x2 { grid-template-columns: 1fr 1fr; }
          .method-split { grid-template-columns: 1fr; }
          .sticky-side { position: static; margin-bottom: 3rem; }
          .ecosystem-logos { justify-content: center; }
        }
        @media (max-width: 768px) {
          .premium-chart-widget { height: 320px; }
          .bento-grid, .bento-grid-2x2 { grid-template-columns: 1fr; }
          .timeline-list { padding-left: 1.5rem; }
          .timeline-node { left: -1.5rem; }
          .crypto-price-tag { display: none; }
        }
      `}} />
    </main>
  );
}