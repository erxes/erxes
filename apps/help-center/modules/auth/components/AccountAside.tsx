'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { storedFileUrl } from '@/modules/apollo/utils/file';
import { Avatar } from '@/modules/ui/components/Avatar';
import { Badge } from '@/modules/ui/components/Badge';
import { Icon, type IconName } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import { useSession } from './SessionProvider';

export const accountShell = 'overflow-hidden rounded-2xl bg-white shadow-shell';

export const accountColumns =
  'grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-start';

export const AccountCover = () => (
  <div aria-hidden="true" className="relative h-24 overflow-hidden bg-shell">
    <span className="animate-aurora absolute -left-10 -top-14 size-44 rounded-full bg-brand/55 blur-[56px]" />
    <span className="animate-aurora-slow absolute -right-6 top-4 size-36 rounded-full bg-brand/30 blur-[56px]" />
    <span className="hero-grid absolute inset-0" />
    <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent" />
  </div>
);

const LINKS: { href: string; icon: IconName; label: string }[] = [
  { href: '/account', icon: 'user', label: 'My profile' },
  { href: '/account/notifications', icon: 'bell', label: 'Notifications' },
  { href: '/account/settings', icon: 'settings', label: 'Settings' },
  { href: '/tickets', icon: 'ticket', label: 'My tickets' },
  { href: '/tickets/new', icon: 'plus', label: 'Submit a ticket' },
];

const row =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium outline-none transition-colors duration-300 ease-out-soft';

const chip =
  'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ease-out-soft';

const MenuRow = ({
  icon,
  label,
  href,
  onClick,
  active = false,
  danger = false,
}: {
  icon: IconName;
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
}) => {
  const content: ReactNode = (
    <>
      <span
        className={cn(
          chip,
          danger
            ? 'bg-danger-soft text-danger'
            : active
            ? 'bg-brand text-white'
            : 'bg-brand-soft text-brand',
        )}
      >
        <Icon name={icon} size={16} />
      </span>
      {label}
      <Icon
        name="chevronRight"
        size={15}
        className={cn(
          'ml-auto',
          active ? 'text-brand' : 'text-muted-foreground/70',
        )}
      />
    </>
  );

  const tone = active
    ? 'bg-brand-soft text-brand'
    : cn(
        'text-ink-soft hover:bg-subtle hover:text-ink focus-visible:bg-subtle focus-visible:text-ink',
        danger && 'hover:text-danger focus-visible:text-danger',
      );

  if (href) {
    return (
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(row, tone)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(row, tone)}>
      {content}
    </button>
  );
};

export const AccountAside = ({
  name,
  email,
  isVerified = false,
  avatar,
  uploading = false,
  busy = false,
  onPickAvatar,
  onRemoveAvatar,
}: {
  name: string;
  email: string;
  isVerified?: boolean;
  avatar?: string | null;
  uploading?: boolean;
  busy?: boolean;
  onPickAvatar?: () => void;
  onRemoveAvatar?: () => void;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useSession();

  return (
    <aside className={accountShell}>
      <AccountCover />

      <div className="-mt-12 px-6 pb-6 text-center">
        <span className="relative mx-auto block w-fit">
          <Avatar
            name={name}
            src={storedFileUrl(avatar ?? null)}
            size={88}
            className="ring-[3px] ring-white"
          />

          {onPickAvatar ? (
            <button
              type="button"
              disabled={busy}
              onClick={onPickAvatar}
              aria-label="Change your picture"
              className="absolute -bottom-0.5 -right-0.5 flex size-9 items-center justify-center rounded-full border-2 border-white bg-brand text-white outline-none transition-[background-color,transform] duration-300 ease-out-soft hover:bg-brand-strong focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon
                name={uploading ? 'clock' : 'camera'}
                size={15}
                className={uploading ? 'animate-spin' : undefined}
              />
            </button>
          ) : null}
        </span>

        <p className="mt-4 truncate text-[15px] font-semibold text-ink">
          {name}
        </p>
        <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
          {email}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Badge tone={isVerified ? 'success' : 'warning'}>
            <Icon
              name={isVerified ? 'check' : 'alert'}
              size={12}
              className="mr-1"
            />
            {isVerified ? 'Verified' : 'Not verified'}
          </Badge>

          {avatar && onRemoveAvatar ? (
            <button
              type="button"
              disabled={busy}
              onClick={onRemoveAvatar}
              className="rounded-full px-2.5 py-1 text-xs font-semibold text-muted-foreground outline-none transition-colors duration-300 ease-out-soft hover:bg-danger-soft hover:text-danger focus-visible:bg-danger-soft focus-visible:text-danger disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove picture
            </button>
          ) : null}
        </div>
      </div>

      <div className="border-t border-line p-2">
        {LINKS.map((link) => (
          <MenuRow
            key={link.href}
            icon={link.icon}
            label={link.label}
            href={link.href}
            active={pathname === link.href}
          />
        ))}

        <MenuRow
          icon="logout"
          label="Sign out"
          danger
          onClick={() => {
            signOut();
            router.push('/');
          }}
        />
      </div>
    </aside>
  );
};
