'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Icon } from '@/modules/ui/Icon';
import { site } from './site';

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
      className="relative mx-auto w-full max-w-3xl"
    >
      <label htmlFor="kb-search" className="sr-only">
        {site.searchPlaceholder}
      </label>
      <Icon
        name="search"
        size={24}
        className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-hero/50"
      />
      <input
        id="kb-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={site.searchPlaceholder}
        className="h-16 w-full rounded-full border border-white/40 bg-white/90 pl-16 pr-32 text-base text-ink shadow-[0_10px_30px_rgba(23,22,42,0.18)] placeholder:text-hero/50 focus:bg-white"
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 h-11 -translate-y-1/2 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
      >
        Хайх
      </button>
    </form>
  );
};
