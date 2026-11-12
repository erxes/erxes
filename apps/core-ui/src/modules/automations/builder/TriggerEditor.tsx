import type { AutomationTrigger, ConditionGroup } from '@erxes/core-contract';
import {
  IconBolt,
  IconBuilding,
  IconCalendarEvent,
  IconClock,
  IconHandFinger,
  IconRepeat,
  IconRepeatOnce,
  IconUser,
} from '@tabler/icons-react';
import { Button, cn, Input, Select, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Segmented } from './Segmented';
import { zoneChoices, zoneLabel } from './timezones';
import { CatalogPicker } from './CatalogPicker';
import { ConditionsEditor } from './ConditionsEditor';
import { useAutomationFields } from './useAutomationFields';
import { oneOf } from '~/lib/text';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const EVERY = ['hour', 'day', 'week', 'month'] as const;

const KINDS = [
  { kind: 'event', icon: IconBolt, label: 'Event', hint: 'When something happens' },
  { kind: 'schedule', icon: IconClock, label: 'Schedule', hint: 'Every hour, day, week or month' },
  { kind: 'date', icon: IconCalendarEvent, label: 'Date', hint: 'Before or after a record’s date' },
  { kind: 'manual', icon: IconHandFinger, label: 'Manual', hint: 'You start it on chosen records' },
] as const;

/** One labelled setting of the trigger. */
const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <div className="text-xs font-medium text-muted-foreground">{label}</div>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const defaults = (kind: AutomationTrigger['kind']): AutomationTrigger =>
  kind === 'event'
    ? { kind, event: 'core.customer.created' }
    : kind === 'schedule'
      ? { kind, every: 'day', at: '09:00', timezone: 'Asia/Ulaanbaatar' }
      : kind === 'date'
        ? {
            kind,
            subject: 'customer',
            field: 'birthDate',
            offsetDays: 0,
            yearly: true,
            at: '09:00',
            timezone: 'Asia/Ulaanbaatar',
          }
        : { kind: 'manual', audience: { type: 'customer' } };

const TimeAndZone = ({
  at,
  timezone,
  onChange,
  disabled,
}: {
  at: string;
  timezone: string;
  onChange: (next: { at?: string; timezone?: string }) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex items-center gap-2">
      <Input
        type="time"
        className="h-8 w-28 shrink-0"
        value={at}
        disabled={disabled}
        onChange={(event) => onChange({ at: event.target.value })}
        aria-label={t('at', 'at')}
      />
      <Select
        value={timezone}
        disabled={disabled}
        onValueChange={(value) => onChange({ timezone: value })}
      >
        <Select.Trigger className="h-8 min-w-0 flex-1">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {zoneChoices(timezone).map((zone) => (
            <Select.Item key={zone} value={zone}>
              {zoneLabel(zone)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
};

const AudienceEditor = ({
  value,
  onChange,
  disabled,
}: {
  value: { type: 'customer' | 'company'; conditions?: ConditionGroup } | undefined;
  onChange: (
    next: { type: 'customer' | 'company'; conditions?: ConditionGroup } | undefined,
  ) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Switch
          checked={Boolean(value)}
          disabled={disabled}
          onCheckedChange={(on) => onChange(on ? { type: 'customer' } : undefined)}
        />
        {t('for-each-record', 'Run for each matching record')}
      </label>
      {value && (
        <>
          <Select
            value={value.type}
            disabled={disabled}
            onValueChange={(type) =>
              onChange({ type: type === 'company' ? 'company' : 'customer' })
            }
          >
            <Select.Trigger className="h-8 w-full">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="customer">{t('customers', 'Customers')}</Select.Item>
              <Select.Item value="company">{t('companies', 'Companies')}</Select.Item>
            </Select.Content>
          </Select>
          <ConditionsEditor
            subject={value.type}
            value={value.conditions}
            disabled={disabled}
            onChange={(conditions) => onChange({ ...value, conditions })}
          />
          <p className="text-xs text-muted-foreground">
            {t('audience-hint', 'Up to 10,000 records a run; re-entry rules apply.')}
          </p>
        </>
      )}
    </div>
  );
};

type DateTrigger = Extract<AutomationTrigger, { kind: 'date' }>;

/** The trigger's `field` for a date field: `birthDate`, or a custom field's id. */
const dateFieldKey = (path: string) =>
  path === 'subject.birthDate' ? 'birthDate' : path.replace('subject.customFields.', '');

/**
 * "N days before / on / after each record's <date>": which records, which
 * date, when relative to it, once or every year, at what time — and, under
 * it, the whole rule in a sentence with an example, so it can be checked at
 * a glance.
 */
const DateTriggerSettings = ({
  trigger,
  onChange,
  disabled,
}: {
  trigger: DateTrigger;
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
}) => {
  const { t, i18n } = useTranslation('automations');

  const dateFields = useAutomationFields(trigger.subject).fields.filter(
    (field) => field.type === 'date' && field.path !== 'subject.createdAt',
  );

  const current = dateFields.find((field) => dateFieldKey(field.path) === trigger.field);
  const label = current?.label.replace(/ \(custom\)$/, '');

  // Mid-sentence: "birthday", but "VIP date" stays as it is.
  const fieldName = label
    ? /^.[a-zа-яөү]/.test(label)
      ? label.charAt(0).toLowerCase() + label.slice(1)
      : label
    : t('the-date', 'the date');

  const when = trigger.offsetDays > 0 ? 'after' : trigger.offsetDays < 0 ? 'before' : 'on';
  const days = Math.abs(trigger.offsetDays);

  const setDays = (next: number, direction = when) =>
    onChange({
      ...trigger,
      offsetDays:
        direction === 'on'
          ? 0
          : (direction === 'before' ? -1 : 1) * Math.min(365, Math.max(1, Math.round(next) || 1)),
    });

  // An example: a date five weeks from now, and the run it gives.
  const sample = new Date();

  sample.setDate(sample.getDate() + 35);

  const runDay = new Date(sample);

  runDay.setDate(runDay.getDate() + trigger.offsetDays);

  const dayText = (date: Date) =>
    date.toLocaleDateString(i18n.language, {
      month: 'long',
      day: 'numeric',
      year: trigger.yearly ? undefined : 'numeric',
    });

  const relation =
    when === 'on'
      ? t('date-on-the-day', 'on the day of')
      : t(when === 'before' ? 'date-days-before' : 'date-days-after', {
          count: days,
          defaultValue: when === 'before' ? '{{count}} days before' : '{{count}} days after',
        });

  const record =
    trigger.subject === 'company'
      ? t('each-company', 'each company')
      : t('each-customer', 'each customer');

  return (
    <>
      <Field label={t('date-records', 'Records')}>
        <Segmented
          value={trigger.subject}
          disabled={disabled}
          onChange={(subject) =>
            onChange({
              ...trigger,
              subject,
              field: subject === 'customer' ? 'birthDate' : '',
              conditions: undefined,
            })
          }
          options={[
            { value: 'customer', label: t('customers', 'Customers'), icon: IconUser },
            { value: 'company', label: t('companies', 'Companies'), icon: IconBuilding },
          ]}
        />
      </Field>
      <Field label={t('date-field', 'Date')}>
        {dateFields.length ? (
          <Select
            value={current ? trigger.field : ''}
            disabled={disabled}
            onValueChange={(field) => onChange({ ...trigger, field })}
          >
            <Select.Trigger className="h-8 w-full">
              <Select.Value placeholder={t('choose-date-field', 'Choose a date')} />
            </Select.Trigger>
            <Select.Content>
              {dateFields.map((field) => (
                <Select.Item key={field.path} value={dateFieldKey(field.path)}>
                  {field.label.replace(/ \(custom\)$/, '')}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        ) : (
          <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
            {trigger.subject === 'company'
              ? t('no-company-dates', 'Companies have no date fields yet.')
              : t('no-customer-dates', 'Customers have no date fields yet.')}{' '}
            <Link to={CONTACT_SETTINGS.properties} className="text-primary hover:underline">
              {t('add-date-property', 'Add a date property')}
            </Link>
          </p>
        )}
      </Field>
      <Field label={t('when', 'When')}>
        <Segmented
          value={when}
          disabled={disabled}
          onChange={(next) => setDays(Math.max(1, days), next)}
          options={[
            { value: 'before', label: t('when-before', 'Before') },
            { value: 'on', label: t('on-the-day', 'On the day') },
            { value: 'after', label: t('when-after', 'After') },
          ]}
        />
        {when !== 'on' && (
          <div className="flex items-center gap-2 pt-1">
            <Input
              type="number"
              min={1}
              max={365}
              className="h-8 w-20 shrink-0"
              value={days}
              disabled={disabled}
              onChange={(event) => setDays(Number(event.target.value))}
              aria-label={t('days', 'days')}
            />
            <span className="text-sm text-muted-foreground">
              {t(when === 'before' ? 'days-before-the' : 'days-after-the', {
                count: days,
                field: fieldName,
                defaultValue:
                  when === 'before' ? 'days before the {{field}}' : 'days after the {{field}}',
              })}
            </span>
          </div>
        )}
      </Field>
      <Field
        label={t('repeat', 'Repeat')}
        hint={
          trigger.yearly
            ? t('yearly-hint', 'Birthdays and anniversaries: the year of the date is ignored.')
            : t('once-hint', 'Renewals, due dates, trial ends: runs once for each date.')
        }
      >
        <Segmented
          value={trigger.yearly ? 'yearly' : 'once'}
          disabled={disabled}
          onChange={(next) => onChange({ ...trigger, yearly: next === 'yearly' })}
          options={[
            { value: 'yearly', label: t('every-year', 'Every year'), icon: IconRepeat },
            { value: 'once', label: t('once', 'Once'), icon: IconRepeatOnce },
          ]}
        />
      </Field>
      <Field label={t('time', 'Time')}>
        <TimeAndZone
          at={trigger.at}
          timezone={trigger.timezone}
          disabled={disabled}
          onChange={(next) => onChange({ ...trigger, ...next })}
        />
      </Field>
      <div className="flex gap-2.5 rounded-lg bg-primary/5 p-3 text-sm">
        <IconCalendarEvent className="mt-0.5 size-4 shrink-0 text-primary" />
        <div className="min-w-0 space-y-1">
          <p>
            {t('date-summary', {
              relation,
              record,
              field: fieldName,
              time: trigger.at,
              zone: zoneLabel(trigger.timezone),
              defaultValue: 'Runs {{relation}} {{record}}’s {{field}}, at {{time}} ({{zone}}).',
            })}{' '}
            {trigger.yearly
              ? t('date-summary-yearly', 'Every year.')
              : t('date-summary-once', 'Once.')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('date-example', {
              field: fieldName,
              date: dayText(sample),
              run: dayText(runDay),
              time: trigger.at,
              defaultValue: 'For example: {{field}} {{date}} → runs {{run}} at {{time}}.',
            })}
          </p>
        </div>
      </div>
      <Field label={t('only-if', 'Only if')}>
        <ConditionsEditor
          subject={trigger.subject}
          value={trigger.conditions}
          disabled={disabled}
          onChange={(conditions) => onChange({ ...trigger, conditions })}
        />
      </Field>
    </>
  );
};

/** The trigger: an event, a schedule, a date on each record, or a manual start. */
export const TriggerEditor = ({
  trigger,
  events,
  onChange,
  disabled,
  onStartNow,
}: {
  trigger: AutomationTrigger;
  events: {
    type: string;
    label: string;
    description?: string | null;
    source: string;
    subject: 'customer' | 'company' | null;
  }[];
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
  onStartNow?: () => void;
}) => {
  const { t } = useTranslation('automations');

  const subject =
    trigger.kind === 'event'
      ? (events.find((event) => event.type === trigger.event)?.subject ?? null)
      : trigger.kind === 'date'
        ? trigger.subject
        : null;

  return (
    <div className="space-y-5">
      <Field label={t('trigger-type', 'Starts')}>
        <div className="grid auto-rows-fr grid-cols-2 gap-2">
          {KINDS.map(({ kind, icon: Icon, label, hint }) => (
            <button
              key={kind}
              type="button"
              disabled={disabled}
              onClick={() => trigger.kind !== kind && onChange(defaults(kind))}
              className={cn(
                'flex min-w-0 items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors hover:bg-muted/60 disabled:opacity-60',
                trigger.kind === kind &&
                  'border-primary bg-primary/5 ring-1 ring-primary/20 hover:bg-primary/5',
              )}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground',
                  trigger.kind === kind && 'bg-primary text-primary-foreground',
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {t(`trigger-${kind}-title`, label)}
                </span>
                <span className="line-clamp-2 block text-xs leading-snug text-muted-foreground">
                  {t(`trigger-${kind}-hint`, hint)}
                </span>
              </span>
            </button>
          ))}
        </div>
      </Field>

      {trigger.kind === 'event' && (
        <>
          <Field label={t('event', 'Event')}>
            <CatalogPicker
              kind="event"
              items={events}
              value={trigger.event}
              disabled={disabled}
              onChange={(event) => onChange({ ...trigger, event })}
            />
          </Field>
          <Field
            label={t('only-if', 'Only if')}
            hint={
              trigger.conditions?.rules.length
                ? undefined
                : t('only-if-empty', 'No conditions: every such event starts a run.')
            }
          >
            <ConditionsEditor
              subject={subject}
              value={trigger.conditions}
              disabled={disabled}
              onChange={(conditions) => onChange({ ...trigger, conditions })}
            />
          </Field>
        </>
      )}

      {trigger.kind === 'schedule' && (
        <>
          <Field label={t('repeats', 'Repeats')}>
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
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {t('on-day', 'on day')}
                  </span>
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
            {trigger.every === 'week' && (
              <div className="flex gap-1">
                {WEEKDAYS.map((day, index) => {
                  const on = (trigger.weekdays ?? [1]).includes(index + 1);

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={disabled}
                      className={cn(
                        'h-7 min-w-0 flex-1 rounded-md border text-xs transition-colors',
                        on
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted',
                      )}
                      onClick={() => {
                        const current = trigger.weekdays ?? [1];

                        const next = on
                          ? current.filter((item) => item !== index + 1)
                          : [...current, index + 1].toSorted((a, b) => a - b);

                        onChange({ ...trigger, weekdays: next.length ? next : [index + 1] });
                      }}
                    >
                      {t(`weekday.${day}`, day)}
                    </button>
                  );
                })}
              </div>
            )}
          </Field>
          <Field
            label={trigger.every === 'hour' ? t('minute', 'At minute') : t('time', 'Time')}
            hint={
              trigger.every === 'hour'
                ? t('every-hour-hint', 'At the minute of the time below, every hour.')
                : undefined
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
      )}

      {trigger.kind === 'date' && (
        <DateTriggerSettings trigger={trigger} disabled={disabled} onChange={onChange} />
      )}

      {trigger.kind === 'manual' && (
        <>
          <AudienceEditor
            value={trigger.audience}
            disabled={disabled}
            onChange={(audience) => onChange({ ...trigger, audience })}
          />
          {onStartNow && (
            <Button variant="outline" className="w-full" onClick={onStartNow}>
              <IconHandFinger />
              {t('start-now', 'Start now')}
            </Button>
          )}
        </>
      )}
    </div>
  );
};
