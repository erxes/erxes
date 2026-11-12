import { IconBraces, IconBuilding, IconClock, IconRoute, IconUser } from '@tabler/icons-react';
import { cn, Command, Input, Popover, Textarea } from 'erxes-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FieldInfo } from './useAutomationFields';

/** The record's fields, earlier steps' results and the time, searchable. */
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
  const record = fields.filter((field) => field.path.startsWith('subject.'));
  const steps = fields.filter((field) => field.path.startsWith('steps.'));
  const RecordIcon = subject === 'company' ? IconBuilding : IconUser;

  return (
    <Command loop>
      <Command.Input placeholder={t('insert-data-search', 'Search data…')} />
      <Command.List className="max-h-72">
        <Command.Empty>{t('catalog-empty', 'Nothing matches')}</Command.Empty>
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
                  <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
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
  const { t } = useTranslation('automations');

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

  return (
    <div className="relative">
      {multiline ? (
        <Textarea {...shared} rows={4} className="pr-10" />
      ) : (
        <Input {...shared} className="pr-10" />
      )}
      {!disabled && (
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              title={t('insert-data', 'Insert data')}
              aria-label={t('insert-data', 'Insert data')}
              className={cn(
                'absolute right-1.5 flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground',
                multiline ? 'top-1.5' : 'top-1/2 -translate-y-1/2',
              )}
            >
              <IconBraces className="size-4" />
            </button>
          </Popover.Trigger>
          <Popover.Content align="end" sideOffset={6} collisionPadding={12} className="w-72 p-0">
            <DataPicker fields={fields} subject={subject} onPick={insert} />
          </Popover.Content>
        </Popover>
      )}
    </div>
  );
};
