'use client';

import { toast } from 'erxes-ui/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ComponentProps, MouseEvent } from 'react';
import { withNext } from '../utils/redirect';
import { useSession } from './SessionProvider';

type SessionLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
  reason: string;
};

/**
 * A link into a route that `RequireSession` guards. The session already lives
 * in this browser, so a signed-out visitor is turned around on the click
 * itself — waiting for the guarded route to be fetched and rendered first only
 * to bounce off it leaves them staring at a loading screen for nothing.
 */
export const SessionLink = ({
  href,
  reason,
  onClick,
  ...props
}: SessionLinkProps) => {
  const router = useRouter();
  const { user, ready } = useSession();
  const blocked = ready && !user;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    /* A modified click belongs to the browser: it opens a tab of its own. */
    if (
      !blocked ||
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    toast({
      variant: 'warning',
      title: 'Нэвтрэх шаардлагатай',
      description: reason,
    });

    router.push(withNext('/sign-in', href));
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      /* Nothing to warm up for a visitor who cannot open the route yet. */
      prefetch={blocked ? false : undefined}
      {...props}
    />
  );
};
