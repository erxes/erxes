import { useUnreadNotificationCount } from '@/notification/hooks/useUnreadNotificationCount';
import { IconInbox } from '@tabler/icons-react';
import { Kbd } from 'erxes-ui';

export const NoNotificationSelected = () => {
  const { unreadNotificationsCount } = useUnreadNotificationCount();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-accent text-muted-foreground">
        <IconInbox className="size-7" stroke={1.5} />
      </span>
      <div>
        <p className="text-base font-medium">
          {unreadNotificationsCount > 0
            ? `${unreadNotificationsCount} unread`
            : 'Nothing new'}
        </p>
        <p className="text-sm text-muted-foreground">
          Pick a notification to see the deal, task or message behind it.
        </p>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Kbd>J</Kbd>
        <Kbd>K</Kbd>
        to move ·<Kbd>⌘ ⌫</Kbd>
        to mark read and hide
      </p>
    </div>
  );
};
