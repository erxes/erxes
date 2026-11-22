import type { AutomationTrigger } from '@erxes/core-contract';
import { Select, ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AudienceEditor, Field, TimeOfDay } from './triggerFields';

type ScheduleTrigger = Extract<AutomationTrigger, { kind: 'schedule' }>;

type Props = {
  trigger: ScheduleTrigger;
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const REPEATS = [
  ...[5, 10, 15, 20, 30, 45].map((n) => ({
    key: `minute:${n}`,
    every: 'minute' as const,
    interval: n,
    label: `Every ${n} minutes`,
  })),
  { key: 'hour:1', every: 'hour' as const, interval: undefined, label: 'Every hour' },
  ...[2, 3, 4, 6, 8, 12].map((n) => ({
    key: `hour:${n}`,
    every: 'hour' as const,
    interval: n,
    label: `Every ${n} hours`,
  })),
  { key: 'day', every: 'day' as const, interval: undefined, label: 'Every day' },
  { key: 'week', every: 'week' as const, interval: undefined, label: 'Every week' },
  { key: 'month', every: 'month' as const, interval: undefined, label: 'Every month' },
];

const repeatKey = (trigger: ScheduleTrigger) => {
  if (trigger.every === 'minute') return `minute:${trigger.interval ?? 15}`;

  if (trigger.every === 'hour') return `hour:${trigger.interval ?? 1}`;

  return trigger.every;
};

const MINUTES = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'));

const DAYS = Array.from({ length: 31 }, (_, index) => String(index + 1));

const WeekdayPicker = ({ trigger, onChange, disabled }: Props) => {
  const { t } = useTranslation('automations');
  const current = trigger.weekdays ?? [1];

  return (
    <ToggleGroup
      multiple
      variant="outline"
      className="w-full"
      disabled={disabled}
      aria-label={t('weekdays', 'Days of the week')}
      value={current.map(String)}
      onValueChange={(next) => {
        const weekdays = next
          .map(Number)
          .filter((day) => day >= 1 && day <= 7)
          .toSorted((a, b) => a - b);

        if (weekdays.length) onChange({ ...trigger, weekdays });
      }}
    >
      {WEEKDAYS.map((day, index) => (
        <ToggleGroup.Item key={day} value={String(index + 1)} className="min-w-0 flex-1">
          {t(`weekday.${day}`, day)}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
};

const Choice = ({
  value,
  options,
  label,
  disabled,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  label: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) => (
  <Select value={value} disabled={disabled} onValueChange={(next) => next && onChange(next)}>
    <Select.Trigger className="h-8 w-full" aria-label={label}>
      <Select.Value />
    </Select.Trigger>
    <Select.Content>
      {options.map((option) => (
        <Select.Item key={option.value} value={option.value}>
          {option.label}
        </Select.Item>
      ))}
    </Select.Content>
  </Select>
);

const Repeats = ({ trigger, onChange, disabled }: Props) => {
  const { t } = useTranslation('automations');

  return (
    <Choice
      value={repeatKey(trigger)}
      label={t('repeats', 'Repeats')}
      disabled={disabled}
      options={REPEATS.map((repeat) => ({
        value: repeat.key,
        label: t(`repeat.${repeat.key}`, repeat.label),
      }))}
      onChange={(key) => {
        const repeat = REPEATS.find((item) => item.key === key);

        if (repeat) onChange({ ...trigger, every: repeat.every, interval: repeat.interval });
      }}
    />
  );
};

const When = ({ trigger, onChange, disabled }: Props) => {
  const { t } = useTranslation('automations');
  const { every } = trigger;

  if (every === 'minute') return null;

  if (every === 'hour')
    return (
      <Field label={t('minute', 'At minute')}>
        <Choice
          value={trigger.at.slice(3)}
          label={t('minute', 'At minute')}
          disabled={disabled}
          options={MINUTES.map((minute) => ({ value: minute, label: `:${minute}` }))}
          onChange={(minute) => onChange({ ...trigger, at: `00:${minute}` })}
        />
      </Field>
    );

  return (
    <>
      {every === 'month' && (
        <Field label={t('on-day', 'On day')}>
          <Choice
            value={String(trigger.dayOfMonth ?? 1)}
            label={t('on-day', 'On day')}
            disabled={disabled}
            options={DAYS.map((day) => ({ value: day, label: day }))}
            onChange={(day) => onChange({ ...trigger, dayOfMonth: Number(day) })}
          />
        </Field>
      )}
      <Field label={t('time', 'Time')}>
        <TimeOfDay
          at={trigger.at}
          disabled={disabled}
          onChange={(at) => onChange({ ...trigger, at })}
        />
      </Field>
    </>
  );
};

/**
 * Every few minutes or hours, or every day, week or month at a time, optionally once for each
 * matching record.
 */
export const ScheduleTriggerSettings = (props: Props) => {
  const { t } = useTranslation('automations');
  const { trigger, onChange, disabled } = props;

  return (
    <>
      <Field label={t('repeats', 'Repeats')}>
        <Repeats {...props} />
        {trigger.every === 'week' && <WeekdayPicker {...props} />}
      </Field>
      <When {...props} />
      <AudienceEditor
        value={trigger.audience}
        disabled={disabled}
        onChange={(audience) => onChange({ ...trigger, audience })}
      />
    </>
  );
};
