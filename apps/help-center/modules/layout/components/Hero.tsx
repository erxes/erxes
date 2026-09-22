import type { ReactNode } from 'react';
import { getPortalSettings } from '../api';
import { site } from '../constants/site';
import { HeroBand } from './HeroBand';
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
  const { header } = await getPortalSettings();

  return (
    <HeroBand className="pb-16 pt-14 sm:pb-20 sm:pt-20">
      <div className="max-w-3xl">
        <Heading className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both text-balance text-[34px] font-semibold leading-[1.1] tracking-[-0.04em] duration-500 sm:text-[52px]">
          {headline}
        </Heading>

        <div className="mt-8 max-w-xl">
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-100 duration-500">
            <SearchBar
              initialQuery={searchQuery}
              placeholder={header.searchPlaceholder}
            />
          </div>

          {children ? (
            <div className="animate-in fade-in fill-mode-both mt-5 delay-200 duration-500">
              {children}
            </div>
          ) : null}
        </div>
      </div>
    </HeroBand>
  );
};
