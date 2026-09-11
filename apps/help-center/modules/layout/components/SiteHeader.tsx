'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSession } from '@/modules/auth/components/SessionProvider';
import { Avatar } from '@/modules/ui/components/Avatar';
import { Container } from '@/modules/ui/components/Container';
import { Icon } from '@/modules/ui/components/Icon';
import type { SessionUser } from '@/modules/auth/utils/session';
import { cn } from '@/modules/ui/lib/cn';
import type { NavItem } from '../constants/site';
import { visibleNavItems } from '../utils/nav';

const isActive = (href: string, pathname: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href);

const useScrolled = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrolled;
};

const useDismissable = (open: boolean, close: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [open, close]);

  return ref;
};

const Wordmark = ({ title, logo }: { title: string; logo: string | null }) => (
  <Link
    href="/"
    className="group flex items-center gap-3.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/70"
  >
    {logo ? (
      <img
        src={logo}
        alt={title}
        className="h-9 w-auto max-w-44 object-contain transition-opacity duration-200 group-hover:opacity-90"
      />
    ) : (
      <>
        <span className="text-2xl font-semibold lowercase tracking-tight">
          er<span className="text-white/70">x</span>es
        </span>
        <span
          aria-hidden="true"
          className="hidden h-6 w-px bg-white/25 sm:block"
        />
        <span className="hidden text-sm font-normal text-white/80 sm:block">
          {title}
        </span>
      </>
    )}
  </Link>
);

const DesktopNav = ({
  items,
  pathname,
}: {
  items: NavItem[];
  pathname: string;
}) => (
  <nav
    aria-label="Main"
    className="hidden items-center gap-0.5 rounded-full bg-white/[0.07] p-1 ring-1 ring-inset ring-white/10 lg:flex"
  >
    {items.map((item) => {
      const active = isActive(item.href, pathname);

      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'relative flex h-9 items-center whitespace-nowrap rounded-full px-4 text-[13px] font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white/70',
            active
              ? 'bg-white text-hero shadow-[0_2px_10px_rgba(20,20,43,0.18)]'
              : 'text-white/75 hover:bg-white/10 hover:text-white',
          )}
        >
          {item.label}
        </Link>
      );
    })}
  </nav>
);

const MenuPanel = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      'animate-in fade-in slide-in-from-top-2 absolute right-0 top-[calc(100%+0.6rem)] z-50 overflow-hidden rounded-2xl border border-line bg-white text-ink shadow-[0_20px_50px_-12px_rgba(23,22,42,0.28)] duration-200',
      className,
    )}
  >
    {children}
  </div>
);

const UserCard = ({ name, email }: { name: string; email: string }) => (
  <div className="flex items-center gap-3 bg-subtle px-4 py-3.5">
    <Avatar name={name} size={38} />
    <span className="min-w-0">
      <span className="block truncate text-sm font-semibold">{name}</span>
      <span className="block truncate text-[13px] text-muted-foreground">
        {email}
      </span>
    </span>
  </div>
);

const SignOutButton = ({ onSignOut }: { onSignOut: () => void }) => (
  <button
    type="button"
    role="menuitem"
    onClick={onSignOut}
    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger outline-none transition-colors hover:bg-danger-soft focus-visible:bg-danger-soft"
  >
    <Icon name="logout" size={17} />
    Sign out
  </button>
);

const AccountMenu = ({
  user,
  signOut,
}: {
  user: SessionUser;
  signOut: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const ref = useDismissable(open, close);

  return (
    <div className="relative hidden lg:block" ref={ref}>
      <button
        type="button"
        aria-label={`${user.name} — My account`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex items-center gap-1 rounded-full p-0.5 outline-none ring-2 transition-[box-shadow,background-color] duration-200 focus-visible:ring-white',
          open
            ? 'bg-white/10 ring-white/60'
            : 'ring-transparent hover:bg-white/10',
        )}
      >
        <Avatar name={user.name} size={36} className="bg-white/20 text-white" />
        <Icon
          name="chevronDown"
          size={16}
          className={cn(
            'mr-1 text-white/70 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <MenuPanel className="w-64">
          <UserCard name={user.name} email={user.email} />
          <div className="border-t border-line p-2">
            <Link
              href="/account"
              role="menuitem"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors hover:bg-subtle focus-visible:bg-subtle"
            >
              <Icon name="user" size={17} className="text-muted-foreground" />
              My account
            </Link>
            <SignOutButton
              onSignOut={() => {
                signOut();
                close();
              }}
            />
          </div>
        </MenuPanel>
      ) : null}
    </div>
  );
};

const MobileMenu = ({
  items,
  pathname,
  user,
  signOut,
}: {
  items: NavItem[];
  pathname: string;
  user: SessionUser | null;
  signOut: () => void;
}) => {
  const [menu, setMenu] = useState({ open: false, path: pathname });

  if (menu.path !== pathname) {
    setMenu({ open: false, path: pathname });
  }

  const open = menu.open;
  const close = useCallback(
    () => setMenu((current) => ({ ...current, open: false })),
    [],
  );
  const ref = useDismissable(open, close);

  return (
    <div className="relative lg:hidden" ref={ref}>
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setMenu({ open: !open, path: pathname })}
        className={cn(
          'flex size-10 items-center justify-center rounded-xl outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white/70',
          open
            ? 'bg-white/15 text-white'
            : 'text-white/80 hover:bg-white/10 hover:text-white',
        )}
      >
        <Icon name={open ? 'close' : 'menu'} size={22} />
      </button>

      {open ? (
        <MenuPanel className="w-70">
          <nav className="p-2">
            {items.map((item) => {
              const active = isActive(item.href, pathname);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group flex items-start gap-3 rounded-xl px-3 py-2.5 outline-none transition-colors hover:bg-subtle focus-visible:bg-subtle',
                    active && 'bg-brand-soft hover:bg-brand-soft',
                  )}
                >
                  <span
                    className={cn(
                      'mt-px flex size-9 shrink-0 items-center justify-center rounded-xl bg-subtle text-muted-foreground transition-colors',
                      active
                        ? 'bg-brand text-white'
                        : 'group-hover:bg-white group-hover:text-brand',
                    )}
                  >
                    <Icon name={item.icon} size={17} />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        'block text-sm font-semibold',
                        active && 'text-brand',
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="block text-[13px] leading-snug text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {user ? (
            <>
              <UserCard name={user.name} email={user.email} />
              <div className="border-t border-line p-2">
                <Link
                  href="/account"
                  role="menuitem"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors hover:bg-subtle focus-visible:bg-subtle"
                >
                  <Icon
                    name="user"
                    size={17}
                    className="text-muted-foreground"
                  />
                  My account
                </Link>
                <SignOutButton
                  onSignOut={() => {
                    signOut();
                    close();
                  }}
                />
              </div>
            </>
          ) : (
            <div className="border-t border-line p-2">
              <Link
                href="/sign-in"
                role="menuitem"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand outline-none transition-colors hover:bg-brand-soft focus-visible:bg-brand-soft"
              >
                <Icon name="user" size={17} />
                Sign in
              </Link>
            </div>
          )}
        </MenuPanel>
      ) : null}
    </div>
  );
};

export const SiteHeader = ({
  title,
  logo,
  knowledgeBaseEnabled,
  knowledgeBaseLabel,
  ticketsEnabled,
  ticketLabel,
}: {
  title: string;
  logo: string | null;
  knowledgeBaseEnabled: boolean;
  knowledgeBaseLabel: string;
  ticketsEnabled: boolean;
  ticketLabel: string;
}) => {
  const pathname = usePathname();
  const items = visibleNavItems({
    knowledgeBaseEnabled,
    knowledgeBaseLabel,
    ticketsEnabled,
    ticketLabel,
  });
  const { user, ready, signOut } = useSession();
  const scrolled = useScrolled();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 text-white transition-[background-color,box-shadow,backdrop-filter] duration-300',
        scrolled
          ? 'bg-hero/85 shadow-[0_1px_0_rgba(255,255,255,0.08),0_8px_30px_-12px_rgba(20,20,43,0.5)] backdrop-blur-xl backdrop-saturate-150'
          : 'bg-hero',
      )}
    >
      <Container
        className={cn(
          'flex items-center justify-between gap-4 transition-[height] duration-300',
          scrolled ? 'h-16' : 'h-20',
        )}
      >
        <div className="flex min-w-0 items-center gap-6 xl:gap-9">
          <Wordmark title={title} logo={logo} />
          <DesktopNav items={items} pathname={pathname} />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {!ready ? (
            <span
              aria-hidden="true"
              className="h-9 w-28 animate-pulse rounded-full bg-white/15"
            />
          ) : user ? (
            <>
              <Link
                href="/announcements"
                aria-label="Announcements"
                className="flex size-10 items-center justify-center rounded-full text-white/80 outline-none transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <Icon name="bell" size={20} />
              </Link>
              <Link
                href="/account"
                aria-label={`${user.name} — My account`}
                title={user.name}
                className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/70 lg:hidden"
              >
                <Avatar
                  name={user.name}
                  size={36}
                  className="bg-white/20 text-white"
                />
              </Link>
              <AccountMenu user={user} signOut={signOut} />
            </>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="hidden h-10 items-center whitespace-nowrap rounded-full px-4 text-sm font-medium text-white/85 outline-none transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/70 sm:inline-flex"
              >
                Sign up
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex h-10 items-center whitespace-nowrap rounded-full bg-white px-5 text-sm font-semibold text-hero shadow-[0_2px_12px_rgba(20,20,43,0.18)] outline-none transition-[background-color,transform,box-shadow] duration-200 hover:shadow-[0_4px_18px_rgba(20,20,43,0.26)] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Sign in
              </Link>
            </>
          )}

          <MobileMenu
            items={items}
            pathname={pathname}
            user={user}
            signOut={signOut}
          />
        </div>
      </Container>
    </header>
  );
};
