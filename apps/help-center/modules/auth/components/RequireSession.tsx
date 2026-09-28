'use client';

import { toast } from 'erxes-ui/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { useT } from '@/modules/i18n/components/LocaleProvider';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { withNext } from '../utils/redirect';
import { useSession } from './SessionProvider';

const Skeleton = ({ label }: { label: string }) => (
  <Card className="space-y-3 p-6">
    <span className="sr-only">{label}</span>
    <span className="block h-4 w-40 animate-pulse rounded bg-subtle" />
    <span className="block h-4 w-3/4 animate-pulse rounded bg-subtle" />
    <span className="block h-4 w-2/3 animate-pulse rounded bg-subtle" />
  </Card>
);

export const RequireSession = ({
  reason: reasonText,
  children,
}: {
  reason?: string;
  children: ReactNode;
}) => {
  const router = useRouter();
  const t = useT();
  const reason = reasonText ?? t('auth.requireDefault');
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
      title: t('auth.signInRequired'),
      description: reason,
    });

    router.replace(target);
  }, [ready, user, reason, router, target, t]);

  if (!ready) {
    return <Skeleton label={t('common.loading')} />;
  }

  if (!user) {
    return (
      <EmptyState
        icon="lock"
        title={t('auth.signInRequired')}
        description={t('auth.redirecting', { reason })}
        action={
          <ButtonLink href={target} size="sm">
            {t('auth.signIn')}
          </ButtonLink>
        }
      />
    );
  }

  return <>{children}</>;
};
