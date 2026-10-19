import type { NotificationSelectionToolbarProps } from '@/notification/types/myInbox';
import { IconCheck, IconX } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NotificationSelectionToolbar = ({
  selectedCount,
  markingAsRead,
  onMarkAsRead,
  onClear,
}: NotificationSelectionToolbarProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  return (
    <div className="absolute bottom-4 left-1/2 z-10 flex h-10 -translate-x-1/2 items-center gap-1 rounded-lg border bg-background px-2 shadow-lg whitespace-nowrap">
      <span className="px-2 text-xs text-muted-foreground" aria-live="polite">
        {t('selected-count', {
          defaultValue: '{{count}} selected',
          count: selectedCount,
        })}
      </span>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('mark-as-read', 'Mark as read')}
        title={`${t(
          'mark-as-read',
          'Mark as read',
        )} (Ctrl/Cmd + Backspace / Delete)`}
        disabled={markingAsRead}
        onClick={() => void onMarkAsRead()}
      >
        {markingAsRead ? (
          <Spinner containerClassName="size-4" />
        ) : (
          <IconCheck />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('clear-selection', 'Clear selection')}
        disabled={markingAsRead}
        onClick={onClear}
      >
        <IconX />
      </Button>
    </div>
  );
};
