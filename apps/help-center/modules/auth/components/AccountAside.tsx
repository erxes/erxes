'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { storedFileUrl } from '@/modules/apollo/utils/file';
import { Avatar } from '@/modules/ui/components/Avatar';
import { Badge } from '@/modules/ui/components/Badge';
import { Icon, type IconName } from '@/modules/ui/components/Icon';
import { useT } from '@/modules/i18n/components/LocaleProvider';
import type { MessageKey } from '@/modules/i18n/translate';
import { cn } from '@/modules/ui/lib/cn';
import { useSession } from './SessionProvider';

export const accountShell = 'overflow-hidden rounded-2xl bg-white shadow-shell';

export const accountPanelEnter =
  'animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 ease-out-soft';

export const accountColumns =
  'grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] xl:gap-8';

export const AccountCover = () => (
  <div aria-hidden="true" className="relative h-20 overflow-hidden bg-shell">
    <span className="animate-aurora absolute -left-10 -top-14 size-44 rounded-full bg-brand/55 blur-[56px]" />
    <span className="animate-aurora-slow absolute -right-6 top-4 size-36 rounded-full bg-brand/30 blur-[56px]" />
    <span className="hero-grid absolute inset-0" />
    <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand/70 to-transparent" />
  </div>
);

export const ACCOUNT_LINKS: {
  href: string;
  icon: IconName;
  labelKey: MessageKey;
}[] = [
  { href: '/account', icon: 'user', labelKey: 'account.profile' },
  {
    href: '/account/notifications',
    icon: 'bell',
    labelKey: 'account.notifications',
  },
  { href: '/account/settings', icon: 'settings', labelKey: 'account.settings' },
  { href: '/tickets', icon: 'ticket', labelKey: 'tickets.mine' },
  { href: '/tickets/new', icon: 'plus', labelKey: 'tickets.submit' },
];

const row =
  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium outline-none transition-[background-color,color,transform] duration-300 ease-out-soft active:scale-[0.98]';

const chip =
  'flex size-7 shrink-0 items-center justify-center rounded-md transition-colors duration-300 ease-out-soft';

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
            : 'bg-subtle text-ink-soft',
        )}
      >
        <Icon name={icon} size={15} />
      </span>
      <span className="min-w-0 truncate">{label}</span>
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
  const t = useT();
  const pathname = usePathname();
  const { signOut } = useSession();

  return (
    <aside className={cn(accountShell, 'flex flex-col')}>
      <AccountCover />

      <div className="-mt-10 px-5 pb-5 text-center">
        <span className="relative mx-auto block w-fit">
          <Avatar
            name={name}
            src={storedFileUrl(avatar ?? null)}
            size={76}
            className="ring-[3px] ring-white"
          />

          {onPickAvatar ? (
            <button
              type="button"
              disabled={busy}
              onClick={onPickAvatar}
              aria-label={t('account.changePicture')}
              className="absolute -bottom-0.5 -right-0.5 flex size-8 items-center justify-center rounded-full border-2 border-white bg-brand text-white outline-none transition-[background-color,transform] duration-300 ease-out-soft hover:bg-brand-strong focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon
                name={uploading ? 'clock' : 'camera'}
                size={14}
                className={uploading ? 'animate-spin' : undefined}
              />
            </button>
          ) : null}
        </span>

        <p className="mt-3 truncate text-[15px] font-semibold text-ink">
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
            {isVerified ? t('account.verified') : t('account.notVerified')}
          </Badge>

          {avatar && onRemoveAvatar ? (
            <button
              type="button"
              disabled={busy}
              onClick={onRemoveAvatar}
              className="rounded-full px-2.5 py-1 text-xs font-semibold text-muted-foreground outline-none transition-colors duration-300 ease-out-soft hover:bg-danger-soft hover:text-danger focus-visible:bg-danger-soft focus-visible:text-danger disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('account.removePicture')}
            </button>
          ) : null}
        </div>
      </div>

      <nav
        aria-label={t('account.nav')}
        className="flex-1 border-t border-line p-2"
      >
        {ACCOUNT_LINKS.map((link) => (
          <MenuRow
            key={link.href}
            icon={link.icon}
            label={t(link.labelKey)}
            href={link.href}
            active={pathname === link.href}
          />
        ))}
      </nav>

      <div className="border-t border-line p-2">
        <MenuRow
          icon="logout"
          label={t('auth.signOut')}
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
