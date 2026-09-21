import type { ReactNode } from 'react';
import { Container } from '@/modules/ui/components/Container';
import { getPortalSettings } from '../api';
import { site } from '../constants/site';
import { SearchBar } from './SearchBar';

export const Hero = async ({
  headline = site.fallbackHeadline,
  searchQuery,
  as: Heading = 'h1',
  children,
}: {
  headline?: string;
  searchQuery?: string;
  as?: 'h1' | 'p';
  children?: ReactNode;
}) => {
  const { theme, header } = await getPortalSettings();
  const image = theme?.heroImage;

  return (
    <section className="relative overflow-hidden bg-shell pb-16 pt-14 text-white sm:pb-20 sm:pt-20">
      {image ? (
        <>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full object-cover opacity-40"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-shell/75"
          />
        </>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-40 -top-56 size-144 rounded-full bg-brand/25 blur-[120px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 top-10 size-112 rounded-full bg-brand/10 blur-[120px]"
          />
        </>
      )}

      <Container className="relative">
        <div className="max-w-3xl">
          <Heading className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both text-balance text-[34px] font-semibold leading-[1.1] tracking-[-0.04em] duration-500 sm:text-[52px]">
            {headline}
          </Heading>

          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both mt-8 max-w-xl delay-100 duration-500">
            <SearchBar
              initialQuery={searchQuery}
              placeholder={header.searchPlaceholder}
            />
          </div>

          {children ? (
            <div className="animate-in fade-in fill-mode-both mt-6 delay-200 duration-500">
              {children}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
};
