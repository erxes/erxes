'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { Icon } from '@/modules/ui/components/Icon';
import { useT } from '@/modules/i18n/components/LocaleProvider';
import { cn } from '@/modules/ui/lib/cn';
import { startRouteProgress } from '@/modules/layout/utils/routeProgress';

const LIVE_DELAY_MS = 300;

const searchHref = (term: string): string =>
  term ? `/search?q=${encodeURIComponent(term)}` : '/search';

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

export const SidebarSearch = ({ onNavigate }: { onNavigate?: () => void }) => {
  const router = useRouter();
  const pathname = usePathname();
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [query, setQuery] = useState('');
  const [lastPath, setLastPath] = useState(pathname);

  if (lastPath !== pathname) {
    setLastPath(pathname);

    if (pathname !== '/search') {
      setQuery('');
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const input = inputRef.current;

      if (!input || input.offsetParent === null) {
        return;
      }

      const shortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      const slash = event.key === '/' && !isTypingTarget(event.target);

      if (!shortcut && !slash) {
        return;
      }

      event.preventDefault();
      input.focus();
      input.select();
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(timer.current);
    };
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setQuery(value);
    window.clearTimeout(timer.current);

    if (pathname === '/search') {
      timer.current = window.setTimeout(
        () => router.replace(searchHref(value.trim())),
        LIVE_DELAY_MS,
      );
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.clearTimeout(timer.current);
    const target = searchHref(query.trim());

    startRouteProgress(target);
    router.push(target);
    onNavigate?.();
  };

  return (
    <form role="search" onSubmit={handleSubmit} className="group relative">
      <Icon
        name="search"
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45 transition-colors duration-200 group-focus-within:text-white/80"
      />

      <input
        ref={inputRef}
        type="search"
        autoComplete="off"
        value={query}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.currentTarget.blur();
          }
        }}
        aria-label={t('search.ariaLabel')}
        placeholder={t('common.search')}
        className="h-9 w-full rounded-lg border border-transparent bg-shell-soft pl-9 pr-9 text-[13px] text-white outline-none transition-[border-color,box-shadow] duration-200 ease-out-soft placeholder:text-white/45 focus:border-brand/50 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand)_25%,transparent)] [&::-webkit-search-cancel-button]:hidden"
      />

      <kbd
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute right-2 top-1/2 flex h-5 min-w-5 -translate-y-1/2 items-center justify-center rounded border border-shell-line px-1 font-sans text-[11px] text-white/35 transition-opacity duration-200 group-focus-within:opacity-0',
          query && 'opacity-0',
        )}
      >
        /
      </kbd>
    </form>
  );
};
