import { Fragment, type ReactNode } from 'react';
import { getPortalSettings } from '../api';
import { site } from '../constants/site';
import { HeroBand } from './HeroBand';
import { SearchBar } from './SearchBar';

export const Hero = async ({
  headline = site.fallbackHeadline,
  eyebrow,
  lede,
  searchQuery,
  searchSuggestions,
  as: Heading = 'h1',
  meta,
  children,
}: {
  headline?: string;
  eyebrow?: string;
  lede?: string;
  searchQuery?: string;
  searchSuggestions?: string[];
  as?: 'h1' | 'p';
  meta?: ReactNode;
  children?: ReactNode;
}) => {
  const { header } = await getPortalSettings();

  const words = headline.split(/\s+/).filter(Boolean);

  return (
    <HeroBand className="pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pt-24">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] py-1.5 pl-2.5 pr-3.5 text-[12px] font-medium tracking-[0.01em] text-white/80 backdrop-blur-sm duration-500">
            <span
              aria-hidden="true"
              className="animate-blink size-1.5 rounded-full bg-white/60"
            />
            {eyebrow}
          </p>
        ) : null}

        <Heading className="text-balance text-[34px] font-semibold leading-[1.1] tracking-[-0.04em] sm:text-[52px]">
          {words.map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              <span
                className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both ease-out-soft inline-block duration-700"
                style={{ animationDelay: `${Math.min(index, 14) * 55}ms` }}
              >
                {word}
              </span>{' '}
            </Fragment>
          ))}
        </Heading>

        {lede ? (
          <p className="animate-in fade-in fill-mode-both mt-5 max-w-xl text-pretty text-[16px] leading-relaxed text-white/55 delay-[420ms] duration-500">
            {lede}
          </p>
        ) : null}

        <div className="mt-9 max-w-xl">
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both delay-[520ms] duration-500">
            <SearchBar
              initialQuery={searchQuery}
              placeholder={header.searchPlaceholder}
              suggestions={searchSuggestions}
            />
          </div>

          {children ? (
            <div className="animate-in fade-in fill-mode-both mt-5 delay-[620ms] duration-500">
              {children}
            </div>
          ) : null}
        </div>

        {meta ? (
          <div className="animate-in fade-in fill-mode-both mt-9 delay-[720ms] duration-700">
            {meta}
          </div>
        ) : null}
      </div>
    </HeroBand>
  );
};
