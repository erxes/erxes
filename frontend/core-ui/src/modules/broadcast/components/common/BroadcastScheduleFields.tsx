import { Time } from '@internationalized/date';
import dayjs from 'dayjs';
import { DateInput, DatePicker, Label, TimeField, ToggleGroup } from 'erxes-ui';
import type { TimeValue } from 'react-aria-components';
import { useBroadcastSchedulePreview } from '../../hooks/useBroadcastSchedulePreview';
import {
  BROADCAST_EVERY_OPTIONS,
  describeRecurrence,
  isRecurringForm,
  TBroadcastEvery,
  TBroadcastScheduleForm,
} from '../../utils/scheduleForm';
import { useTranslation } from 'react-i18next';

/** Far enough ahead that the offered moment is never already in the past. */
export const defaultScheduleMoment = () =>
  dayjs().add(1, 'day').hour(9).minute(0).second(0).millisecond(0).toDate();

export const emptySchedule = (): TBroadcastScheduleForm => ({
  every: 'once',
  at: defaultScheduleMoment(),
});

const withDate = (at: Date, next: Date) =>
  dayjs(next).hour(at.getHours()).minute(at.getMinutes()).second(0).toDate();

const withTime = (at: Date, time: TimeValue) =>
  dayjs(at).hour(time.hour).minute(time.minute).second(0).toDate();

/**
 * One schedule: how often, when, and until when.
 *
 * Shared by the dialog the list opens and the popover the form carries, so a
 * schedule is described the same way wherever it is offered.
 */
export const BroadcastScheduleFields = ({
  value,
  onChange,
}: {
  value: TBroadcastScheduleForm;
  onChange: (next: TBroadcastScheduleForm) => void;
}) => {
  const { t } = useTranslation('broadcasts');
  const at = value.at ?? defaultScheduleMoment();
  const recurring = isRecurringForm(value);
  const { count, loading } = useBroadcastSchedulePreview(value);

  const set = (patch: Partial<TBroadcastScheduleForm>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="w-72 space-y-3">
      <ToggleGroup
        type="single"
        value={value.every}
        onValueChange={(every) =>
          every && set({ every: every as TBroadcastEvery })
        }
        className="w-full"
      >
        {BROADCAST_EVERY_OPTIONS.map((option) => (
          <ToggleGroup.Item
            key={option.value}
            value={option.value}
            className="flex-1"
          >
            {option.label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>

      <div className="space-y-1">
        <Label>{recurring ? 'Starting from' : 'Send at'}</Label>
        <div className="flex items-center gap-2">
          <DatePicker
            value={at}
            defaultMonth={at}
            onChange={(date) => {
              if (date instanceof Date) {
                set({ at: withDate(at, date) });
              }
            }}
          />
          <div className="w-24">
            <TimeField
              value={new Time(at.getHours(), at.getMinutes())}
              onChange={(time) => time && set({ at: withTime(at, time) })}
            >
              <DateInput />
            </TimeField>
          </div>
        </div>
      </div>

      {recurring && (
        <div className="space-y-1">
          <Label>{t('schedule.until')}</Label>
          <DatePicker
            value={value.endDate}
            defaultMonth={value.endDate ?? at}
            placeholder={t('schedule.pick-end')}
            onChange={(date) => date instanceof Date && set({ endDate: date })}
          />
        </div>
      )}

      {recurring ? (
        <p className="text-xs text-muted-foreground">
          {describeRecurrence({ ...value, at })}
          {value.endDate && !loading && count !== undefined && (
            <>
              {' · '}
              <span className="text-foreground">{count} times</span>
            </>
          )}
        </p>
      ) : (
        at.getTime() <= Date.now() && (
          <p className="text-xs text-destructive">
            Pick a moment that has not passed yet.
          </p>
        )
      )}
    </div>
  );
};
