import type { AutomationTrigger, ConditionGroup } from '@erxes/core-contract';
import { IconBolt, IconCalendarEvent, IconClock, IconHandFinger } from '@tabler/icons-react';
import { Button, cn, Input, Label, Select, Switch } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ConditionsEditor } from './ConditionsEditor';
import { useAutomationFields } from './useAutomationFields';

const ZONES = ['Asia/Ulaanbaatar', 'Asia/Hovd', 'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'UTC'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const KINDS = [
  { kind: 'event', icon: IconBolt, label: 'When something happens' },
  { kind: 'schedule', icon: IconClock, label: 'On a schedule' },
  { kind: 'date', icon: IconCalendarEvent, label: 'Around a date' },
  { kind: 'manual', icon: IconHandFinger, label: 'When started by hand' },
] as const;

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
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span>{t('at', 'at')}</span>
      <Input type="time" className="w-28" value={at} disabled={disabled} onChange={(event) => onChange({ at: event.target.value })} />
      <Select value={timezone} disabled={disabled} onValueChange={(value) => onChange({ timezone: value })}>
        <Select.Trigger className="w-48">
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
    <div className="space-y-2 rounded-md bg-muted/40 p-3">
      <label className="flex items-center gap-2 text-sm">
        <Switch checked={Boolean(value)} disabled={disabled} onCheckedChange={(on) => onChange(on ? { type: 'customer' } : undefined)} />
        {t('for-each-record', 'Run for each matching record')}
      </label>
      {value && (
        <>
          <Select value={value.type} disabled={disabled} onValueChange={(type) => onChange({ type: type as 'customer' })}>
            <Select.Trigger className="w-40">
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
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {KINDS.map(({ kind, icon: Icon, label }) => (
          <button
            key={kind}
            type="button"
            disabled={disabled}
            onClick={() => trigger.kind !== kind && onChange(defaults(kind))}
            className={cn(
              'flex items-center gap-2 rounded-md border p-2 text-left text-sm hover:bg-muted',
              trigger.kind === kind && 'border-primary bg-primary/5 font-medium',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {t(`trigger-${kind}`, label)}
          </button>
        ))}
      </div>

      {trigger.kind === 'event' && (
        <>
          <Select value={trigger.event} disabled={disabled} onValueChange={(event) => onChange({ ...trigger, event })}>
            <Select.Trigger>
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
          <Label className="text-xs text-muted-foreground">{t('only-if', 'Only if')}</Label>
          <ConditionsEditor subject={subject} value={trigger.conditions} disabled={disabled} onChange={(conditions) => onChange({ ...trigger, conditions })} />
        </>
      )}

      {trigger.kind === 'schedule' && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>{t('every', 'Every')}</span>
            <Select value={trigger.every} disabled={disabled} onValueChange={(every) => onChange({ ...trigger, every: every as 'day' })}>
              <Select.Trigger className="w-32">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="hour">{t('every-hour', 'hour')}</Select.Item>
                <Select.Item value="day">{t('every-day', 'day')}</Select.Item>
                <Select.Item value="week">{t('every-week', 'week')}</Select.Item>
                <Select.Item value="month">{t('every-month', 'month')}</Select.Item>
              </Select.Content>
            </Select>
            {trigger.every === 'month' && (
              <>
                <span>{t('on-day', 'on day')}</span>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  className="w-20"
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
                  <Button
                    key={day}
                    size="sm"
                    variant={on ? 'default' : 'outline'}
                    disabled={disabled}
                    onClick={() => {
                      const current = trigger.weekdays ?? [1];
                      const next = on ? current.filter((item) => item !== index + 1) : [...current, index + 1].sort();

                      onChange({ ...trigger, weekdays: next.length ? next : [index + 1] });
                    }}
                  >
                    {t(`weekday.${day}`, day)}
                  </Button>
                );
              })}
            </div>
          )}
          {trigger.every !== 'hour' ? (
            <TimeAndZone at={trigger.at} timezone={trigger.timezone} disabled={disabled} onChange={(next) => onChange({ ...trigger, ...next })} />
          ) : (
            <p className="text-sm text-muted-foreground">{t('every-hour-hint', 'At the minute of the time below, every hour.')}</p>
          )}
          <AudienceEditor value={trigger.audience} disabled={disabled} onChange={(audience) => onChange({ ...trigger, audience })} />
        </>
      )}

      {trigger.kind === 'date' && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Input
              type="number"
              className="w-20"
              value={Math.abs(trigger.offsetDays)}
              disabled={disabled}
              onChange={(event) => onChange({ ...trigger, offsetDays: Math.sign(trigger.offsetDays || -1) * Math.min(365, Math.abs(Number(event.target.value) || 0)) })}
            />
            <span>{t('days', 'days')}</span>
            <Select
              value={trigger.offsetDays > 0 ? 'after' : trigger.offsetDays < 0 ? 'before' : 'on'}
              disabled={disabled}
              onValueChange={(when) => onChange({ ...trigger, offsetDays: when === 'on' ? 0 : (when === 'before' ? -1 : 1) * Math.max(1, Math.abs(trigger.offsetDays)) })}
            >
              <Select.Trigger className="w-28">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="before">{t('before', 'before')}</Select.Item>
                <Select.Item value="on">{t('on', 'on')}</Select.Item>
                <Select.Item value="after">{t('after', 'after')}</Select.Item>
              </Select.Content>
            </Select>
            <span>{t('the', 'the')}</span>
            <Select value={trigger.subject} disabled={disabled} onValueChange={(type) => onChange({ ...trigger, subject: type as 'customer', field: 'birthDate' })}>
              <Select.Trigger className="w-32">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="customer">{t('customer-s', "customer's")}</Select.Item>
                <Select.Item value="company">{t('company-s', "company's")}</Select.Item>
              </Select.Content>
            </Select>
            <Select value={trigger.field} disabled={disabled} onValueChange={(field) => onChange({ ...trigger, field })}>
              <Select.Trigger className="w-48">
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
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={trigger.yearly} disabled={disabled} onCheckedChange={(yearly) => onChange({ ...trigger, yearly })} />
            {t('yearly', 'Every year (birthdays, anniversaries)')}
          </label>
          <TimeAndZone at={trigger.at} timezone={trigger.timezone} disabled={disabled} onChange={(next) => onChange({ ...trigger, ...next })} />
          <Label className="text-xs text-muted-foreground">{t('only-if', 'Only if')}</Label>
          <ConditionsEditor subject={trigger.subject} value={trigger.conditions} disabled={disabled} onChange={(conditions) => onChange({ ...trigger, conditions })} />
        </>
      )}

      {trigger.kind === 'manual' && (
        <>
          <AudienceEditor value={trigger.audience} disabled={disabled} onChange={(audience) => onChange({ ...trigger, audience })} />
          {onStartNow && (
            <Button variant="outline" onClick={onStartNow}>
              <IconHandFinger />
              {t('start-now', 'Start now')}
            </Button>
          )}
        </>
      )}
    </div>
  );
};
