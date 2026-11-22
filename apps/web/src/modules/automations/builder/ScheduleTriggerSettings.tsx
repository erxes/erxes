import type { AutomationTrigger } from '@erxes/core-contract';
import { cn, Input, InputGroup, oneOf, Select } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AudienceEditor, Field, TimeOfDay } from './triggerFields';

type ScheduleTrigger = Extract<AutomationTrigger, { kind: 'schedule' }>;

type Props = {
  trigger: ScheduleTrigger;
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EVERY = ['minute', 'hour', 'day', 'week', 'month'] as const;

const INTERVALS = {
  minute: { min: 5, max: 59 },
  hour: { min: 1, max: 23 },
} as const;

const withEvery = (trigger: ScheduleTrigger, every: ScheduleTrigger['every']): ScheduleTrigger => ({
  ...trigger,
  every,
  interval: every === 'minute' ? 15 : undefined,
});

const IntervalInput = ({
  trigger,
  every,
  onChange,
  disabled,
}: Props & { every: keyof typeof INTERVALS }) => {
  const { t } = useTranslation('automations');
  const { min, max } = INTERVALS[every];
  const [text, setText] = useState(() => trigger.interval?.toString() ?? '');
  const optional = every === 'hour';

  const type = (next: string) => {
    const value = Number(next);

    setText(next);

    if (!next && optional) onChange({ ...trigger, interval: undefined });
    else if (Number.isInteger(value) && value >= min && value <= max)
      onChange({ ...trigger, interval: value });
  };

  const settle = () => {
    if (!text && optional) return;

    const interval = Math.min(max, Math.max(min, Math.trunc(Number(text) || min)));

    setText(String(interval));
    onChange({ ...trigger, interval });
  };

  return (
    <InputGroup>
      <InputGroup.Input
        type="number"
        min={min}
        max={max}
        value={text}
        placeholder={optional ? '1' : undefined}
        disabled={disabled}
        aria-label={
          optional
            ? t('every-n-hours', 'Hours between runs')
            : t('every-n-minutes', 'Minutes between runs')
        }
        onChange={(event) => type(event.target.value)}
        onBlur={settle}
      />
      <InputGroup.Addon align="end">
        {optional ? t('interval-hours', 'hours apart') : t('interval-minutes', 'minutes apart')}
      </InputGroup.Addon>
    </InputGroup>
  );
};

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

          if (every && every !== trigger.every) onChange(withEvery(trigger, every));
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

/**
 * Every few minutes or hours, or every day, week or month at a time, optionally once for each
 * matching record.
 */
export const ScheduleTriggerSettings = (props: Props) => {
  const { t } = useTranslation('automations');
  const { trigger, onChange, disabled } = props;
  const { every } = trigger;
  const hourly = every === 'hour';

  return (
    <>
      <Field
        label={t('repeats', 'Repeats')}
        hint={
          hourly
            ? t('every-hours-hint', 'Empty: every hour. Hours count from midnight.')
            : undefined
        }
      >
        <Repeats {...props} />
        {every === 'week' && <WeekdayPicker {...props} />}
        {(every === 'minute' || hourly) && <IntervalInput key={every} {...props} every={every} />}
      </Field>
      {every !== 'minute' && (
        <Field
          label={hourly ? t('minute', 'At minute') : t('time', 'Time')}
          hint={hourly ? t('every-hour-hint', 'At the minute of the time below.') : undefined}
        >
          <TimeOfDay
            at={trigger.at}
            disabled={disabled}
            onChange={(at) => onChange({ ...trigger, at })}
          />
        </Field>
      )}
      <AudienceEditor
        value={trigger.audience}
        disabled={disabled}
        onChange={(audience) => onChange({ ...trigger, audience })}
      />
    </>
  );
};
