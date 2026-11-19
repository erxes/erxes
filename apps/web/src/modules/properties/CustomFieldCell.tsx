import type { CustomValue, Field } from '@erxes/core-contract';
import { IconCheck } from '@tabler/icons-react';
import {
  Badge,
  Checkbox,
  Command,
  DateField,
  PopoverScoped,
  RecordTableInlineCell,
  TextField,
  useFormat,
} from 'erxes-ui';
import { useState } from 'react';

const OptionsCell = ({
  field,
  value,
  scope,
  onSave,
}: {
  field: Field;
  value: string[];
  scope: string;
  onSave: (value: CustomValue | null) => void;
}) => {
  const multiple = field.type === 'multiselect' || field.type === 'check';
  const [open, setOpen] = useState(false);

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger>
        <span className="flex min-w-0 gap-1 overflow-hidden">
          {value.map((option) => (
            <Badge key={option} variant="secondary" className="shrink-0">
              {option}
            </Badge>
          ))}
        </span>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="w-56">
        <Command>
          <Command.Input placeholder={`Search ${field.label.toLowerCase()}`} />
          <Command.List className="max-h-72">
            {field.options.map((option) => {
              const selected = value.includes(option);

              return (
                <Command.Item
                  key={option}
                  value={option}
                  onSelect={() => {
                    if (multiple) {
                      onSave(
                        selected ? value.filter((item) => item !== option) : [...value, option],
                      );
                    } else {
                      setOpen(false);
                      onSave(selected ? null : option);
                    }
                  }}
                >
                  <span className="flex-1 truncate">{option}</span>
                  {selected && <IconCheck className="size-4 text-primary-text" />}
                </Command.Item>
              );
            })}
          </Command.List>
        </Command>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

/** A plugin's field: the value it wrote, shown only (the plugin keeps it current). */
const PluginValueCell = ({ field, value }: { field: Field; value: CustomValue | undefined }) => {
  const format = useFormat();

  const text =
    typeof value === 'number'
      ? format.number(value)
      : field.type === 'date' && typeof value === 'string'
        ? format.date(value)
        : typeof value === 'string'
          ? value
          : '';

  return (
    <RecordTableInlineCell>
      {Array.isArray(value) ? (
        <span className="flex min-w-0 gap-1 overflow-hidden">
          {value.map((option) => (
            <Badge key={option} variant="secondary" className="shrink-0">
              {option}
            </Badge>
          ))}
        </span>
      ) : (
        <span className="truncate">{text}</span>
      )}
    </RecordTableInlineCell>
  );
};

/** "a, b, c" as its items. */
const listOf = (text: string) =>
  text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * One custom field value, edited in place by its type. `onSave(null)` clears it. A plugin's
 * field only shows its value.
 */
export const CustomFieldCell = ({
  field,
  value,
  scope,
  onSave,
}: {
  field: Field;
  value: CustomValue | undefined;
  scope: string;
  onSave: (value: CustomValue | null) => void;
}) => {
  if (field.plugin) return <PluginValueCell field={field} value={value} />;

  switch (field.type) {
    case 'boolean':
      return (
        <RecordTableInlineCell>
          <Checkbox
            checked={value === true}
            aria-label={field.label}
            onCheckedChange={(checked) => onSave(checked ? true : null)}
          />
        </RecordTableInlineCell>
      );
    case 'date':
      return (
        <DateField
          scope={scope}
          value={typeof value === 'string' ? value : null}
          onSave={(next) => onSave(next)}
        />
      );
    case 'select':
    case 'multiselect':
    case 'radio':
    case 'check':
      return (
        <OptionsCell
          field={field}
          scope={scope}
          value={Array.isArray(value) ? value : typeof value === 'string' ? [value] : []}
          onSave={onSave}
        />
      );
    case 'number':
      return (
        <TextField
          scope={scope}
          value={typeof value === 'number' ? String(value) : ''}
          placeholder=""
          onSave={(text) => {
            const number = Number(text.replace(',', '.'));

            if (!text.trim()) onSave(null);
            else if (Number.isFinite(number)) onSave(number);
          }}
        />
      );
    case 'list':
      return (
        <TextField
          scope={scope}
          value={Array.isArray(value) ? value.join(', ') : ''}
          placeholder=""
          onSave={(text) => {
            const items = listOf(text);

            onSave(items.length ? items : null);
          }}
        />
      );
    default:
      return (
        <TextField
          scope={scope}
          value={typeof value === 'string' ? value : ''}
          placeholder=""
          onSave={(text) => onSave(text.trim() || null)}
        />
      );
  }
};
