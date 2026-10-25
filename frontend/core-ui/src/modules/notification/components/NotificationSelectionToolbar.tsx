import type { NotificationSelectionToolbarProps } from '@/notification/types/myInbox';
import { IconCheck, IconTrash, IconX } from '@tabler/icons-react';
import { Button, Checkbox, Spinner, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { NotificationShortcuts } from './NotificationShortcuts';

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
  let checked: boolean | 'indeterminate' = false;
  if (selectedCount > 0) {
    checked = selectedCount === visibleCount ? true : 'indeterminate';
  }

  return (
    <div
      className={cn(
        'flex h-10 shrink-0 items-center gap-2 border-t px-4 whitespace-nowrap',
        selectedCount > 0 && 'bg-background',
      )}
    >
      <Checkbox
        id="notification-select-visible"
        checked={checked}
        disabled={pending || visibleCount === 0}
        aria-label={t('select-visible')}
        onCheckedChange={onToggleAll}
      />
      <label
        htmlFor="notification-select-visible"
        className={cn(
          'mr-auto cursor-pointer text-muted-foreground',
          selectedCount > 0 ? 'text-xs' : 'text-[11px]',
        )}
        aria-live="polite"
      >
        {selectedCount > 0
          ? t('selected-count', {
              defaultValue: '{{count}} selected',
              count: selectedCount,
            })
          : t('conversation-count', {
              count: visibleCount,
              defaultValue_one: '{{count}} conversation',
              defaultValue_other: '{{count}} conversations',
            })}
      </label>
      {selectedCount > 0 ? (
        <>
          <Button
            variant="ghost"
            className="h-7 gap-1.5 px-2 text-xs"
            aria-label={actionLabel}
            title={`${actionLabel} (Ctrl/Cmd + Backspace / Delete)`}
            disabled={pending}
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
        </>
      ) : (
        <NotificationShortcuts />
      )}
    </div>
  );
};
