import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ApolloWrapper } from '@/modules/apollo/components/ApolloWrapper';
import { SUBDOMAIN_PATTERN } from '@/modules/apollo/utils/env';
import { readConfig } from '@/modules/config/api';
import { readScopedCustomDomainSubdomain } from '@/modules/config/requestScope';
import { SessionProvider } from '@/modules/auth/components/SessionProvider';
import { LocaleProvider } from '@/modules/i18n/components/LocaleProvider';
import { getLocale } from '@/modules/i18n/server';
import { getPortalIdentity, getPortalSettings } from '@/modules/layout/api';
import { PortalTheme } from '@/modules/layout/components/PortalTheme';
import { RouteProgress } from '@/modules/layout/components/RouteProgress';
import { site } from '@/modules/layout/constants/site';
import { Toaster } from '@/modules/ui/components/Toaster';

export const dynamic = 'force-dynamic';

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const generateMetadata = async (): Promise<Metadata> => {
  const [{ title, headline }, { theme }] = await Promise.all([
    getPortalIdentity(),
    getPortalSettings(),
  ]);

  return {
    title: { default: `${title} | ${site.brand}`, template: `%s | ${title}` },
    description: headline,
    ...(theme?.favicon ? { icons: { icon: theme.favicon } } : {}),
  };
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [{ theme }, config, locale] = await Promise.all([
    getPortalSettings(),
    readConfig(),
    getLocale(),
  ]);

  // On a tenant's own domain the browser cannot read the tenant from the
  // host, so hand it the one the server resolved. The pattern check keeps
  // anything but a plain subdomain out of the inline script.
  const customDomainSubdomain = readScopedCustomDomainSubdomain();
  const publishSubdomain = SUBDOMAIN_PATTERN.test(customDomainSubdomain);

  return (
    <html
      lang={locale}
      className={`${openSans.variable} h-full`}
      data-scroll-behavior="smooth"
    >
      <head>
        <Script
          strategy="beforeInteractive"
          type="text/javascript"
          src="/js/env.js"
        />
        {publishSubdomain && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.erxesSubdomain=${JSON.stringify(
                customDomainSubdomain,
              )};`,
            }}
          />
        )}
      </head>
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        <noscript>
          <style>
            {'[data-reveal]{opacity:1!important;transform:none!important}'}
          </style>
        </noscript>
        <PortalTheme theme={theme} />
        <RouteProgress />
        <LocaleProvider locale={locale}>
          <ApolloWrapper appToken={config?.appToken ?? ''}>
            <SessionProvider>
              {children}
              <Toaster />
            </SessionProvider>
          </ApolloWrapper>
        </LocaleProvider>
      </body>
    </html>
  );
}
