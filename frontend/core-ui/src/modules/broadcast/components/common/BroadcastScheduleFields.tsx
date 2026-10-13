import { Time } from '@internationalized/date';
import dayjs from 'dayjs';
import {
  cn,
  DateInput,
  DatePicker,
  Label,
  TimeField,
  ToggleGroup,
} from 'erxes-ui';
import type { TimeValue } from 'react-aria-components';
import { useBroadcastSchedulePreview } from '../../hooks/useBroadcastSchedulePreview';
import {
  BROADCAST_EVERY_OPTIONS,
  describeRecurrence,
  isAfterSegmentForm,
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
  canFollowSegment = false,
}: {
  value: TBroadcastScheduleForm;
  onChange: (next: TBroadcastScheduleForm) => void;
  /** The audience is one segment the clock moves, so it can start the send. */
  canFollowSegment?: boolean;
}) => {
  const { t, i18n } = useTranslation('broadcasts');
  const at = value.at ?? defaultScheduleMoment();
  const recurring = isRecurringForm(value);
  const afterSegment = isAfterSegmentForm(value);
  const { count, loading } = useBroadcastSchedulePreview(value);

  // Kept on offer once chosen, so a campaign that follows its segment still
  // shows what it does while its audience is being looked at.
  const options = BROADCAST_EVERY_OPTIONS.filter(
    (option) =>
      option.value !== 'afterSegment' || canFollowSegment || afterSegment,
  );

  const set = (patch: Partial<TBroadcastScheduleForm>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="w-72 space-y-3">
      <ToggleGroup
        type="single"
        value={value.every}
        onValueChange={(every) =>
          every && set({ every: every as TBroadcastEvery, at })
        }
        // Six choices do not fit one row, so they split into two of three.
        className={cn('w-full', options.length > 5 && 'grid grid-cols-3')}
      >
        {options.map((option) => (
          <ToggleGroup.Item
            key={option.value}
            value={option.value}
            className="flex-1"
          >
            {t(option.labelKey)}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>

      {afterSegment && (
        <p className="text-xs text-muted-foreground">
          {t('schedule.after-segment-hint')}
        </p>
      )}

      {!afterSegment && (
        <div className="space-y-1">
          <Label>
            {t(recurring ? 'schedule.starting-from' : 'schedule.send-at')}
          </Label>
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
      )}

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
          {describeRecurrence({ ...value, at }, t, i18n.language)}
          {value.endDate && !loading && count !== undefined && (
            <>
              {' · '}
              <span className="text-foreground">
                {t('schedule.times', { count })}
              </span>
            </>
          )}
        </p>
      ) : (
        !afterSegment &&
        at.getTime() <= Date.now() && (
          <p className="text-xs text-destructive">{t('schedule.in-past')}</p>
        )
      )}
    </div>
  );
};
