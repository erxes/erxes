import { cn, Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export type NotificationTab = 'all' | 'unread';

/** All and Unread, with the unread count; tabs reach the line under them. */
export const NotificationTabs = ({
  value,
  onChange,
  unread,
  className,
}: {
  value: NotificationTab;
  onChange: (tab: NotificationTab) => void;
  unread: number;
  className?: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });

  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next === 'unread' ? 'unread' : 'all')}
      className={cn('flex', className)}
    >
      <Tabs.List variant="flush" className="min-h-9 self-stretch">
        <Tabs.Trigger value="all">{t('all', 'All')}</Tabs.Trigger>
        <Tabs.Trigger value="unread">
          {t('unread', 'Unread')}
          {unread > 0 && <span className="ml-1 text-xs text-muted-foreground">{unread}</span>}
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs>
  );
};
