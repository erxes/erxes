import { useBroadcastScheduleField } from '@/broadcast/hooks/useBroadcastScheduleFields';
import { IconCalendarClock, IconX } from '@tabler/icons-react';
import { Button, cn, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { BroadcastScheduleFields } from '../common/BroadcastScheduleFields';

/**
 * When this campaign goes out, chosen while it is being written.
 *
 * Sits in the sheet header rather than among the fields: it is not part of the
 * campaign's content, and it decides what the footer's own button does. The
 * schedule is held on the form and only applied once the campaign has been
 * saved and therefore has something to schedule.
 */
export const BroadcastScheduleField = () => {
  const { t } = useTranslation('broadcasts');
  const {
    fieldsValue,
    ready,
    hasSchedule,
    label,
    canFollowSegment,
    set,
    clear,
    onOpenChange,
  } = useBroadcastScheduleField();

  return (
    <div className="flex items-center gap-1">
      <Popover onOpenChange={onOpenChange}>
        <Popover.Trigger asChild>
          {/* Outlined so it reads as something to press rather than as more
              of the title, and filled once set so the campaign says at a
              glance that it is waiting. */}
          <Button
            variant={ready ? 'secondary' : 'outline'}
            size="sm"
            className={cn(ready && 'font-medium text-primary')}
          >
            <IconCalendarClock
              className={cn('size-4', !ready && 'text-muted-foreground')}
            />
            {label}
          </Button>
        </Popover.Trigger>
        <Popover.Content align="end" className="w-auto p-3">
          <BroadcastScheduleFields
            value={fieldsValue}
            onChange={set}
            canFollowSegment={canFollowSegment}
          />
        </Popover.Content>
      </Popover>

      {hasSchedule && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('schedule.send-without-waiting')}
          className="size-6 text-muted-foreground"
          title={t('schedule.send-without-waiting')}
          onClick={clear}
        >
          <IconX className="size-4" />
        </Button>
      )}
    </div>
  );
};
