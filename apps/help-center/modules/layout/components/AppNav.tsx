'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { storedFileUrl } from '@/modules/apollo/utils/file';
import { NotificationBell } from '@/modules/notifications/components/NotificationBell';
import { useSession } from '@/modules/auth/components/SessionProvider';
import { Avatar } from '@/modules/ui/components/Avatar';
import { Icon, type IconName } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';

export type NavLink = {
  href: string;
  label: string;
  icon: IconName;
};

export type NavEntry = {
  href: string;
  label: string;
  count?: number;
  children?: { href: string; label: string; count?: number }[];
};

export type NavGroup = {
  key: string;
  href: string;
  label: string;
  icon: IconName;
  emptyLabel: string;
  items: NavEntry[];
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

const RootList = ({
  links,
  pathname,
  onNavigate,
}: {
  links: NavLink[];
  pathname: string;
  onNavigate?: () => void;
}) => (
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
              'group relative flex items-center gap-2.5 overflow-hidden rounded-lg px-2.5 py-2 font-medium transition-[background-color,color] duration-300 ease-out-soft',
              active
                ? 'bg-shell-soft text-white'
                : 'text-white/60 hover:bg-shell-soft/70 hover:text-white',
            )}
          >
            {active ? (
              <span
                aria-hidden="true"
                className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand"
              />
            ) : null}
            <Icon
              name={link.icon}
              size={16}
              className="shrink-0 transition-transform duration-300 ease-out-soft group-hover:scale-110"
            />
            {link.label}
          </Link>
        </li>
      );
    })}
  </ul>
);

const entryLink =
  'flex min-w-0 flex-1 items-baseline gap-2 rounded-lg px-2.5 py-1.5 transition-colors duration-150';

const Leaf = ({
  href,
  label,
  count,
  pathname,
  onNavigate,
  muted = false,
}: {
  href: string;
  label: string;
  count?: number;
  pathname: string;
  onNavigate?: () => void;
  muted?: boolean;
}) => {
  const active = !href.includes('#') && pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        entryLink,
        active
          ? 'bg-shell-soft text-white'
          : muted
          ? 'text-white/50 hover:text-white'
          : 'text-white/75 hover:text-white',
      )}
    >
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === 'number' ? (
        <span className="shrink-0 text-[12px] tabular-nums text-white/30">
          {count}
        </span>
      ) : null}
    </Link>
  );
};

const Entry = ({
  entry,
  pathname,
  expanded,
  onToggle,
  onNavigate,
}: {
  entry: NavEntry;
  pathname: string;
  expanded: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) => {
  if (!entry.children?.length) {
    return (
      <li>
        <Leaf
          href={entry.href}
          label={entry.label}
          count={entry.count}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-center">
        <Leaf
          href={entry.href}
          label={entry.label}
          count={entry.count}
          pathname={pathname}
          onNavigate={onNavigate}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${entry.label}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-white/35 transition-colors duration-150 hover:bg-shell-soft hover:text-white"
        >
          <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={14} />
        </button>
      </div>

      {expanded ? (
        <ul className="ml-2.5 mt-0.5 border-l border-shell-line pl-2.5">
          {entry.children.map((child) => (
            <li key={child.href}>
              <Leaf
                href={child.href}
                label={child.label}
                count={child.count}
                pathname={pathname}
                onNavigate={onNavigate}
                muted
              />
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
};

const SectionList = ({
  group,
  pathname,
  onBack,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  onBack: () => void;
  onNavigate?: () => void;
}) => {
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 self-start rounded-lg px-2.5 py-1 text-[12px] font-medium text-white/45 transition-colors duration-150 hover:text-white"
      >
        <Icon name="arrowLeft" size={13} />
        All sections
      </button>

      <Link
        href={group.href}
        onClick={onNavigate}
        aria-current={pathname === group.href ? 'page' : undefined}
        className={cn(
          'flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-semibold transition-colors duration-300 ease-out-soft',
          pathname === group.href
            ? 'bg-shell-soft text-white'
            : 'text-white/80 hover:bg-shell-soft/70 hover:text-white',
        )}
      >
        <Icon name={group.icon} size={16} className="shrink-0" />
        {group.label}
      </Link>

      {group.items.length ? (
        <ul className="flex flex-col gap-0.5 border-t border-shell-line pt-3">
          {group.items.map((entry) => (
            <Entry
              key={entry.href}
              entry={entry}
              pathname={pathname}
              expanded={toggled[entry.href] ?? true}
              onToggle={() =>
                setToggled((current) => ({
                  ...current,
                  [entry.href]: !(current[entry.href] ?? true),
                }))
              }
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : (
        <p className="border-t border-shell-line px-2.5 pt-3 text-[12px] leading-relaxed text-white/35">
          {group.emptyLabel}
        </p>
      )}
    </div>
  );
};

const AccountBlock = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { user, ready, signOut } = useSession();

  if (!ready) {
    return (
      <span className="block h-9 animate-pulse rounded-lg bg-shell-soft" />
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl bg-shell-soft p-3.5">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-white">
          <Icon name="ticket" size={14} className="shrink-0 text-white/50" />
          Track your tickets
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">
          Sign in to follow replies and see everything you have raised.
        </p>

        <div className="mt-3 flex items-center gap-2">
          <Link
            href="/sign-in"
            onClick={onNavigate}
            className="flex h-8 flex-1 items-center justify-center rounded-lg bg-white text-[12px] font-semibold text-shell outline-none transition-[background-color,transform] duration-300 ease-out-soft hover:bg-white/90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            onClick={onNavigate}
            className="flex h-8 items-center justify-center rounded-lg px-3 text-[12px] font-medium text-white/55 outline-none transition-colors duration-300 ease-out-soft hover:bg-white/10 hover:text-white focus-visible:bg-white/10"
          >
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-shell-soft p-1.5">
      <Link
        href="/account"
        onClick={onNavigate}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors duration-150 hover:bg-white/5"
      >
        <Avatar
          name={user.name}
          src={storedFileUrl(user.avatar ?? null)}
          size={28}
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-white">
            {user.name}
          </span>
          <span className="block truncate text-[11px] text-white/40">
            {user.email}
          </span>
        </span>
      </Link>
      <NotificationBell ringClass="ring-shell-soft" />

      <button
        type="button"
        aria-label="Sign out"
        onClick={signOut}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors duration-150 hover:bg-white/10 hover:text-white"
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
  groups,
}: {
  title: string;
  logo: string | null;
  wordmark: string;
  links: NavLink[];
  groups: NavGroup[];
}) => {
  const pathname = usePathname();

  const [menu, setMenu] = useState({
    open: false,
    browsing: false,
    path: pathname,
  });

  if (menu.path !== pathname) {
    setMenu({ open: false, browsing: false, path: pathname });
  }

  const open = menu.open;

  const section = menu.browsing
    ? undefined
    : groups.find((group) => pathname.startsWith(group.href));
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

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <nav aria-label="Portal" className="text-[13px]">
          {section ? (
            <SectionList
              group={section}
              pathname={pathname}
              onBack={() =>
                setMenu((current) => ({ ...current, browsing: true }))
              }
              onNavigate={close}
            />
          ) : (
            <RootList links={links} pathname={pathname} onNavigate={close} />
          )}
        </nav>
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
            onClick={() =>
              setMenu((current) => ({ ...current, open: !current.open }))
            }
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

            <div className="shrink-0 border-t border-shell-line p-3">
              <AccountBlock onNavigate={close} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
