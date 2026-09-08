import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import './globals.css';
import { ApolloWrapper } from '@/modules/apollo/components/ApolloWrapper';
import { SessionProvider } from '@/modules/auth/components/SessionProvider';
import { getPortalIdentity, getPortalSettings } from '@/modules/layout/api';
import { PortalTheme } from '@/modules/layout/components/PortalTheme';
import { site } from '@/modules/layout/constants/site';
import { Toaster } from '@/modules/ui/components/Toaster';

/**
 * Knowledge base and CMS content is read through Apollo rather than `fetch`,
 * so the App Router would otherwise prerender these routes once at build time.
 * Revalidating keeps every page on live content without a request-per-render.
 */
export const revalidate = 60;

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
    // Only override the app's own icon when the help center uploaded one.
    ...(theme?.favicon ? { icons: { icon: theme.favicon } } : {}),
  };
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { theme } = await getPortalSettings();

  return (
    <html lang="mn" className={`${openSans.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-subtle text-ink">
        <PortalTheme theme={theme} />
        <ApolloWrapper>
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
