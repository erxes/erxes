import Link from 'next/link';
import type { ReactNode } from 'react';
import { SessionLink } from '@/modules/auth/components/SessionLink';
import { Container } from '@/modules/ui/components/Container';
import { Icon, type IconName } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';

export type QuickLink = {
  href: string;
  icon: IconName;
  title: string;
  description: string;
  sessionReason?: string;
};

const COLUMNS: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

const tileClass =
  'group flex h-full items-start gap-3 rounded-xl border border-line bg-white p-4 outline-none transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-card focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2';

const TileContent = ({ link }: { link: QuickLink }) => (
  <>
    <Icon
      name={link.icon}
      size={18}
      className="mt-0.5 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-brand"
    />
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-semibold text-ink">
        {link.title}
      </span>
      <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
        {link.description}
      </span>
    </span>
  </>
);

const Tile = ({ link }: { link: QuickLink }): ReactNode =>
  link.sessionReason ? (
    <SessionLink
      href={link.href}
      reason={link.sessionReason}
      className={tileClass}
    >
      <TileContent link={link} />
    </SessionLink>
  ) : (
    <Link href={link.href} className={tileClass}>
      <TileContent link={link} />
    </Link>
  );

export const QuickLinks = ({ links }: { links: QuickLink[] }) => {
  if (!links.length) {
    return null;
  }

  return (
    <Container className="relative z-10 -mt-7">
      <ul
        className={cn(
          'grid gap-3',
          COLUMNS[Math.min(links.length, 4)] ?? COLUMNS[4],
        )}
      >
        {links.map((link, index) => (
          <li
            key={link.href}
            className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-500"
            style={{ animationDelay: `${120 + index * 60}ms` }}
          >
            <Tile link={link} />
          </li>
        ))}
      </ul>
    </Container>
  );
};
