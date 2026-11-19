
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'ja', 'zh', 'ar', 'de'] as const;
type Locale = (typeof locales)[number];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split('/');
  const firstSegment = segments[1];

  const isLocale = locales.includes(firstSegment as Locale);
  const locale: Locale = isLocale ? firstSegment as Locale : 'en';

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);

  if (locale === 'en' && isLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${segments.slice(2).join('/')}`;

    return NextResponse.redirect(url);
  }

  if (isLocale && locale !== 'en') {
    const url = request.nextUrl.clone();
    url.pathname = `/${segments.slice(2).join('/')}`;

    return NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
