import { cn, Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export type NotificationTab = 'all' | 'unread';

/** All and Unread, with the unread count; tabs reach the line under them. */
export const NotificationTabs = ({
  value,
  onChange,
  unread,
  className,
  listClassName,
}: {
  value: NotificationTab;
  onChange: (tab: NotificationTab) => void;
  unread: number;
  className?: string;
  listClassName?: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });

  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next === 'unread' ? 'unread' : 'all')}
      className={cn('flex', className)}
    >
      <Tabs.List className={cn('flex min-h-9 items-stretch self-stretch py-0', listClassName)}>
        <Tabs.Trigger value="all" className="after:-mb-px">
          {t('all', 'All')}
        </Tabs.Trigger>
        <Tabs.Trigger value="unread" className="after:-mb-px">
          {t('unread', 'Unread')}
          {unread > 0 && <span className="ml-1 text-xs text-muted-foreground">{unread}</span>}
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs>
  );
};
