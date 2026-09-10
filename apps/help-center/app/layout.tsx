import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ApolloWrapper } from '@/modules/apollo/components/ApolloWrapper';
import { readConfig } from '@/modules/config/api';
import { SessionProvider } from '@/modules/auth/components/SessionProvider';
import { getPortalIdentity, getPortalSettings } from '@/modules/layout/api';
import { PortalTheme } from '@/modules/layout/components/PortalTheme';
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
  const [{ theme }, config] = await Promise.all([
    getPortalSettings(),
    readConfig(),
  ]);

  return (
    <html lang="en" className={`${openSans.variable} h-full`}>
      <head>
        {/*
         * Written by docker-entrypoint.sh from the container's environment,
         * so the gateway stays a runtime setting rather than a value baked
         * into the client bundle. Absent outside Docker, where the browser
         * falls back to what `next build` inlined from .env.local.
         */}
        <Script
          strategy="beforeInteractive"
          type="text/javascript"
          src="/js/env.js"
        />
      </head>
      <body className="flex min-h-full flex-col bg-subtle text-ink">
        <noscript>
          <style>
            {'[data-reveal]{opacity:1!important;transform:none!important}'}
          </style>
        </noscript>
        <PortalTheme theme={theme} />
        <ApolloWrapper appToken={config?.appToken ?? ''}>
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
