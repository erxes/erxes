import { useBroadcastFollowableSegment } from '@/broadcast/hooks/useBroadcastFollowableSegment';
import { IBroadcastFormData } from '@/broadcast/hooks/useBroadcastForm';
import { useBroadcastSchedulePreview } from '@/broadcast/hooks/useBroadcastSchedulePreview';
import {
  defaultScheduleMoment,
  emptySchedule,
  withScheduleDate,
  withScheduleTime,
} from '@/broadcast/utils/scheduleDefaults';
import {
  BROADCAST_EVERY_OPTIONS,
  describeRecurrence,
  isAfterSegmentForm,
  isRecurringForm,
  isScheduleReady,
  TBroadcastEvery,
  TBroadcastScheduleForm,
} from '@/broadcast/utils/scheduleForm';
import { Time } from '@internationalized/date';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import type { TimeValue } from 'react-aria-components';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

// Six choices do not fit one row, so they split into two rows of three
const GRID_FROM_OPTIONS = 6;

const summaryOf = (
  schedule: TBroadcastScheduleForm,
  t: (key: string) => string,
) => {
  if (isAfterSegmentForm(schedule)) {
    return t('schedule.every.afterSegment');
  }

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
 * The campaign form's schedule: held on the form and applied once the
 * campaign is saved. Opening it on an empty schedule starts a default one.
 */
export const useBroadcastScheduleField = () => {
  const { t } = useTranslation('broadcasts');
  const form = useFormContext<IBroadcastFormData>();
  const value = form.watch('schedule') as TBroadcastScheduleForm | undefined;
  const ready = isScheduleReady(value);
  const { canFollowSegment } = useBroadcastFollowableSegment(
    form.watch('targetType'),
    form.watch('targetIds'),
  );

  const set = useCallback(
    (next?: TBroadcastScheduleForm) =>
      form.setValue('schedule', next, { shouldDirty: true }),
    [form],
  );

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (open && !value) {
        set(emptySchedule());
      }
    },
    [value, set],
  );

  return {
    value,
    fieldsValue: value ?? emptySchedule(),
    ready,
    hasSchedule: !!value,
    label: ready && value ? summaryOf(value, t) : t('schedule.send-later'),
    canFollowSegment,
    set,
    clear: () => set(undefined),
    onOpenChange,
  };
};

/** One schedule: how often, when, and until when, and how many sends that is. */
export const useBroadcastScheduleFields = ({
  value,
  onChange,
  canFollowSegment,
}: {
  value: TBroadcastScheduleForm;
  onChange: (next: TBroadcastScheduleForm) => void;
  canFollowSegment: boolean;
}) => {
  const { t, i18n } = useTranslation('broadcasts');
  const at = value.at ?? defaultScheduleMoment();
  const recurring = isRecurringForm(value);
  const afterSegment = isAfterSegmentForm(value);
  const { count, loading } = useBroadcastSchedulePreview(value);

  // Kept on offer once chosen, so a campaign that follows its segment still
  // shows what it does while its audience is being looked at
  const options = BROADCAST_EVERY_OPTIONS.filter(
    (option) =>
      option.value !== 'afterSegment' || canFollowSegment || afterSegment,
  );

  const set = useCallback(
    (patch: Partial<TBroadcastScheduleForm>) =>
      onChange({ ...value, ...patch }),
    [onChange, value],
  );

  const onEveryChange = useCallback(
    (every: string) => {
      if (every) {
        set({ every: every as TBroadcastEvery, at });
      }
    },
    [set, at],
  );

  const onDateChange = useCallback(
    (date: unknown) => {
      if (date instanceof Date) {
        set({ at: withScheduleDate(at, date) });
      }
    },
    [set, at],
  );

  const onTimeChange = useCallback(
    (time: TimeValue | null) => {
      if (time) {
        set({ at: withScheduleTime(at, time) });
      }
    },
    [set, at],
  );

  const onEndDateChange = useCallback(
    (date: unknown) => {
      if (date instanceof Date) {
        set({ endDate: date });
      }
    },
    [set],
  );

  return {
    at,
    time: new Time(at.getHours(), at.getMinutes()),
    recurring,
    afterSegment,
    options,
    asGrid: options.length >= GRID_FROM_OPTIONS,
    atLabelKey: recurring ? 'schedule.starting-from' : 'schedule.send-at',
    recurrenceText: recurring
      ? describeRecurrence({ ...value, at }, t, i18n.language)
      : '',
    sendCount: value.endDate && !loading ? count : undefined,
    isInPast: !recurring && !afterSegment && at.getTime() <= Date.now(),
    onEveryChange,
    onDateChange,
    onTimeChange,
    onEndDateChange,
  };
};
