import { type AutomationTrigger, type DataField, isAppEvent } from '@erxes/core-contract';
import { IconHandFinger } from '@tabler/icons-react';
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
  { kind: 'event', label: 'Event', hint: 'When something happens', comingSoon: false },
  {
    kind: 'schedule',
    label: 'Schedule',
    hint: 'Every few minutes, hours, days, weeks or months',
    comingSoon: false,
  },
  { kind: 'date', label: 'Date', hint: 'Before or after a record’s date', comingSoon: false },
  { kind: 'manual', label: 'Manual', hint: 'You start it on chosen records', comingSoon: false },
  {
    kind: 'webhook',
    label: 'Webhook',
    hint: 'When another system calls its address',
    comingSoon: false,
  },
  {
    kind: 'app',
    label: 'App',
    hint: 'When a connected app reports something',
    comingSoon: true,
  },
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
    <Tooltip.Provider delay={300}>
      <ChoiceboxGroup
        value={value}
        disabled={disabled}
        aria-label={t('trigger-type', 'Starts')}
        className="grid grid-cols-3"
        onValueChange={(next) => {
          const picked = KINDS.find((item) => item.kind === next);

          if (picked && !picked.comingSoon && picked.kind !== value)
            onChange(defaults(picked.kind));
        }}
      >
        {KINDS.map(({ kind, label, hint, comingSoon }) => (
          <ChoiceboxGroup.Item key={kind} value={kind} disabled={Boolean(disabled) || comingSoon}>
            <Tooltip>
              <Tooltip.Trigger render={<span className="flex w-full items-center" />}>
                <TriggerIcon kind={kind} className="mr-2 size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{t(`trigger-${kind}-title`, label)}</span>
                {comingSoon && (
                  <Badge variant="muted" size="sm" className="ml-1 shrink-0">
                    {t('coming-soon-short', 'Soon')}
                  </Badge>
                )}
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom" className="max-w-56 whitespace-normal">
                {comingSoon && (
                  <span className="block font-medium">{t('coming-soon', 'Coming soon')}</span>
                )}
                {t(`trigger-${kind}-hint`, hint)}
              </Tooltip.Content>
            </Tooltip>
          </ChoiceboxGroup.Item>
        ))}
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
}: {
  trigger: AutomationTrigger;
  events: Catalog['triggers'];
  apps: Catalog['apps'];
  hook: Hook;
  onChange: (trigger: AutomationTrigger) => void;
  disabled?: boolean;
  onStartNow?: () => void;
}) => {
  const { t } = useTranslation('automations');

  return (
    <div className="space-y-5">
      <KindPicker value={trigger.kind} disabled={disabled} onChange={onChange} />

      {trigger.kind === 'event' && (
        <EventTriggerSettings
          trigger={trigger}
          events={events.filter((event) => !isAppEvent(event.type))}
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
