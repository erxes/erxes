import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import './globals.css';
import { ApolloWrapper } from '@/modules/apollo/ApolloWrapper';
import { SessionProvider } from '@/modules/auth/SessionProvider';
import { getPortalIdentity } from '@/modules/layout/api';
import { SiteFooter } from '@/modules/layout/SiteFooter';
import { SiteHeader } from '@/modules/layout/SiteHeader';
import { site } from '@/modules/layout/site';

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
  const { title, headline } = await getPortalIdentity();

  return {
    title: { default: `${title} | ${site.brand}`, template: `%s | ${title}` },
    description: headline,
  };
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { title } = await getPortalIdentity();

  return (
    <html lang="mn" className={`${openSans.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <ApolloWrapper>
          <SessionProvider>
            <SiteHeader title={title} />
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter title={title} />
          </SessionProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
