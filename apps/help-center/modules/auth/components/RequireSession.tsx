'use client';

import { toast } from 'erxes-ui/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { withNext } from '../utils/redirect';
import { useSession } from './SessionProvider';

const Skeleton = () => (
  <Card className="space-y-3 p-6">
    <span className="sr-only">Loading…</span>
    <span className="block h-4 w-40 animate-pulse rounded bg-subtle" />
    <span className="block h-4 w-3/4 animate-pulse rounded bg-subtle" />
    <span className="block h-4 w-2/3 animate-pulse rounded bg-subtle" />
  </Card>
);

export const RequireSession = ({
  reason = 'Sign in to your account to view this section.',
  children,
}: {
  reason?: string;
  children: ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready } = useSession();
  const target = withNext('/sign-in', pathname);

  const sent = useRef(false);

  useEffect(() => {
    if (!ready || user || sent.current) {
      return;
    }

    sent.current = true;

    toast({
      variant: 'warning',
      title: 'Sign-in required',
      description: reason,
    });

    router.replace(target);
  }, [ready, user, reason, router, target]);

  if (!ready) {
    return <Skeleton />;
  }

  if (!user) {
    return (
      <EmptyState
        icon="lock"
        title="Sign-in required"
        description={`${reason} Taking you to the sign-in page…`}
        action={
          <ButtonLink href={target} size="sm">
            Sign in
          </ButtonLink>
        }
      />
    );
  }

  return <>{children}</>;
};
