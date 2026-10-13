'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { processStages, serviceSpecialties, workPatterns } from '@/app/data/siteContent';

const clientPortalUrl = process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL || 'https://portal.origins-software.com';
type MenuKey = 'services' | 'work' | 'process';

type MenuItem = { href: string; title: string; description: string; number: string };
const menuGroups: { key: MenuKey; href: string; label: string; eyebrow: string; title: string; description: string; items: MenuItem[] }[] = [
  {
    key: 'services', href: '/services', label: 'Services', eyebrow: 'Capabilities / 09 disciplines',
    title: 'The right expertise for the real problem.',
    description: 'From discovery through production, connect the work to the right technical discipline.',
    items: serviceSpecialties.map((item) => ({ href: `/services/${item.slug}`, title: item.title, description: item.category, number: item.number })),
  },
  {
    key: 'work', href: '/work', label: 'Work', eyebrow: 'Representative solution patterns',
    title: 'Start with the problem to solve.',
    description: 'Explore examples of the system challenges we help teams think through. These are illustrative patterns, not named client case studies.',
    items: workPatterns.map((item) => ({ href: `/work/${item.slug}`, title: item.title, description: item.sector, number: item.number })),
  },
  {
    key: 'process', href: '/process', label: 'Process', eyebrow: 'Delivery / 04 stages',
    title: 'Progress made visible, decisions made clear.',
    description: 'A considered path from understanding the challenge to handing over something your team can operate.',
    items: processStages.map((item) => ({ href: `/process/${item.slug}`, title: item.title, description: item.subtitle, number: item.number })),
  },
];

function BrandLockup() {
  return (
    <span className="brand-lockup">
      <Image src="/origins-icon.png" alt="" width={84} height={84} className="brand-icon" priority />
      <span className="brand-lockup-type"><span className="brand-origins">ORIGINS</span><span className="brand-software">SOFTWARE</span></span>
    </span>
  );
}

function pathIsActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuTriggerRefs = useRef<Record<MenuKey, HTMLButtonElement | null>>({ services: null, work: null, process: null });
  const mobileTriggerRef = useRef<HTMLButtonElement | null>(null);
  const suppressFocusOpen = useRef<MenuKey | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpenMenu(null);
    setOpenMobileGroup(null);
    setMobileOpen(false);
    suppressFocusOpen.current = null;
  }, [pathname]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    if (openMenu) {
      const closingMenu = openMenu;
      setOpenMenu(null);
      setOpenMobileGroup(null);
      const trigger = menuTriggerRefs.current[closingMenu];
      if (trigger && document.activeElement !== trigger) {
        suppressFocusOpen.current = closingMenu;
        trigger.focus();
      }
    } else if (mobileOpen) {
      setOpenMobileGroup(null);
      setMobileOpen(false);
      mobileTriggerRef.current?.focus();
    } else {
      setOpenMobileGroup(null);
    }
  };

  const activeGroup = menuGroups.find((group) => group.key === openMenu);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header
        className={`company-site-header${openMenu ? ' has-open-menu' : ''}`}
        id="top"
        onMouseLeave={() => setOpenMenu(null)}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setOpenMenu(null);
        }}
      >
        <div className="site-nav-inner">
          <Link href="/" className="brand" aria-label="Origins Software home" onClick={() => { setOpenMenu(null); setMobileOpen(false); }}>
            <BrandLockup />
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {menuGroups.map((group) => (
              <div
                className={`desktop-nav-item${pathIsActive(pathname, group.href) ? ' is-active' : ''}${openMenu === group.key ? ' is-open' : ''}`}
                key={group.key}
                onMouseEnter={() => setOpenMenu(group.key)}
                onFocus={() => {
                  if (suppressFocusOpen.current === group.key) { suppressFocusOpen.current = null; return; }
                  setOpenMenu(group.key);
                }}
              >
                <Link href={group.href} className="desktop-nav-link" aria-haspopup="true" aria-expanded={openMenu === group.key}>
                  {group.label}
                </Link>
                <button
                  type="button"
                  className="nav-menu-toggle"
                  aria-label={`Open ${group.label} menu`}
                  aria-expanded={openMenu === group.key}
                  aria-controls={openMenu === group.key ? 'desktop-mega-menu' : undefined}
                  ref={(element) => { menuTriggerRefs.current[group.key] = element; }}
                  onClick={() => setOpenMenu(group.key)}
                ><span aria-hidden="true">⌄</span></button>
              </div>
            ))}
            <Link href="/about" className={`desktop-nav-link desktop-nav-about${pathIsActive(pathname, '/about') ? ' is-active' : ''}`}>About</Link>
          </nav>

          <div className="desktop-nav-actions">
            <a href={clientPortalUrl} className="nav-quiet" target="_blank" rel="noreferrer">Client portal <span aria-hidden="true">↗</span></a>
            <Link href="/contact" className="nav-cta">Start a project <span aria-hidden="true">↗</span></Link>
          </div>

          <button
            type="button"
            className="menu-button"
            ref={mobileTriggerRef}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => { if (mobileOpen) setOpenMobileGroup(null); setMobileOpen(!mobileOpen); }}
          >
            <span /> <span />
          </button>
        </div>

        {activeGroup && (
          <div className={`mega-menu mega-menu-${activeGroup.key} is-open`} id="desktop-mega-menu" role="region" aria-label={`${activeGroup.label} quick navigation`}>
            <div className="mega-menu-inner">
              <div className="mega-menu-intro">
                <div className="mega-menu-eyebrow">{activeGroup.eyebrow}</div>
                <h2>{activeGroup.title}</h2>
                <p>{activeGroup.description}</p>
                <Link className="mega-menu-all" href={activeGroup.href} onClick={() => setOpenMenu(null)}>
                  Explore {activeGroup.label.toLowerCase()} <span aria-hidden="true">↗</span>
                </Link>
                {activeGroup.key === 'services' && <Link className="mega-menu-secondary" href="/features" onClick={() => setOpenMenu(null)}>Engineering standards <span aria-hidden="true">↗</span></Link>}
              </div>
              <div className="mega-menu-links">
                {activeGroup.items.map((item) => (
                  <Link href={item.href} key={item.href} className="mega-menu-link" onClick={() => setOpenMenu(null)}>
                    <span className="mega-menu-number">{item.number}</span>
                    <span className="mega-menu-link-copy"><strong>{item.title}</strong><small>{item.description}</small></span>
                    <span className="mega-menu-arrow" aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <nav id="mobile-navigation" className={`mobile-nav-panel ${mobileOpen ? 'is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!mobileOpen}>
          {menuGroups.map((group) => (
            <div className="mobile-nav-group" key={group.key}>
              <div className="mobile-nav-group-row">
                <Link href={group.href} className={pathIsActive(pathname, group.href) ? 'is-active' : undefined} tabIndex={mobileOpen ? 0 : -1}>{group.label}</Link>
                <button type="button" aria-label={`${openMobileGroup === group.key ? 'Collapse' : 'Expand'} ${group.label} links`} aria-expanded={openMobileGroup === group.key} aria-controls={openMobileGroup === group.key ? `mobile-${group.key}-submenu` : undefined} onClick={() => setOpenMobileGroup((current) => current === group.key ? null : group.key)} tabIndex={mobileOpen ? 0 : -1}>{openMobileGroup === group.key ? '−' : '+'}</button>
              </div>
              {openMobileGroup === group.key && <div className="mobile-subnav" id={`mobile-${group.key}-submenu`}>
                {group.key === 'services' && <Link href="/features" onClick={() => setMobileOpen(false)} tabIndex={mobileOpen ? 0 : -1}>Engineering standards<span aria-hidden="true">↗</span></Link>}
                {group.items.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} tabIndex={mobileOpen ? 0 : -1}>{item.title}<span aria-hidden="true">↗</span></Link>)}
              </div>}
            </div>
          ))}
          <Link href="/about" className={pathIsActive(pathname, '/about') ? 'is-active' : undefined} onClick={() => setMobileOpen(false)} tabIndex={mobileOpen ? 0 : -1}>About</Link>
          <a href={clientPortalUrl} target="_blank" rel="noreferrer" onClick={() => setMobileOpen(false)} tabIndex={mobileOpen ? 0 : -1}>Client portal ↗</a>
          <Link href="/contact" className="nav-cta mobile-cta" onClick={() => setMobileOpen(false)} tabIndex={mobileOpen ? 0 : -1}>Start a project <span>↗</span></Link>
        </nav>
      </header>
    </>
  );
}
