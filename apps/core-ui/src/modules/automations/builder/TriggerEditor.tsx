import type { AutomationTrigger } from '@erxes/core-contract';
import { IconBolt, IconCalendarEvent, IconClock, IconHandFinger } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CatalogPicker } from './CatalogPicker';
import { ConditionsEditor } from './ConditionsEditor';
import { DateTriggerSettings } from './DateTriggerSettings';
import { ScheduleTriggerSettings } from './ScheduleTriggerSettings';
import { AudienceEditor, Field } from './triggerFields';

const KINDS = [
  { kind: 'event', icon: IconBolt, label: 'Event', hint: 'When something happens' },
  { kind: 'schedule', icon: IconClock, label: 'Schedule', hint: 'Every hour, day, week or month' },
  { kind: 'date', icon: IconCalendarEvent, label: 'Date', hint: 'Before or after a record’s date' },
  { kind: 'manual', icon: IconHandFinger, label: 'Manual', hint: 'You start it on chosen records' },
] as const;

const defaults = (kind: AutomationTrigger['kind']): AutomationTrigger => {
  switch (kind) {
    case 'event':
      return { kind, event: 'core.customer.created' };
    case 'schedule':
      return { kind, every: 'day', at: '09:00', timezone: 'Asia/Ulaanbaatar' };
    case 'date':
      return {
        kind,
        subject: 'customer',
        field: 'birthDate',
        offsetDays: 0,
        yearly: true,
        at: '09:00',
        timezone: 'Asia/Ulaanbaatar',
      };
    default:
      return { kind: 'manual', audience: { type: 'customer' } };
  }
};

type EventInfo = {
  type: string;
  label: string;
  description?: string | null;
  source: string;
  subject: 'customer' | 'company' | null;
};

const KindPicker = ({
  value,
  onChange,
  disabled,
}: {
  value: AutomationTrigger['kind'];
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="grid auto-rows-fr grid-cols-2 gap-2">
      {KINDS.map(({ kind, icon: Icon, label, hint }) => (
        <button
          key={kind}
          type="button"
          disabled={disabled}
          aria-pressed={value === kind}
          onClick={() => value !== kind && onChange(defaults(kind))}
          className={cn(
            'flex min-w-0 items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors hover:bg-muted/60 disabled:opacity-60',
            value === kind &&
              'border-primary bg-primary/5 ring-1 ring-primary/20 hover:bg-primary/5',
          )}
        >
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground',
              value === kind && 'bg-primary text-primary-foreground',
            )}
          >
            <Icon className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium">{t(`trigger-${kind}-title`, label)}</span>
            <span className="line-clamp-2 block text-xs leading-snug text-muted-foreground">
              {t(`trigger-${kind}-hint`, hint)}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
};

const EventTriggerSettings = ({
  trigger,
  events,
  onChange,
  disabled,
}: {
  trigger: Extract<AutomationTrigger, { kind: 'event' }>;
  events: EventInfo[];
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');

  return (
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
          subject={events.find((event) => event.type === trigger.event)?.subject ?? null}
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
  events: EventInfo[];
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
  onStartNow?: () => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="space-y-5">
      <Field label={t('trigger-type', 'Starts')}>
        <KindPicker value={trigger.kind} disabled={disabled} onChange={onChange} />
      </Field>
      {trigger.kind === 'event' && (
        <EventTriggerSettings
          trigger={trigger}
          events={events}
          disabled={disabled}
          onChange={onChange}
        />
      )}
      {trigger.kind === 'schedule' && (
        <ScheduleTriggerSettings trigger={trigger} disabled={disabled} onChange={onChange} />
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
