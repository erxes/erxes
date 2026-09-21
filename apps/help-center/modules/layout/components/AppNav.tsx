'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from '@/modules/auth/components/SessionProvider';
import { Avatar } from '@/modules/ui/components/Avatar';
import { Icon, type IconName } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';

export type NavLink = {
  href: string;
  label: string;
  icon: IconName;
};

export type NavSection = {
  _id: string;
  title: string;
  href: string;
  articleCount: number;
  categories: { _id: string; title: string; articleCount: number }[];
};

const linkActive = (href: string, pathname: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href.split('#')[0]);

const Wordmark = ({
  title,
  logo,
  wordmark,
}: {
  title: string;
  logo: string | null;
  wordmark: string;
}) => (
  <Link
    href="/"
    className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/30"
  >
    {logo ? (
      <img
        src={logo}
        alt={title}
        className="h-7 w-auto max-w-40 object-contain"
      />
    ) : (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand text-[13px] font-semibold text-white">
        {(wordmark || title || 'e').trim().charAt(0).toUpperCase()}
      </span>
    )}
    <span className="min-w-0 truncate text-sm font-semibold text-white">
      {wordmark || title}
    </span>
  </Link>
);

const NavList = ({
  links,
  sections,
  pathname,
  onNavigate,
}: {
  links: NavLink[];
  sections: NavSection[];
  pathname: string;
  onNavigate?: () => void;
}) => (
  <nav aria-label="Portal" className="flex flex-col gap-6 text-[13px]">
    <ul className="flex flex-col gap-0.5">
      {links.map((link) => {
        const active = linkActive(link.href, pathname);

        return (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium transition-colors duration-150',
                active
                  ? 'bg-shell-soft text-white'
                  : 'text-white/60 hover:bg-shell-soft/70 hover:text-white',
              )}
            >
              <Icon name={link.icon} size={16} className="shrink-0" />
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>

    {sections.length ? (
      <div>
        <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-white/35">
          Knowledge base
        </p>

        <div className="mt-1.5 flex flex-col gap-3">
          {sections.map((section) => {
            const sectionActive =
              !section.categories.length &&
              pathname === `/knowledge-base/category/${section._id}`;

            return (
              <div key={section._id}>
                <Link
                  href={section.href}
                  onClick={onNavigate}
                  aria-current={sectionActive ? 'page' : undefined}
                  className={cn(
                    'flex items-baseline gap-2 rounded-lg px-2.5 py-1.5 font-medium transition-colors duration-150',
                    sectionActive
                      ? 'text-white'
                      : 'text-white/75 hover:text-white',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {section.title}
                  </span>
                  {!section.categories.length ? (
                    <span className="shrink-0 text-[12px] tabular-nums text-white/35">
                      {section.articleCount}
                    </span>
                  ) : null}
                </Link>

                {section.categories.length ? (
                  <ul className="ml-2.5 mt-0.5 border-l border-shell-line pl-2.5">
                    {section.categories.map((category) => {
                      const href = `/knowledge-base/category/${category._id}`;
                      const active = pathname === href;

                      return (
                        <li key={category._id}>
                          <Link
                            href={href}
                            onClick={onNavigate}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'flex items-baseline gap-2 rounded-md px-2.5 py-1.5 transition-colors duration-150',
                              active
                                ? 'text-white'
                                : 'text-white/50 hover:text-white',
                            )}
                          >
                            <span className="min-w-0 flex-1 truncate">
                              {category.title}
                            </span>
                            <span className="shrink-0 text-[12px] tabular-nums text-white/30">
                              {category.articleCount}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    ) : null}
  </nav>
);

const AccountBlock = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { user, ready, signOut } = useSession();

  if (!ready) {
    return (
      <span className="block h-9 animate-pulse rounded-lg bg-shell-soft" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/sign-in"
          onClick={onNavigate}
          className="flex h-9 flex-1 items-center justify-center rounded-lg bg-white text-[13px] font-semibold text-shell transition-colors duration-150 hover:bg-white/90"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          onClick={onNavigate}
          className="flex h-9 items-center justify-center rounded-lg px-3 text-[13px] font-medium text-white/60 transition-colors duration-150 hover:bg-shell-soft hover:text-white"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <Link
        href="/account"
        onClick={onNavigate}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1.5 py-1.5 transition-colors duration-150 hover:bg-shell-soft"
      >
        <Avatar name={user.name} size={28} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-white">
            {user.name}
          </span>
          <span className="block truncate text-[11px] text-white/40">
            {user.email}
          </span>
        </span>
      </Link>
      <button
        type="button"
        aria-label="Sign out"
        onClick={signOut}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors duration-150 hover:bg-shell-soft hover:text-white"
      >
        <Icon name="logout" size={16} />
      </button>
    </div>
  );
};

export const AppNav = ({
  title,
  logo,
  wordmark,
  links,
  sections,
}: {
  title: string;
  logo: string | null;
  wordmark: string;
  links: NavLink[];
  sections: NavSection[];
}) => {
  const pathname = usePathname();
  const [menu, setMenu] = useState({ open: false, path: pathname });

  if (menu.path !== pathname) {
    setMenu({ open: false, path: pathname });
  }

  const open = menu.open;
  const close = useCallback(
    () => setMenu((current) => ({ ...current, open: false })),
    [],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [close]);

  const panel = (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 px-4">
        <Wordmark title={title} logo={logo} wordmark={wordmark} />
      </div>

      <div className="px-3">
        <Link
          href="/search"
          className="flex h-9 items-center gap-2.5 rounded-lg bg-shell-soft px-3 text-[13px] text-white/45 transition-colors duration-150 hover:text-white/80"
        >
          <Icon name="search" size={15} className="shrink-0" />
          Search
        </Link>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <NavList
          links={links}
          sections={sections}
          pathname={pathname}
          onNavigate={close}
        />
      </div>

      <div className="shrink-0 border-t border-shell-line p-3">
        <AccountBlock onNavigate={close} />
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-shell-line bg-shell lg:flex">
        {panel}
      </aside>

      <div className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-shell-line bg-shell px-4 lg:hidden">
        <Wordmark title={title} logo={logo} wordmark={wordmark} />

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className="flex size-9 items-center justify-center rounded-lg text-white/60 transition-colors duration-150 hover:bg-shell-soft hover:text-white"
          >
            <Icon name="search" size={18} />
          </Link>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setMenu({ open: !open, path: pathname })}
            className="flex size-9 items-center justify-center rounded-lg text-white/60 transition-colors duration-150 hover:bg-shell-soft hover:text-white"
          >
            <Icon name={open ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={close}
            className="absolute inset-0 bg-shell/70 backdrop-blur-sm"
          />
          <div className="animate-in slide-in-from-left absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-shell-line bg-shell duration-200">
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="absolute right-3 top-3.5 flex size-8 items-center justify-center rounded-lg text-white/50 transition-colors duration-150 hover:bg-shell-soft hover:text-white"
            >
              <Icon name="close" size={18} />
            </button>
            {panel}
          </div>
        </div>
      ) : null}
    </>
  );
};
