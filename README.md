# Origins Software website

Proprietary project for Origins Software. All rights reserved.

## Local development

Requirements: Node.js 20.9 or later and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production checks

```bash
npm run lint
npm run build
npm run start
```

## Configuration

Copy `.env.example` to `.env.local` when deploying and set the site/portal values appropriate to the production environment. `NEXT_PUBLIC_SITE_URL` controls canonical metadata and sitemap URLs. `NEXT_PUBLIC_CLIENT_PORTAL_URL` controls the client portal link. If omitted, the app uses its current Origins defaults.

## Brand system

The site uses the supplied Origins emblem and the documented core palette: navy `#020D14`, raised navy `#0B1F29`, divider `#1B3342`, lime `#CDDC39`, primary text `#F2F5F7`, and secondary text `#A9BCC7`. Inter is used for interface and editorial text; Saira Stencil One and Montserrat are reserved for the brand lockup.

## Publishing note

Before launch, verify the official registered entity details and have the legal policy content reviewed. Those business/legal facts were not inferred or invented during this visual redesign.
