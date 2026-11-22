import type { AutomationTrigger, DataField } from '@erxes/core-contract';
import { IconHandFinger } from '@tabler/icons-react';
import { Badge, Button, ChoiceboxGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TriggerIcon } from '../TemplatePicker';
import { CatalogPicker } from './CatalogPicker';
import { ConditionsEditor } from './ConditionsEditor';
import { DateTriggerSettings } from './DateTriggerSettings';
import { EventDataHint } from './EventDataHint';
import { eventDataFields } from './flowChecks';
import { RecordPicks } from './RecordPicks';
import { joinPicks, splitPicks } from './pickRules';
import { ScheduleTriggerSettings } from './ScheduleTriggerSettings';
import { AudienceEditor, Field } from './triggerFields';
import { type Hook, WebhookTriggerSettings } from './WebhookTriggerSettings';

const KINDS = [
  { kind: 'event', label: 'Event', hint: 'When something happens' },
  { kind: 'schedule', label: 'Schedule', hint: 'Every few minutes, hours, days, weeks or months' },
  { kind: 'date', label: 'Date', hint: 'Before or after a record’s date' },
  { kind: 'manual', label: 'Manual', hint: 'You start it on chosen records' },
  { kind: 'webhook', label: 'Webhook', hint: 'When another system calls its address' },
] as const;

const defaults = (kind: AutomationTrigger['kind']): AutomationTrigger => {
  switch (kind) {
    case 'event':
      return { kind, event: 'core.customer.created' };
    case 'schedule':
      return { kind, every: 'day', at: '09:00' };
    case 'date':
      return {
        kind,
        subject: 'customer',
        field: 'birthDate',
        offsetDays: 0,
        yearly: true,
        at: '09:00',
      };
    case 'webhook':
      return { kind };
    case 'manual':
      return { kind, audience: { type: 'customer' } };
  }
};

type EventInfo = {
  type: string;
  label: string;
  description?: string | null;
  source: string;
  subject: 'customer' | 'company' | null;
  fields?: DataField[];
  seen?: boolean;
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
    <ChoiceboxGroup
      value={value}
      disabled={disabled}
      className="grid grid-cols-2"
      onValueChange={(next) => {
        const kind = KINDS.find((item) => item.kind === next)?.kind;

        if (kind && kind !== value) onChange(defaults(kind));
      }}
    >
      {KINDS.map(({ kind, label, hint }) => (
        <ChoiceboxGroup.Item key={kind} value={kind} disabled={disabled}>
          <span className="flex items-start gap-2">
            <TriggerIcon kind={kind} className="mt-0.5 size-4 shrink-0" />
            <span className="min-w-0">
              <span className="block">{t(`trigger-${kind}-title`, label)}</span>
              <span className="block text-xs font-normal text-muted-foreground">
                {t(`trigger-${kind}-hint`, hint)}
              </span>
            </span>
          </span>
        </ChoiceboxGroup.Item>
      ))}
    </ChoiceboxGroup>
  );
};

/** What steps can use from the event: its values by name, or why there are none yet. */
const EventData = ({ event }: { event: EventInfo }) => {
  const { t } = useTranslation('automations');
  const fields = (event.fields ?? []).filter((field) => !field.recordType);

  // Core's customer and company events carry that record, which steps use as the record.
  if (!fields.length && event.source === 'core' && event.subject) return null;

  if (!fields.length && event.fields?.length) return null;

  return (
    <Field label={t('event-data', 'What steps can use from it')}>
      {fields.length ? (
        <div className="flex flex-wrap gap-1.5">
          {fields.map((field) => (
            <Badge key={field.key} variant="secondary">
              {field.label}
            </Badge>
          ))}
        </div>
      ) : (
        <EventDataHint event={event} subject={event.subject} />
      )}
    </Field>
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
  const started = events.find((event) => event.type === trigger.event);
  const eventFields = eventDataFields(started);
  const recordFields = eventFields.filter((field) => field.recordType && field.source);

  const { picks, rest } = splitPicks(
    trigger.conditions,
    recordFields.map((field) => field.path),
  );

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
      <RecordPicks
        fields={recordFields}
        picks={picks}
        disabled={disabled}
        onChange={(next) => onChange({ ...trigger, conditions: joinPicks(next, rest) })}
      />
      {started && <EventData event={started} />}
      <Field
        label={t('only-if', 'Only if')}
        hint={
          rest?.rules.length
            ? undefined
            : t('only-if-empty', 'No conditions: every such event starts a run.')
        }
      >
        <ConditionsEditor
          subject={started?.subject ?? null}
          extraFields={eventFields.filter((field) => !recordFields.includes(field))}
          value={rest}
          disabled={disabled}
          onChange={(conditions) =>
            onChange({ ...trigger, conditions: joinPicks(picks, conditions) })
          }
        />
      </Field>
    </>
  );
};

/** The trigger: an event, a schedule, a date on each record, a manual start, or a webhook. */
export const TriggerEditor = ({
  trigger,
  events,
  hook,
  onChange,
  disabled,
  onStartNow,
}: {
  trigger: AutomationTrigger;
  events: EventInfo[];
  hook: Hook;
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
      {trigger.kind === 'webhook' && (
        <WebhookTriggerSettings
          trigger={trigger}
          hook={hook}
          disabled={disabled}
          onChange={onChange}
        />
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
