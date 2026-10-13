'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { storedFileUrl } from '@/modules/apollo/utils/file';
import { Popover } from 'erxes-ui/components/popover';
import { ACCOUNT_LINKS } from '@/modules/auth/components/AccountAside';
import { NotificationBell } from '@/modules/notifications/components/NotificationBell';
import { useSession } from '@/modules/auth/components/SessionProvider';
import { Avatar } from '@/modules/ui/components/Avatar';
import { Icon, type IconName } from '@/modules/ui/components/Icon';
import { useT } from '@/modules/i18n/components/LocaleProvider';
import { cn } from '@/modules/ui/lib/cn';
import { initialOf } from '@/modules/ui/lib/initial';
import { SidebarSearch } from './SidebarSearch';

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
        {initialOf(wordmark || title, 'e')}
      </span>
    )}
    <span className="min-w-0 truncate text-sm font-semibold text-white">
      {wordmark || title}
    </span>
  </Link>
);

const Collapse = ({
  open,
  children,
}: {
  open: boolean;
  children: ReactNode;
}) => (
  <div
    inert={!open}
    className={cn(
      'grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none',
      open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
    )}
  >
    <div className="min-h-0 overflow-hidden">{children}</div>
  </div>
);

const Leaf = ({
  href,
  label,
  count,
  pathname,
  onNavigate,
  muted = false,
  className,
}: {
  href: string;
  label: string;
  count?: number;
  pathname: string;
  onNavigate?: (event: MouseEvent<HTMLAnchorElement>) => void;
  muted?: boolean;
  className?: string;
}) => {
  const active = pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-w-0 items-baseline gap-2 rounded-lg px-2.5 py-1.5 transition-colors duration-100',
        active
          ? 'bg-shell-soft text-white'
          : muted
            ? 'text-white/50 hover:bg-shell-soft/70 hover:text-white'
            : 'text-white/75 hover:bg-shell-soft/70 hover:text-white',
        className,
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

const ChevronToggle = ({
  expanded,
  label,
  onToggle,
}: {
  expanded: boolean;
  label: string;
  onToggle: () => void;
}) => {
  const t = useT();

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-label={t(expanded ? 'nav.collapse' : 'nav.expand', { label })}
      className="absolute right-1 flex size-7 items-center justify-center rounded-md text-white/35 transition-colors duration-100 hover:bg-white/10 hover:text-white"
    >
      <Icon
        name="chevronRight"
        size={14}
        className={cn(
          'transition-transform duration-200 ease-out motion-reduce:transition-none',
          expanded && 'rotate-90',
        )}
      />
    </button>
  );
};

const GroupTree = ({
  group,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  onNavigate?: () => void;
}) => {
  const current =
    group.items.find(
      (entry) =>
        entry.href === pathname ||
        entry.children?.some((child) => child.href === pathname),
    )?.href ?? '';
  const [toggled, setToggled] = useState<{
    current: string;
    open: Record<string, boolean>;
  }>({ current, open: {} });

  let open = toggled.open;

  if (toggled.current !== current) {
    open = Object.fromEntries(
      Object.entries(toggled.open).filter(([href]) => href !== current),
    );
    setToggled({ current, open });
  }

  const setOpen = (href: string, next: boolean) =>
    setToggled((state) => ({
      ...state,
      open: { ...state.open, [href]: next },
    }));

  if (!group.items.length) {
    return (
      <p className="ml-4.5 mt-0.5 border-l border-shell-line py-1.5 pl-4.5 text-[12px] leading-relaxed text-white/35">
        {group.emptyLabel}
      </p>
    );
  }

  return (
    <ul className="ml-4.5 mt-0.5 flex flex-col gap-0.5 border-l border-shell-line pl-2">
      {group.items.map((entry) => {
        if (!entry.children?.length) {
          return (
            <li key={entry.href}>
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

        const expanded = open[entry.href] ?? entry.href === current;

        return (
          <li key={entry.href}>
            <div className="relative flex items-center">
              <Leaf
                href={entry.href}
                label={entry.label}
                count={entry.count}
                pathname={pathname}
                className="flex-1 pr-9"
                onNavigate={(event) => {
                  if (pathname === entry.href) {
                    event.preventDefault();
                    setOpen(entry.href, !expanded);

                    return;
                  }

                  onNavigate?.();
                }}
              />
              <ChevronToggle
                expanded={expanded}
                label={entry.label}
                onToggle={() => setOpen(entry.href, !expanded)}
              />
            </div>

            <Collapse open={expanded}>
              <ul className="ml-2.5 mt-0.5 flex flex-col gap-0.5 border-l border-shell-line pl-2.5">
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
            </Collapse>
          </li>
        );
      })}
    </ul>
  );
};

const RootList = ({
  links,
  groups,
  pathname,
  onNavigate,
}: {
  links: NavLink[];
  groups: NavGroup[];
  pathname: string;
  onNavigate?: () => void;
}) => {
  const section =
    groups.find((group) => linkActive(group.href, pathname))?.key ?? '';
  const [toggled, setToggled] = useState<{
    section: string;
    open: Record<string, boolean>;
  }>({ section, open: {} });

  let open = toggled.open;

  if (toggled.section !== section) {
    open = Object.fromEntries(
      Object.entries(toggled.open).filter(([key]) => key !== section),
    );
    setToggled({ section, open });
  }

  const setOpen = (key: string, next: boolean) =>
    setToggled((current) => ({
      ...current,
      open: { ...current.open, [key]: next },
    }));

  return (
    <ul className="flex flex-col gap-0.5">
      {links.map((link) => {
        const active = linkActive(link.href, pathname);
        const group = groups.find((item) => item.href === link.href);
        const expanded = group
          ? (open[group.key] ?? group.key === section)
          : false;

        return (
          <li key={link.href}>
            <div className="relative flex items-center">
              <Link
                href={link.href}
                onClick={(event) => {
                  if (group && pathname === link.href) {
                    event.preventDefault();
                    setOpen(group.key, !expanded);

                    return;
                  }

                  onNavigate?.();
                }}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium transition-colors duration-100',
                  group && 'pr-10',
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
                <Icon name={link.icon} size={16} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate">{link.label}</span>
              </Link>

              {group ? (
                <ChevronToggle
                  expanded={expanded}
                  label={link.label}
                  onToggle={() => setOpen(group.key, !expanded)}
                />
              ) : null}
            </div>

            {group ? (
              <Collapse open={expanded}>
                <GroupTree
                  group={group}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              </Collapse>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};

const AccountBlock = ({ onNavigate }: { onNavigate?: () => void }) => {
  const t = useT();
  const { user, ready, signOut } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

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
          {t('nav.trackTitle')}
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">
          {t('nav.trackText')}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <Link
            href="/sign-in"
            onClick={onNavigate}
            className="flex h-8 flex-1 items-center justify-center rounded-lg bg-white text-[12px] font-semibold text-shell outline-none transition-[background-color,transform] duration-300 ease-out-soft hover:bg-white/90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/60"
          >
            {t('auth.signIn')}
          </Link>
          <Link
            href="/sign-up"
            onClick={onNavigate}
            className="flex h-8 items-center justify-center rounded-lg px-3 text-[12px] font-medium text-white/55 outline-none transition-colors duration-300 ease-out-soft hover:bg-white/10 hover:text-white focus-visible:bg-white/10"
          >
            {t('auth.signUp')}
          </Link>
        </div>
      </div>
    );
  }

  const avatar = storedFileUrl(user.avatar ?? null);

  const navigate = () => {
    setMenuOpen(false);
    onNavigate?.();
  };

  return (
    <div className="flex items-center gap-1 rounded-xl bg-shell-soft p-1">
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <Popover.Trigger className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg p-1.5 text-left outline-none transition-[background-color,transform] duration-200 ease-out-soft hover:bg-white/5 active:scale-[0.98] focus-visible:bg-white/5 data-[state=open]:bg-white/5">
          <Avatar name={user.name} src={avatar} size={30} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium leading-tight text-white">
              {user.name}
            </span>
            <span className="mt-0.5 block truncate text-[11px] leading-tight text-white/45">
              {user.email}
            </span>
          </span>
          <Icon
            name="chevronDown"
            size={14}
            className={cn(
              'shrink-0 text-white/40 transition-transform duration-200',
              menuOpen && 'rotate-180',
            )}
          />
        </Popover.Trigger>

        <Popover.Content
          side="top"
          align="start"
          sideOffset={10}
          className="w-60 rounded-xl border border-line p-1.5 shadow-shell-hover"
        >
          <div className="flex items-center gap-3 px-2.5 pb-3 pt-2">
            <Avatar name={user.name} src={avatar} size={36} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink">
                {user.name}
              </span>
              <span className="block truncate text-[12px] text-muted-foreground">
                {user.email}
              </span>
            </span>
          </div>

          <ul className="border-t border-line-soft pt-1.5">
            {ACCOUNT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={navigate}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-ink-soft outline-none transition-[background-color,color,transform] duration-200 ease-out-soft active:scale-[0.98] hover:bg-subtle hover:text-ink focus-visible:bg-subtle"
                >
                  <Icon
                    name={link.icon}
                    size={16}
                    className="shrink-0 text-muted-foreground"
                  />
                  {t(link.labelKey)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-1.5 border-t border-line-soft pt-1.5">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                signOut();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-danger outline-none transition-[background-color,transform] duration-200 ease-out-soft active:scale-[0.98] hover:bg-danger-soft focus-visible:bg-danger-soft"
            >
              <Icon name="logout" size={16} className="shrink-0" />
              {t('auth.signOut')}
            </button>
          </div>
        </Popover.Content>
      </Popover>

      <NotificationBell ringClass="ring-shell-soft" />
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
  const t = useT();

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
        <SidebarSearch onNavigate={close} />
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <nav aria-label={t('nav.portal')} className="text-[13px]">
          <RootList
            links={links}
            groups={groups}
            pathname={pathname}
            onNavigate={close}
          />
        </nav>
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
            aria-label={t('common.search')}
            className="flex size-9 items-center justify-center rounded-lg text-white/60 transition-colors duration-150 hover:bg-shell-soft hover:text-white"
          >
            <Icon name="search" size={18} />
          </Link>
          <button
            type="button"
            aria-label={t('nav.menu')}
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
            aria-label={t('nav.closeOverlay')}
            onClick={close}
            className="animate-in fade-in absolute inset-0 bg-shell/70 backdrop-blur-sm duration-200"
          />
          <div className="animate-in slide-in-from-left absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-shell-line bg-shell duration-200">
            <button
              type="button"
              aria-label={t('nav.closeMenu')}
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
