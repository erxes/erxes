'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from '@/modules/auth/components/SessionProvider';
import { Avatar } from '@/modules/ui/components/Avatar';
import { Container } from '@/modules/ui/components/Container';
import { Icon } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import { navItems } from '../constants/site';

const Wordmark = ({ title }: { title: string }) => (
  <Link href="/" className="flex items-center gap-3.5">
    <span className="text-2xl font-semibold lowercase tracking-tight">
      er<span className="text-white/70">x</span>es
    </span>
    <span aria-hidden="true" className="hidden h-6 w-px bg-white/30 sm:block" />
    <span className="hidden text-sm font-normal text-white/85 sm:block">
      {title}
    </span>
  </Link>
);

export const SiteHeader = ({ title }: { title: string }) => {
  const pathname = usePathname();
  const { user, ready, signOut } = useSession();
  const [menu, setMenu] = useState({ open: false, path: pathname });
  const menuRef = useRef<HTMLDivElement>(null);

  if (menu.path !== pathname) {
    setMenu({ open: false, path: pathname });
  }

  const menuOpen = menu.open;
  const closeMenu = useCallback(
    () => setMenu((current) => ({ ...current, open: false })),
    [],
  );

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [menuOpen, closeMenu]);

  return (
    <header className="relative z-20 bg-hero text-white">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Wordmark title={title} />

        <div className="flex items-center gap-2 sm:gap-3">
          {!ready ? (
            <span
              aria-hidden="true"
              className="h-9 w-32 animate-pulse rounded-full bg-white/15"
            />
          ) : user ? (
            <>
              <Link
                href="/announcements"
                aria-label="Мэдээ мэдээлэл"
                className="flex size-10 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon name="bell" size={20} />
              </Link>
              <Link
                href="/account"
                aria-label={`${user.name} — Миний хуудас`}
                title={user.name}
              >
                <Avatar
                  name={user.name}
                  size={36}
                  className="bg-white/20 text-white"
                />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="hidden h-10 items-center whitespace-nowrap rounded-lg border border-white/40 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:inline-flex"
              >
                Sign up
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex h-10 items-center whitespace-nowrap rounded-lg bg-white px-4 text-sm font-semibold text-hero transition-colors hover:bg-white/90 sm:px-5"
              >
                Sign in
              </Link>
            </>
          )}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Цэс"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenu({ open: !menuOpen, path: pathname })}
              className="flex size-10 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-12 w-72 overflow-hidden rounded-xl border border-line bg-white text-ink shadow-[0_16px_40px_rgba(23,22,42,0.18)]"
              >
                <nav className="p-2">
                  {navItems.map((item) => {
                    const active =
                      item.href === '/'
                        ? pathname === '/'
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        className={cn(
                          'flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-subtle',
                          active && 'bg-brand-soft',
                        )}
                      >
                        <span
                          className={cn(
                            'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-subtle text-muted-foreground',
                            active && 'bg-white text-brand',
                          )}
                        >
                          <Icon name={item.icon} size={17} />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">
                            {item.label}
                          </span>
                          <span className="block text-[13px] text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t border-line p-2">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-3 py-2">
                        <Avatar name={user.name} size={34} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {user.name}
                          </span>
                          <span className="block truncate text-[13px] text-muted-foreground">
                            {user.email}
                          </span>
                        </span>
                      </div>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          signOut();
                          closeMenu();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft"
                      >
                        <Icon name="logout" size={17} />
                        Гарах
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/sign-in"
                      role="menuitem"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-soft"
                    >
                      <Icon name="user" size={17} />
                      Нэвтрэх
                    </Link>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </header>
  );
};
