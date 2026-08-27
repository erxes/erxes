'use client';

import { useRouter } from 'next/navigation';
import { Avatar } from '@/modules/ui/components/Avatar';
import { Button, ButtonLink } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { Icon } from '@/modules/ui/components/Icon';
import { useSession } from './SessionProvider';

export const AccountPanel = () => {
  const router = useRouter();
  const { user, ready, signOut } = useSession();

  if (!ready) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <span className="size-14 animate-pulse rounded-full bg-subtle" />
          <span className="space-y-2">
            <span className="block h-4 w-40 animate-pulse rounded bg-subtle" />
            <span className="block h-3.5 w-56 animate-pulse rounded bg-subtle" />
          </span>
        </div>
      </Card>
    );
  }

  if (!user) {
    return (
      <EmptyState
        icon="user"
        title="Та нэвтрээгүй байна"
        description="Хувийн мэдээлэл болон хүсэлтийн түүхээ харахын тулд нэвтэрнэ үү."
        action={
          <ButtonLink href="/sign-in" size="sm">
            Нэвтрэх
          </ButtonLink>
        }
      />
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={user.name} size={56} />
        <div className="min-w-0">
          <p className="text-lg font-semibold text-ink">{user.name}</p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-3 border-t border-line pt-6">
        <ButtonLink href="/tickets" size="sm" variant="secondary">
          <Icon name="ticket" size={16} />
          Миний хүсэлтүүд
        </ButtonLink>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            signOut();
            router.push('/');
          }}
        >
          <Icon name="logout" size={16} />
          Гарах
        </Button>
      </div>
    </Card>
  );
};
