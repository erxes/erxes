'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Icon } from '@/modules/ui/components/Icon';
import { site } from '../constants/site';

export const SearchBar = ({
  initialQuery = '',
  placeholder = '',
}: {
  initialQuery?: string;
  placeholder?: string;
}) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const label = placeholder || site.searchPlaceholder;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="relative w-full">
      <label htmlFor="kb-search" className="sr-only">
        {label}
      </label>
      <Icon
        name="search"
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
      />
      <input
        id="kb-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={label}
        className="h-12 w-full rounded-xl border border-shell-line bg-shell-soft pl-11 pr-24 text-[15px] text-white transition-[border-color,background-color] duration-150 placeholder:text-white/35 focus:border-white/25 focus:bg-shell-soft/80 focus:outline-none"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 h-8 -translate-y-1/2 rounded-lg bg-white px-3.5 text-[13px] font-semibold text-shell transition-colors duration-150 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        Search
      </button>
    </form>
  );
};
