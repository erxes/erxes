import {
  IconBolt,
  IconBuilding,
  IconClock,
  IconRoute,
  IconUser,
  IconVariablePlus,
} from '@tabler/icons-react';
import { Button, Command, Popover } from 'erxes-ui';
import { type ComponentType, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { BuilderContext, type StartingEvent } from './BuilderContext';
import { EventDataHint } from './EventDataHint';
import type { FieldInfo } from './useAutomationFields';

/** "Order" reads "order" in "The order"; "POS order" keeps its capitals. */
const inSentence = (noun: string) =>
  /^[A-Z][a-z]/.test(noun) ? noun.charAt(0).toLowerCase() + noun.slice(1) : noun;

/** One value to insert: what it is, in a row large enough to scan and tap. */
const DataRow = ({
  icon: Icon,
  label,
  path,
  note,
  onPick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  path: string;
  note?: string;
  onPick: (path: string) => void;
}) => (
  <Command.Item value={`${label} ${path}`} onSelect={() => onPick(path)} variant="tile">
    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
      <Icon className="size-3.5" />
    </span>
    <span className="min-w-0 flex-1 truncate">{label}</span>
    {note && <span className="shrink-0 text-3xs text-muted-foreground">{note}</span>}
  </Command.Item>
);

/** The trigger's own values, under what it is about ("The order"), or why there are none. */
const TriggerGroup = ({
  trigger,
  fields,
  hasSubject,
  subject,
  onPick,
}: {
  trigger: StartingEvent | undefined;
  fields: FieldInfo[];
  hasSubject: boolean;
  subject: 'customer' | 'company';
  onPick: (path: string) => void;
}) => {
  const { t } = useTranslation('automations');

  // Core's customer and company events carry that record, listed below as the record.
  if (!trigger && !fields.length) return null;

  if (trigger && !fields.length && trigger.source === 'core' && hasSubject) return null;

  const heading = trigger?.record
    ? t('the-record', 'The {{record}}', { record: inSentence(trigger.record) })
    : (trigger?.label ?? fields[0]?.groupLabel ?? t('trigger-data', 'From the trigger'));

  return (
    <Command.Group heading={heading}>
      {fields.length
        ? fields.map((field) => (
            <DataRow
              key={field.path}
              icon={IconBolt}
              label={field.label}
              path={field.path}
              onPick={onPick}
            />
          ))
        : trigger && (
            <div className="px-2 py-1.5">
              <EventDataHint event={trigger} subject={hasSubject ? subject : null} compact />
            </div>
          )}
    </Command.Group>
  );
};

/** The event's values to insert: a plugin's record ids are picked, not inserted as text. */
const isEventText = (field: FieldInfo) =>
  field.path.startsWith('event.payload.') && !(field.recordType && field.source);

/**
 * What a step can insert, searchable: the trigger's own values first, then the customer or
 * company runs are about, then earlier steps' results, then the time.
 */
const DataPicker = ({
  fields,
  subject,
  onPick,
}: {
  fields: FieldInfo[];
  subject: 'customer' | 'company';
  onPick: (path: string) => void;
}) => {
  const { t } = useTranslation('automations');
  const { trigger, hasSubject } = useContext(BuilderContext);

  // Only what the record itself holds: not a measure of related records, nor its company's.
  const record = hasSubject
    ? fields.filter((field) => field.path.startsWith('subject.') && !field.conditionsOnly)
    : [];

  const own = fields.filter(isEventText);
  const steps = fields.filter((field) => field.path.startsWith('steps.'));
  const RecordIcon = subject === 'company' ? IconBuilding : IconUser;

  return (
    <Command loop>
      <Command.Input placeholder={t('insert-data-search', 'Search data…')} />
      <Command.List className="max-h-80">
        <Command.Empty>{t('catalog-empty', 'Nothing matches')}</Command.Empty>
        <TriggerGroup
          trigger={trigger}
          fields={own}
          hasSubject={hasSubject}
          subject={subject}
          onPick={onPick}
        />
        {record.length > 0 && (
          <Command.Group
            heading={
              subject === 'company'
                ? t('the-company', 'The company')
                : t('the-customer', 'The customer')
            }
          >
            {record.map((field) => (
              <DataRow
                key={field.path}
                icon={RecordIcon}
                label={field.label}
                path={field.path}
                note={
                  field.path.startsWith('subject.customFields.') ? t('custom', 'Custom') : undefined
                }
                onPick={onPick}
              />
            ))}
          </Command.Group>
        )}
        {steps.length > 0 && (
          <Command.Group heading={t('earlier-steps', 'Earlier steps')}>
            {steps.map((field) => (
              <DataRow
                key={field.path}
                icon={IconRoute}
                label={field.label}
                path={field.path}
                onPick={onPick}
              />
            ))}
          </Command.Group>
        )}
        <Command.Group heading={t('other-data', 'Other')}>
          <Command.Item
            value="now current time date"
            onSelect={() => onPick('now | date')}
            variant="tile"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <IconClock className="size-3.5" />
            </span>
            {t('today-date', "Today's date")}
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command>
  );
};

/**
 * The "Insert data" button that opens the data picker; `onPick` gets the path picked. `labelled`
 * shows its name next to the icon, for fields with room under the text.
 */
export const InsertData = ({
  fields,
  subject,
  onPick,
  open,
  onOpenChange,
  labelled,
}: {
  fields: FieldInfo[];
  subject: 'customer' | 'company';
  onPick: (path: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labelled?: boolean;
}) => {
  const { t } = useTranslation('automations');

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger
        title={t('insert-data', 'Insert data')}
        aria-label={labelled ? undefined : t('insert-data', 'Insert data')}
        render={
          labelled ? (
            <Button variant="ghost" size="sm" tone="muted" />
          ) : (
            <Button variant="ghost" size="icon" tone="muted" className="size-6" />
          )
        }
      >
        <IconVariablePlus className="size-4" />
        {labelled && t('insert-data', 'Insert data')}
      </Popover.Trigger>
      <Popover.Content
        aria-label={t('insert-data', 'Insert data')}
        align="end"
        sideOffset={6}
        collisionPadding={12}
        variant="flush"
        className="w-80"
      >
        <DataPicker
          fields={fields}
          subject={subject}
          onPick={(path) => {
            onPick(path);
            onOpenChange(false);
          }}
        />
      </Popover.Content>
    </Popover>
  );
};
