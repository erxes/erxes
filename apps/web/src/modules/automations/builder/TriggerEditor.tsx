import { type AutomationTrigger, type DataField, isAppEvent } from '@erxes/core-contract';
import { IconAlertTriangle, IconHandFinger } from '@tabler/icons-react';
import { Badge, Button, ChoiceboxGroup, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { Catalog } from '../automationQueries';
import { TriggerIcon } from '../TemplatePicker';
import { AppTriggerSettings } from './AppTriggerSettings';
import { CatalogPicker } from './CatalogPicker';
import { ConditionsEditor } from './ConditionsEditor';
import { DateTriggerSettings } from './DateTriggerSettings';
import { EventDataHint } from './EventDataHint';
import { Field } from './Field';
import { eventDataFields } from './flowChecks';
import { RecordPicks } from './RecordPicks';
import { joinPicks, splitPicks } from './pickRules';
import { ScheduleTriggerSettings } from './ScheduleTriggerSettings';
import { AudienceEditor } from './triggerFields';
import { type Hook, WebhookTriggerSettings } from './WebhookTriggerSettings';

const KINDS = [
  { kind: 'event', label: 'Event', hint: 'When something happens' },
  { kind: 'schedule', label: 'Schedule', hint: 'Every few minutes, hours, days, weeks or months' },
  { kind: 'date', label: 'Date', hint: 'Before or after a record’s date' },
  { kind: 'manual', label: 'Manual', hint: 'You start it on chosen records' },
  { kind: 'webhook', label: 'Webhook', hint: 'When another system calls its address' },
  { kind: 'app', label: 'App', hint: 'When a connected app reports something' },
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
    case 'app':
      return { kind, app: '', trigger: '', connectionId: '', params: {} };
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

type CostOf = (trigger: AutomationTrigger) => string;

const KindPicker = ({
  value,
  onChange,
  disabled,
  costOf,
}: {
  value: AutomationTrigger['kind'];
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
  costOf?: CostOf;
}) => {
  const { t } = useTranslation('automations');

  return (
    <Tooltip.Provider delay={300}>
      <ChoiceboxGroup
        value={value}
        disabled={disabled}
        aria-label={t('trigger-type', 'Starts')}
        className="grid grid-cols-3"
        onValueChange={(next) => {
          const kind = KINDS.find((item) => item.kind === next)?.kind;

          if (kind && kind !== value) onChange(defaults(kind));
        }}
      >
        {KINDS.map(({ kind, label, hint }) => {
          const cost = kind === value ? '' : costOf?.(defaults(kind));

          return (
            <ChoiceboxGroup.Item key={kind} value={kind} disabled={disabled}>
              <Tooltip>
                <Tooltip.Trigger render={<span className="flex w-full items-center" />}>
                  <TriggerIcon kind={kind} className="mr-2 size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">
                    {t(`trigger-${kind}-title`, label)}
                  </span>
                  {cost && (
                    <IconAlertTriangle
                      aria-label={cost}
                      className="ml-1 size-3.5 shrink-0 text-warning-text"
                    />
                  )}
                </Tooltip.Trigger>
                <Tooltip.Content side="bottom" className="max-w-56 whitespace-normal">
                  {t(`trigger-${kind}-hint`, hint)}
                  {cost && <span className="block text-warning">{cost}</span>}
                </Tooltip.Content>
              </Tooltip>
            </ChoiceboxGroup.Item>
          );
        })}
      </ChoiceboxGroup>
    </Tooltip.Provider>
  );
};

/** What steps can use from the event: its values by name, or why there are none yet. */
const EventData = ({ event }: { event: EventInfo }) => {
  const { t } = useTranslation('automations');
  const fields = (event.fields ?? []).filter((field) => !field.recordType);
  const waiting = event.source !== 'core' && !event.seen && !event.fields?.length;

  if (!fields.length && !waiting) return null;

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
  costOf,
}: {
  trigger: Extract<AutomationTrigger, { kind: 'event' }>;
  events: EventInfo[];
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
  costOf?: CostOf;
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
          items={events.map((event) => ({
            ...event,
            warning:
              event.type === trigger.event ? '' : costOf?.({ kind: 'event', event: event.type }),
          }))}
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
      <Field label={t('only-if', 'Only if')}>
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
  apps,
  hook,
  onChange,
  disabled,
  onStartNow,
  costOf,
}: {
  trigger: AutomationTrigger;
  events: Catalog['triggers'];
  apps: Catalog['apps'];
  hook: Hook;
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
  onStartNow?: () => void;
  costOf?: CostOf;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="space-y-5">
      <KindPicker value={trigger.kind} disabled={disabled} onChange={onChange} costOf={costOf} />

      {trigger.kind === 'event' && (
        <EventTriggerSettings
          trigger={trigger}
          events={events.filter((event) => !isAppEvent(event.type))}
          disabled={disabled}
          onChange={onChange}
          costOf={costOf}
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
      {trigger.kind === 'app' && (
        <AppTriggerSettings
          trigger={trigger}
          catalog={{ apps, triggers: events }}
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
