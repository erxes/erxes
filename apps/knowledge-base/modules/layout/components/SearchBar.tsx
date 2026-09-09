'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Icon } from '@/modules/ui/components/Icon';
import { site } from '../constants/site';

export const SearchBar = ({ initialQuery = '' }: { initialQuery?: string }) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="relative mx-auto w-full"
    >
      <label htmlFor="kb-search" className="sr-only">
        {site.searchPlaceholder}
      </label>
      <Icon
        name="search"
        size={22}
        className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-hero/45 sm:left-6"
      />
      <input
        id="kb-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={site.searchPlaceholder}
        className="h-14 w-full rounded-full border border-white/30 bg-white/95 pl-14 pr-28 text-[15px] text-ink shadow-[0_8px_28px_rgba(20,20,43,0.16)] transition-[box-shadow,background-color] duration-300 placeholder:text-hero/45 focus:bg-white focus:shadow-[0_14px_40px_rgba(20,20,43,0.24)] focus:outline-none focus:ring-4 focus:ring-white/35 sm:h-16 sm:pl-16 sm:pr-32 sm:text-base"
      />
      <button
        type="submit"
        className="absolute right-2.5 top-1/2 h-10 -translate-y-1/2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-brand-strong active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-3 sm:h-11 sm:px-6"
      >
        Search
      </button>
    </form>
  );
};
