import type { AutomationTrigger } from '@erxes/core-contract';
import { cn, Input, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { oneOf } from '~/lib/text';
import { AudienceEditor, Field, TimeAndZone } from './triggerFields';

type ScheduleTrigger = Extract<AutomationTrigger, { kind: 'schedule' }>;

type Props = {
  trigger: ScheduleTrigger;
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EVERY = ['hour', 'day', 'week', 'month'] as const;

/** Days of the week (1 = Monday), at least one. */
const WeekdayPicker = ({ trigger, onChange, disabled }: Props) => {
  const { t } = useTranslation('automations');
  const current = trigger.weekdays ?? [1];

  return (
    <div className="flex gap-1">
      {WEEKDAYS.map((day, index) => {
        const weekday = index + 1;
        const on = current.includes(weekday);

        const next = on
          ? current.filter((item) => item !== weekday)
          : [...current, weekday].toSorted((a, b) => a - b);

        return (
          <button
            key={day}
            type="button"
            disabled={disabled}
            aria-pressed={on}
            className={cn(
              'h-7 min-w-0 flex-1 rounded-md border text-xs transition-colors',
              on
                ? 'border-primary bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
            onClick={() => onChange({ ...trigger, weekdays: next.length ? next : [weekday] })}
          >
            {t(`weekday.${day}`, day)}
          </button>
        );
      })}
    </div>
  );
};

const Repeats = ({ trigger, onChange, disabled }: Props) => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex items-center gap-2">
      <Select
        value={trigger.every}
        disabled={disabled}
        onValueChange={(next) => {
          const every = oneOf(EVERY, next);

          if (every) onChange({ ...trigger, every });
        }}
      >
        <Select.Trigger className="h-8 min-w-0 flex-1">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {EVERY.map((every) => (
            <Select.Item key={every} value={every}>
              {t(`every-${every}-option`, `Every ${every}`)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      {trigger.every === 'month' && (
        <>
          <span className="shrink-0 text-sm text-muted-foreground">{t('on-day', 'on day')}</span>
          <Input
            type="number"
            min={1}
            max={31}
            className="h-8 w-16 shrink-0"
            value={trigger.dayOfMonth ?? 1}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                ...trigger,
                dayOfMonth: Math.min(31, Math.max(1, Number(event.target.value) || 1)),
              })
            }
          />
        </>
      )}
    </div>
  );
};

/** Every hour, day, week or month at a time, optionally once for each matching record. */
export const ScheduleTriggerSettings = (props: Props) => {
  const { t } = useTranslation('automations');
  const { trigger, onChange, disabled } = props;
  const hourly = trigger.every === 'hour';

  return (
    <>
      <Field label={t('repeats', 'Repeats')}>
        <Repeats {...props} />
        {trigger.every === 'week' && <WeekdayPicker {...props} />}
      </Field>
      <Field
        label={hourly ? t('minute', 'At minute') : t('time', 'Time')}
        hint={
          hourly ? t('every-hour-hint', 'At the minute of the time below, every hour.') : undefined
        }
      >
        <TimeAndZone
          at={trigger.at}
          timezone={trigger.timezone}
          disabled={disabled}
          onChange={(next) => onChange({ ...trigger, ...next })}
        />
      </Field>
      <AudienceEditor
        value={trigger.audience}
        disabled={disabled}
        onChange={(audience) => onChange({ ...trigger, audience })}
      />
    </>
  );
};
