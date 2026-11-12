import type { AutomationTrigger, ConditionGroup } from '@erxes/core-contract';
import { IconBolt, IconCalendarEvent, IconClock, IconHandFinger } from '@tabler/icons-react';
import { Button, cn, Input, Select, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ConditionsEditor } from './ConditionsEditor';
import { useAutomationFields } from './useAutomationFields';

const ZONES = ['Asia/Ulaanbaatar', 'Asia/Hovd', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'UTC'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const KINDS = [
  { kind: 'event', icon: IconBolt, label: 'Event', hint: 'When something happens' },
  { kind: 'schedule', icon: IconClock, label: 'Schedule', hint: 'Every hour, day, week or month' },
  { kind: 'date', icon: IconCalendarEvent, label: 'Date', hint: 'Before or after a record’s date' },
  { kind: 'manual', icon: IconHandFinger, label: 'Manual', hint: 'You start it on chosen records' },
] as const;

/** One labelled setting of the trigger. */
const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
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
        ? { kind, subject: 'customer', field: 'birthDate', offsetDays: 0, yearly: true, at: '09:00', timezone: 'Asia/Ulaanbaatar' }
        : { kind: 'manual', audience: { type: 'customer' } };

const TimeAndZone = ({ at, timezone, onChange, disabled }: { at: string; timezone: string; onChange: (next: { at?: string; timezone?: string }) => void; disabled?: boolean }) => {
  const { t } = useTranslation('automations');

  return (
    <div className="flex items-center gap-2">
      <Input type="time" className="h-8 w-28 shrink-0" value={at} disabled={disabled} onChange={(event) => onChange({ at: event.target.value })} aria-label={t('at', 'at')} />
      <Select value={timezone} disabled={disabled} onValueChange={(value) => onChange({ timezone: value })}>
        <Select.Trigger className="h-8 min-w-0 flex-1">
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {(ZONES.includes(timezone) ? ZONES : [timezone, ...ZONES]).map((zone) => (
            <Select.Item key={zone} value={zone}>
              {zone}
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
  onChange: (next: { type: 'customer' | 'company'; conditions?: ConditionGroup } | undefined) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Switch checked={Boolean(value)} disabled={disabled} onCheckedChange={(on) => onChange(on ? { type: 'customer' } : undefined)} />
        {t('for-each-record', 'Run for each matching record')}
      </label>
      {value && (
        <>
          <Select value={value.type} disabled={disabled} onValueChange={(type) => onChange({ type: type as 'customer' })}>
            <Select.Trigger className="h-8 w-full">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="customer">{t('customers', 'Customers')}</Select.Item>
              <Select.Item value="company">{t('companies', 'Companies')}</Select.Item>
            </Select.Content>
          </Select>
          <ConditionsEditor subject={value.type} value={value.conditions} disabled={disabled} onChange={(conditions) => onChange({ ...value, conditions })} />
          <p className="text-xs text-muted-foreground">{t('audience-hint', 'Up to 10,000 records a run; re-entry rules apply.')}</p>
        </>
      )}
    </div>
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
  events: { type: string; label: string; source: string; subject: 'customer' | 'company' | null }[];
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
  onStartNow?: () => void;
}) => {
  const { t } = useTranslation('automations');
  const subject = trigger.kind === 'event' ? (events.find((event) => event.type === trigger.event)?.subject ?? null) : trigger.kind === 'date' ? trigger.subject : null;
  const dateFields = useAutomationFields(trigger.kind === 'date' ? trigger.subject : null).filter((field) => field.type === 'date' && field.path !== 'subject.createdAt');

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
                trigger.kind === kind && 'border-primary bg-primary/5 ring-1 ring-primary/20 hover:bg-primary/5',
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
                <span className="block text-sm font-medium">{t(`trigger-${kind}-title`, label)}</span>
                <span className="line-clamp-2 block text-xs leading-snug text-muted-foreground">{t(`trigger-${kind}-hint`, hint)}</span>
              </span>
            </button>
          ))}
        </div>
      </Field>

      {trigger.kind === 'event' && (
        <>
          <Field label={t('event', 'Event')}>
            <Select value={trigger.event} disabled={disabled} onValueChange={(event) => onChange({ ...trigger, event })}>
              <Select.Trigger className="h-8 w-full">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {events.map((item) => (
                  <Select.Item key={item.type} value={item.type}>
                    {item.label}
                    {item.source !== 'core' ? ` (${item.source})` : ''}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </Field>
          <Field label={t('only-if', 'Only if')} hint={trigger.conditions?.rules.length ? undefined : t('only-if-empty', 'No conditions: every such event starts a run.')}>
            <ConditionsEditor subject={subject} value={trigger.conditions} disabled={disabled} onChange={(conditions) => onChange({ ...trigger, conditions })} />
          </Field>
        </>
      )}

      {trigger.kind === 'schedule' && (
        <>
          <Field label={t('repeats', 'Repeats')}>
            <div className="flex items-center gap-2">
              <Select value={trigger.every} disabled={disabled} onValueChange={(every) => onChange({ ...trigger, every: every as 'day' })}>
                <Select.Trigger className="h-8 min-w-0 flex-1">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="hour">{t('every-hour-option', 'Every hour')}</Select.Item>
                  <Select.Item value="day">{t('every-day-option', 'Every day')}</Select.Item>
                  <Select.Item value="week">{t('every-week-option', 'Every week')}</Select.Item>
                  <Select.Item value="month">{t('every-month-option', 'Every month')}</Select.Item>
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
                    onChange={(event) => onChange({ ...trigger, dayOfMonth: Math.min(31, Math.max(1, Number(event.target.value) || 1)) })}
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
                        on ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
                      )}
                      onClick={() => {
                        const current = trigger.weekdays ?? [1];
                        const next = on ? current.filter((item) => item !== index + 1) : [...current, index + 1].sort();

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
          <Field label={trigger.every === 'hour' ? t('minute', 'At minute') : t('time', 'Time')} hint={trigger.every === 'hour' ? t('every-hour-hint', 'At the minute of the time below, every hour.') : undefined}>
            <TimeAndZone at={trigger.at} timezone={trigger.timezone} disabled={disabled} onChange={(next) => onChange({ ...trigger, ...next })} />
          </Field>
          <AudienceEditor value={trigger.audience} disabled={disabled} onChange={(audience) => onChange({ ...trigger, audience })} />
        </>
      )}

      {trigger.kind === 'date' && (
        <>
          <Field label={t('date-field', 'Date')}>
            <div className="grid grid-cols-2 gap-2">
              <Select value={trigger.subject} disabled={disabled} onValueChange={(type) => onChange({ ...trigger, subject: type as 'customer', field: 'birthDate' })}>
                <Select.Trigger className="h-8 w-full">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="customer">{t('customer-s', "customer's")}</Select.Item>
                  <Select.Item value="company">{t('company-s', "company's")}</Select.Item>
                </Select.Content>
              </Select>
              <Select value={trigger.field} disabled={disabled} onValueChange={(field) => onChange({ ...trigger, field })}>
                <Select.Trigger className="h-8 w-full">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {dateFields.map((field) => (
                    <Select.Item key={field.path} value={field.path === 'subject.birthDate' ? 'birthDate' : field.path.replace('subject.customFields.', '')}>
                      {field.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </Field>
          <Field label={t('when', 'When')}>
            <div className="flex items-center gap-2">
              <Select
                value={trigger.offsetDays > 0 ? 'after' : trigger.offsetDays < 0 ? 'before' : 'on'}
                disabled={disabled}
                onValueChange={(when) => onChange({ ...trigger, offsetDays: when === 'on' ? 0 : (when === 'before' ? -1 : 1) * Math.max(1, Math.abs(trigger.offsetDays)) })}
              >
                <Select.Trigger className="h-8 min-w-0 flex-1">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="before">{t('days-before', 'Days before')}</Select.Item>
                  <Select.Item value="on">{t('on-the-day', 'On the day')}</Select.Item>
                  <Select.Item value="after">{t('days-after', 'Days after')}</Select.Item>
                </Select.Content>
              </Select>
              {trigger.offsetDays !== 0 && (
                <Input
                  type="number"
                  className="h-8 w-20 shrink-0"
                  value={Math.abs(trigger.offsetDays)}
                  disabled={disabled}
                  onChange={(event) => onChange({ ...trigger, offsetDays: Math.sign(trigger.offsetDays || -1) * Math.min(365, Math.max(1, Math.abs(Number(event.target.value) || 1))) })}
                  aria-label={t('days', 'days')}
                />
              )}
            </div>
            <label className="flex items-center gap-2 pt-1 text-sm">
              <Switch checked={trigger.yearly} disabled={disabled} onCheckedChange={(yearly) => onChange({ ...trigger, yearly })} />
              {t('yearly', 'Every year (birthdays, anniversaries)')}
            </label>
          </Field>
          <Field label={t('time', 'Time')}>
            <TimeAndZone at={trigger.at} timezone={trigger.timezone} disabled={disabled} onChange={(next) => onChange({ ...trigger, ...next })} />
          </Field>
          <Field label={t('only-if', 'Only if')}>
            <ConditionsEditor subject={trigger.subject} value={trigger.conditions} disabled={disabled} onChange={(conditions) => onChange({ ...trigger, conditions })} />
          </Field>
        </>
      )}

      {trigger.kind === 'manual' && (
        <>
          <AudienceEditor value={trigger.audience} disabled={disabled} onChange={(audience) => onChange({ ...trigger, audience })} />
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
