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
    <section className="relative overflow-hidden bg-hero bg-[radial-gradient(120%_100%_at_50%_0%,var(--color-hero-soft),transparent_62%)] pb-16 pt-14 text-white sm:pb-20 sm:pt-16">
      {image ? (
        <>
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
        <h1 className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both mx-auto max-w-3xl text-balance text-[22px] font-semibold leading-[1.35] tracking-[-0.02em] duration-700 sm:text-[28px]">
          {headline}
        </h1>
        <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both mx-auto mt-8 max-w-2xl delay-150 duration-700">
          <SearchBar initialQuery={searchQuery} />
        </div>
        {children ? (
          <div className="animate-in fade-in fill-mode-both mt-6 delay-300 duration-700">
            {children}
          </div>
        ) : null}
      </Container>
    </section>
  );
};
