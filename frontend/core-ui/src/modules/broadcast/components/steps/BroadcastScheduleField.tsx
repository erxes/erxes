import { IBroadcastFormData } from '@/broadcast/hooks/useBroadcastForm';
import { IconCalendarClock, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Button, cn, Popover } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  BroadcastScheduleFields,
  emptySchedule,
} from '../common/BroadcastScheduleFields';
import {
  BROADCAST_EVERY_OPTIONS,
  isRecurringForm,
  isScheduleReady,
  TBroadcastScheduleForm,
} from '../../utils/scheduleForm';

const summary = (
  schedule: TBroadcastScheduleForm,
  t: (key: string) => string,
) => {
  if (!isRecurringForm(schedule)) {
    return dayjs(schedule.at).format('MMM D, HH:mm');
  }

  const labelKey = BROADCAST_EVERY_OPTIONS.find(
    (option) => option.value === schedule.every,
  )?.labelKey;

  return `${labelKey ? t(labelKey) : ''} · ${dayjs(schedule.at).format(
    'HH:mm',
  )}`;
};

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
  const form = useFormContext<IBroadcastFormData>();

  const value = form.watch('schedule') as TBroadcastScheduleForm | undefined;
  const ready = isScheduleReady(value);

  const set = (next?: TBroadcastScheduleForm) =>
    form.setValue('schedule', next, { shouldDirty: true });

  return (
    <div className="flex items-center gap-1">
      <Popover
        onOpenChange={(open) => {
          if (open && !value) {
            set(emptySchedule());
          }
        }}
      >
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
            {ready && value ? summary(value, t) : t('schedule.send-later')}
          </Button>
        </Popover.Trigger>
        <Popover.Content align="end" className="w-auto p-3">
          <BroadcastScheduleFields
            value={value ?? emptySchedule()}
            onChange={set}
          />
        </Popover.Content>
      </Popover>

      {!!value && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('schedule.send-without-waiting')}
          className="size-6 text-muted-foreground"
          title={t('schedule.send-without-waiting')}
          onClick={() => set(undefined)}
        >
          <IconX className="size-4" />
        </Button>
      )}
    </div>
  );
};
