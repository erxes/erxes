import type { ReactNode } from 'react';
import { Badge, Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { NotificationTabValue } from '@/notification/types/myInbox';

interface NotificationTabsProps {
  value: NotificationTabValue;
  onValueChange: (value: NotificationTabValue) => void;
  unreadCount: number | undefined;
  seenCount: number | undefined;
  children: ReactNode;
}

export const NotificationTabs = ({
  value,
  onValueChange,
  unreadCount,
  seenCount,
  children,
}: NotificationTabsProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const total =
    unreadCount === undefined || seenCount === undefined
      ? undefined
      : unreadCount + seenCount;

  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        if (next === 'unread' || next === 'read') onValueChange(next);
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="shrink-0 px-3 pt-2">
        <p className="mb-1 text-xs text-muted-foreground" aria-live="polite">
          {t('total-notifications', {
            count: total,
            defaultValue:
              total === undefined
                ? 'Total notifications: …'
                : 'Total notifications: {{count}}',
          })}
        </p>
        <Tabs.List
          className="flex w-full"
          aria-label={t('notifications', 'Notifications')}
        >
          <Tabs.Trigger value="unread" className="flex-1 gap-2">
            {t('unread', 'Unread')}
            <Badge variant="secondary" className="tabular-nums">
              {unreadCount ?? '…'}
            </Badge>
          </Tabs.Trigger>
          <Tabs.Trigger value="read" className="flex-1 gap-2">
            {t('seen', 'Seen')}
            <Badge variant="secondary" className="tabular-nums">
              {seenCount ?? '…'}
            </Badge>
          </Tabs.Trigger>
        </Tabs.List>
      </div>
      <Tabs.Content value={value} className="relative min-h-0 flex-1">
        {children}
      </Tabs.Content>
    </Tabs>
  );
};
