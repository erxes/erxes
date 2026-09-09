import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import './globals.css';
import { ApolloWrapper } from '@/modules/apollo/components/ApolloWrapper';
import { readConfig } from '@/modules/config/api';
import { SessionProvider } from '@/modules/auth/components/SessionProvider';
import { getPortalIdentity, getPortalSettings } from '@/modules/layout/api';
import { PortalTheme } from '@/modules/layout/components/PortalTheme';
import { site } from '@/modules/layout/constants/site';
import { Toaster } from '@/modules/ui/components/Toaster';

/*
 * The portal resolves its help center from the domain each request arrives on,
 * which is request-time data, so pages are rendered per request rather than
 * revalidated on a timer. The config lookup itself is cached for a minute.
 */
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
