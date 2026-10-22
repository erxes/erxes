import type { NotificationSelectionToolbarProps } from '@/notification/types/myInbox';
import { IconCheck, IconTrash, IconX } from '@tabler/icons-react';
import { Button, Checkbox, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NotificationSelectionToolbar = ({
  selectedCount,
  visibleCount,
  pending,
  allRead,
  onToggleAll,
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
    <div className="flex h-10 shrink-0 items-center gap-2 border-t bg-background px-4 whitespace-nowrap">
      <Checkbox
        id="notification-select-visible"
        checked={
          selectedCount === visibleCount && visibleCount > 0
            ? true
            : selectedCount > 0
            ? 'indeterminate'
            : false
        }
        disabled={pending || visibleCount === 0}
        aria-label={t('select-visible')}
        onCheckedChange={onToggleAll}
      />
      <label
        htmlFor="notification-select-visible"
        className="mr-auto cursor-pointer text-xs text-muted-foreground"
        aria-live="polite"
      >
        {t('selected-count', {
          defaultValue: '{{count}} selected',
          count: selectedCount,
        })}
      </label>
      <Button
        variant="ghost"
        className="h-7 gap-1.5 px-2 text-xs"
        aria-label={actionLabel}
        title={`${actionLabel} (Ctrl/Cmd + Backspace / Delete)`}
        disabled={pending || selectedCount === 0}
        onClick={() => void (allRead ? onDelete() : onMarkAsRead())}
      >
        {pending ? <Spinner containerClassName="size-4" /> : <ActionIcon />}
        {actionLabel}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 shrink-0 text-muted-foreground"
        aria-label={t('clear-selection', 'Clear selection')}
        disabled={pending}
        onClick={onClear}
      >
        <IconX />
      </Button>
    </div>
  );
};
