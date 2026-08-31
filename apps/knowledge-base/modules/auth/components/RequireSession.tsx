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
    <span className="sr-only">Ачаалж байна…</span>
    <span className="block h-4 w-40 animate-pulse rounded bg-subtle" />
    <span className="block h-4 w-3/4 animate-pulse rounded bg-subtle" />
    <span className="block h-4 w-2/3 animate-pulse rounded bg-subtle" />
  </Card>
);

/**
 * Guards content that only a signed-in portal user may reach. The session is
 * held in the browser, so the check cannot run on the server: nothing is handed
 * over until it is known, and a visitor without one is told why before being
 * sent to sign in with this route remembered.
 */
export const RequireSession = ({
  reason = 'Энэ хэсгийг үзэхийн тулд эхлээд бүртгэлдээ нэвтэрнэ үү.',
  children,
}: {
  reason?: string;
  children: ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready } = useSession();
  const target = withNext('/sign-in', pathname);

  /* One redirect per mount, so a re-render never repeats the toast. */
  const sent = useRef(false);

  useEffect(() => {
    if (!ready || user || sent.current) {
      return;
    }

    sent.current = true;

    toast({
      variant: 'warning',
      title: 'Нэвтрэх шаардлагатай',
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
        title="Нэвтрэх шаардлагатай"
        description={`${reason} Нэвтрэх хуудас руу шилжүүлж байна…`}
        action={
          <ButtonLink href={target} size="sm">
            Нэвтрэх
          </ButtonLink>
        }
      />
    );
  }

  return <>{children}</>;
};
