import { ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNotificationFilterControls } from '@/notification/hooks/useNotificationFilterControls';

export const NotificationStatusFilter = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { status, setStatus } = useNotificationFilterControls();

  return (
    <div className="flex h-10 shrink-0 items-center border-b">
      <ToggleGroup
        type="single"
        value={status}
        aria-label={t('status-label')}
        className="h-full w-full gap-0"
        onValueChange={(value) => {
          if (value === 'unread' || value === 'read' || value === 'all') {
            setStatus(value);
          }
        }}
      >
        {(['unread', 'all', 'read'] as const).map((value) => (
          <ToggleGroup.Item
            key={value}
            value={value}
            className="h-full min-w-0 flex-1 rounded-none border-b-2 border-transparent px-0 text-xs font-normal hover:bg-transparent data-[state=on]:border-primary data-[state=on]:bg-transparent data-[state=on]:font-medium data-[state=on]:text-foreground"
          >
            {t(value)}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
    </div>
  );
};
