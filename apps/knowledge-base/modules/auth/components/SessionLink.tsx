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
      title: 'Sign-in required',
      description: reason,
    });

    router.push(withNext('/sign-in', href));
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      prefetch={blocked ? false : undefined}
      {...props}
    />
  );
};
