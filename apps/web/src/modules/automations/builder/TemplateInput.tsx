import {
  IconBolt,
  IconBraces,
  IconBuilding,
  IconClock,
  IconRoute,
  IconUser,
} from '@tabler/icons-react';
import { Button, Command, InputGroup, Popover } from 'erxes-ui';
import { type ReactNode, useContext, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BuilderContext, type StartingEvent } from './BuilderContext';
import { readableTemplate } from './flowText';
import type { FieldInfo } from './useAutomationFields';

/** "Order" reads "order" in "The order"; "POS order" keeps its capitals. */
const inSentence = (noun: string) =>
  /^[A-Z][a-z]/.test(noun) ? noun.charAt(0).toLowerCase() + noun.slice(1) : noun;

/** The trigger's own values, under what it is about ("The order"), or why there are none. */
const TriggerGroup = ({
  trigger,
  fields,
  hasSubject,
  onPick,
}: {
  trigger: StartingEvent | undefined;
  fields: FieldInfo[];
  hasSubject: boolean;
  onPick: (path: string) => void;
}) => {
  const { t } = useTranslation('automations');

  // Core's customer and company events carry that record, listed below as the record.
  if (!trigger || (!fields.length && trigger.source === 'core' && hasSubject)) return null;

  const heading = trigger.record
    ? t('the-record', 'The {{record}}', { record: inSentence(trigger.record) })
    : trigger.label;

  return (
    <Command.Group heading={heading}>
      {fields.length ? (
        fields.map((field) => (
          <Command.Item
            key={field.path}
            value={`${field.label} ${field.path}`}
            onSelect={() => onPick(field.path)}
          >
            <IconBolt className="text-muted-foreground" />
            <span className="truncate">{field.label}</span>
          </Command.Item>
        ))
      ) : (
        <p className="px-2 py-1.5 text-xs text-muted-foreground">
          {t('trigger-no-data', 'No data shared yet')}
        </p>
      )}
    </Command.Group>
  );
};

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
  const record = hasSubject ? fields.filter((field) => field.path.startsWith('subject.')) : [];
  const own = fields.filter((field) => field.path.startsWith('event.payload.'));
  const steps = fields.filter((field) => field.path.startsWith('steps.'));
  const RecordIcon = subject === 'company' ? IconBuilding : IconUser;

  return (
    <Command loop>
      <Command.Input placeholder={t('insert-data-search', 'Search data…')} />
      <Command.List className="max-h-72">
        <Command.Empty>{t('catalog-empty', 'Nothing matches')}</Command.Empty>
        <TriggerGroup trigger={trigger} fields={own} hasSubject={hasSubject} onPick={onPick} />
        {record.length > 0 && (
          <Command.Group
            heading={
              subject === 'company'
                ? t('the-company', 'The company')
                : t('the-customer', 'The customer')
            }
          >
            {record.map((field) => (
              <Command.Item
                key={field.path}
                value={`${field.label} ${field.path}`}
                onSelect={() => onPick(field.path)}
              >
                <RecordIcon className="text-muted-foreground" />
                <span className="truncate">{field.label.replace(/ \(custom\)$/, '')}</span>
                {field.path.startsWith('subject.customFields.') && (
                  <span className="ml-auto shrink-0 text-3xs text-muted-foreground">
                    {t('custom', 'Custom')}
                  </span>
                )}
              </Command.Item>
            ))}
          </Command.Group>
        )}
        {steps.length > 0 && (
          <Command.Group heading={t('earlier-steps', 'Earlier steps')}>
            {steps.map((field) => (
              <Command.Item
                key={field.path}
                value={`${field.label} ${field.path}`}
                onSelect={() => onPick(field.path)}
              >
                <IconRoute className="text-muted-foreground" />
                <span className="truncate">{field.label}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}
        <Command.Group heading={t('other-data', 'Other')}>
          <Command.Item value="now current time date" onSelect={() => onPick('now | date')}>
            <IconClock className="text-muted-foreground" />
            {t('today-date', "Today's date")}
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command>
  );
};

/** The `{ }` button that opens the data picker. */
const InsertData = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) => {
  const { t } = useTranslation('automations');

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger
        title={t('insert-data', 'Insert data')}
        aria-label={t('insert-data', 'Insert data')}
        render={<Button variant="ghost" size="icon" tone="muted" className="size-6" />}
      >
        <IconBraces className="size-4" />
      </Popover.Trigger>
      <Popover.Content
        align="end"
        sideOffset={6}
        collisionPadding={12}
        variant="flush"
        className="w-72"
      >
        {children}
      </Popover.Content>
    </Popover>
  );
};

/**
 * Text an action sends or saves, with the run's data dropped in: the "Insert
 * data" button lists the record's fields, earlier steps' results and the
 * time, and puts `{{path}}` where the caret is (as Zapier's and HubSpot's
 * data pickers do). Typing `{{…}}` by hand still works.
 */
export const TemplateInput = ({
  value,
  onChange,
  fields,
  subject,
  multiline,
  placeholder,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  /** The record's fields and earlier steps' outputs. */
  fields: FieldInfo[];
  subject: 'customer' | 'company';
  multiline?: boolean;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
}) => {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false);

  const insert = (path: string) => {
    const element = ref.current;
    // The caret (or selection) is kept by the field while the picker is open.
    const start = element?.selectionStart ?? value.length;
    const end = element?.selectionEnd ?? value.length;
    // "Welcome!" + first name reads "Welcome! {{…}}", not "Welcome!{{…}}".
    const spaced = start > 0 && !/[\s([{"'«/@-]$/.test(value.slice(0, start));
    const token = `${spaced ? ' ' : ''}{{${path}}}`;

    onChange(value.slice(0, start) + token + value.slice(end));
    setOpen(false);
    requestAnimationFrame(() => {
      element?.focus();
      element?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const shared = {
    ref,
    value,
    placeholder,
    disabled,
    'aria-invalid': invalid ? true : undefined,
    onChange: (event: { target: { value: string } }) => onChange(event.target.value),
  };

  // `{{steps.x1.output.dealId}}` means little: say what each placeholder is.
  const readable = readableTemplate(value, fields);

  return (
    <div className="space-y-1">
      <InputGroup>
        {multiline ? (
          <InputGroup.Textarea {...shared} rows={4} />
        ) : (
          <InputGroup.Input {...shared} />
        )}
        {!disabled && (
          <InputGroup.Addon align="end">
            <InsertData open={open} onOpenChange={setOpen}>
              <DataPicker fields={fields} subject={subject} onPick={insert} />
            </InsertData>
          </InputGroup.Addon>
        )}
      </InputGroup>
      {readable !== value && (
        <p className="truncate text-xs text-muted-foreground" title={readable}>
          {readable}
        </p>
      )}
    </div>
  );
};
