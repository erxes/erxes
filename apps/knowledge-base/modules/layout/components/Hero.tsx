import type { ReactNode } from 'react';
import { Container } from '@/modules/ui/components/Container';
import { getPortalSettings } from '../api';
import { site } from '../constants/site';
import { HeroPattern } from './HeroPattern';
import { SearchBar } from './SearchBar';

export const Hero = async ({
  headline = site.fallbackHeadline,
  searchQuery,
  children,
}: {
  headline?: string;
  searchQuery?: string;
  children?: ReactNode;
}) => {
  const { theme } = await getPortalSettings();
  const image = theme?.heroImage;

  return (
    <section className="relative overflow-hidden bg-hero pb-16 pt-14 text-white">
      {image ? (
        /*
         * The help center's background image replaces the drawn pattern rather
         * than layering over it. It is a remote URL from erxes storage, so
         * `next/image` is not used, and it stays behind a scrim: the headline
         * and search sit on top and have to stay readable over any photo.
         */
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full object-cover"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-hero/70"
          />
        </>
      ) : (
        <HeroPattern />
      )}
      <Container className="relative text-center">
        <h1 className="mx-auto max-w-4xl text-balance text-xl font-normal leading-relaxed sm:text-2xl md:text-[28px] md:leading-[1.5]">
          {headline}
        </h1>
        <div className="mt-9">
          <SearchBar initialQuery={searchQuery} />
        </div>
        {children ? <div className="mt-6">{children}</div> : null}
      </Container>
    </section>
  );
};
