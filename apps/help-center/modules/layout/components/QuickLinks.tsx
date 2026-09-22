import Link from 'next/link';
import type { ReactNode } from 'react';
import { SessionLink } from '@/modules/auth/components/SessionLink';
import { buttonClass } from '@/modules/ui/components/Button';
import { Icon, type IconName } from '@/modules/ui/components/Icon';

export type QuickLink = {
  href: string;
  icon: IconName;
  title: string;
  sessionReason?: string;
  primary?: boolean;
};

const Action = ({ link }: { link: QuickLink }): ReactNode => {
  const className = buttonClass({
    variant: link.primary ? 'onHero' : 'onHeroSoft',
    size: 'md',
    className: 'group rounded-xl',
  });

  const content = (
    <>
      <Icon
        name={link.icon}
        size={16}
        className="shrink-0 opacity-60 transition-opacity duration-200 group-hover:opacity-100"
      />
      {link.title}
    </>
  );

  return link.sessionReason ? (
    <SessionLink
      href={link.href}
      reason={link.sessionReason}
      className={className}
    >
      {content}
    </SessionLink>
  ) : (
    <Link href={link.href} className={className}>
      {content}
    </Link>
  );
};

export const QuickLinks = ({ links }: { links: QuickLink[] }) => {
  if (!links.length) {
    return null;
  }

  return (
    <ul className="flex flex-wrap items-center gap-2.5">
      {links.map((link) => (
        <li key={link.href}>
          <Action link={link} />
        </li>
      ))}
    </ul>
  );
};
