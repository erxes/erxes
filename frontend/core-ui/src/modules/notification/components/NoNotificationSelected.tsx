import { useUnreadNotificationCount } from '@/notification/hooks/useUnreadNotificationCount';
import { IconInbox } from '@tabler/icons-react';
import { Kbd } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NoNotificationSelected = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { unreadNotificationsCount } = useUnreadNotificationCount();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-accent text-muted-foreground">
        <IconInbox className="size-7" stroke={1.5} />
      </span>
      <div>
        <p className="text-base font-medium">
          {unreadNotificationsCount > 0
            ? t('unread-count', { count: unreadNotificationsCount })
            : t('nothing-new')}
        </p>
        <p className="text-sm text-muted-foreground">
          {t('pick-notification')}
        </p>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Kbd>J</Kbd>
        <Kbd>K</Kbd>
        {t('to-move')} ·<Kbd>⌘ ⌫</Kbd>
        {t('to-mark-read-hide')}
      </p>
    </div>
  );
};
