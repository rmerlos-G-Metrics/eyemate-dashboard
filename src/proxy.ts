import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

const locales = ['en', 'de'];
const defaultLocale = 'en';

export function proxy(request: NextRequest) {
    const {pathname} = request.nextUrl;

    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return NextResponse.next();

    //If no locale, redirect to default locale
    request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Do not run middleware on static files, API routes, or Next.js internals
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};