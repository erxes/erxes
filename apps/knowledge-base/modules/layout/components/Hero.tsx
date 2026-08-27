import type { ReactNode } from 'react';
import { Container } from '@/modules/ui/components/Container';
import { site } from '../constants/site';
import { HeroPattern } from './HeroPattern';
import { SearchBar } from './SearchBar';

export const Hero = ({
  headline = site.fallbackHeadline,
  searchQuery,
  children,
}: {
  headline?: string;
  searchQuery?: string;
  children?: ReactNode;
}) => (
  <section className="relative overflow-hidden bg-hero pb-16 pt-14 text-white">
    <HeroPattern />
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
