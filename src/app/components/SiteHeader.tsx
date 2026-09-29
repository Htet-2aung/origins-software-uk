'use client';

import Link from 'next/link';
import { useState } from 'react';

const links = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/work', label: 'Work' },
  { href: '/process', label: 'Process' },
  { href: '/contact', label: 'Contact' },
];

const portalUrl =
  process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL ||
  'https://portal.origins-software.com';

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="button-icon">
      <path d="M4 12 12 4M5 4h7v7" />
    </svg>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="company-site-header" id="top">
      <div className="site-nav-inner">
        <Link
          href="/"
          className="brand"
          aria-label="Origins home"
          onClick={() => setOpen(false)}
        >
          <span className="brand-logo-wrap">
            <img src="/origins-logo.png" alt="" className="brand-logo" />
          </span>
          <span className="brand-name">ORIGINS</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="desktop-nav-actions">
          <a
            href={portalUrl}
            className="nav-portal"
            rel="noopener noreferrer"
          >
            Client portal
          </a>
          <Link href="/contact" className="nav-cta">
            Start a project
            <ArrowIcon />
          </Link>
        </div>

        <button
          className="menu-button"
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      {open && (
        <div id="mobile-navigation" className="mobile-nav-panel">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <Link href="/company" onClick={() => setOpen(false)}>
            Company
          </Link>

          <a
            href={portalUrl}
            onClick={() => setOpen(false)}
            rel="noopener noreferrer"
          >
            Client portal
          </a>

          <Link
            href="/contact"
            className="nav-cta mobile-cta"
            onClick={() => setOpen(false)}
          >
            Start a project
            <ArrowIcon />
          </Link>
        </div>
      )}
    </header>
  );
}
