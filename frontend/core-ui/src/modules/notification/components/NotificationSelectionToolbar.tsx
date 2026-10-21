import type { NotificationSelectionToolbarProps } from '@/notification/types/myInbox';
import { IconCheck, IconTrash, IconX } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NotificationSelectionToolbar = ({
  selectedCount,
  pending,
  allRead,
  onMarkAsRead,
  onDelete,
  onClear,
}: NotificationSelectionToolbarProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const actionLabel = allRead
    ? t('delete', 'Delete')
    : t('mark-as-read', 'Mark as read');
  const ActionIcon = allRead ? IconTrash : IconCheck;

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
        aria-label={actionLabel}
        title={`${actionLabel} (Ctrl/Cmd + Backspace / Delete)`}
        disabled={pending}
        onClick={() => void (allRead ? onDelete() : onMarkAsRead())}
      >
        {pending ? (
          <Spinner containerClassName="size-4" />
        ) : (
          <ActionIcon />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('clear-selection', 'Clear selection')}
        disabled={pending}
        onClick={onClear}
      >
        <IconX />
      </Button>
    </div>
  );
};
