import type { CustomValue, Field } from '@erxes/core-contract';
import { IconCheck } from '@tabler/icons-react';
import {
  Badge,
  Checkbox,
  Command,
  PopoverScoped,
  RecordTableInlineCell,
  TextField,
} from 'erxes-ui';
import { useState } from 'react';
import { DateInlineCell } from '~/components/inlineCells';

export { FIELD_TYPE_ICONS, FIELD_TYPE_LABELS } from './fieldTypes';

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
      <RecordTableInlineCell.Content className="w-56 p-0">
        <Command>
          <Command.Input placeholder={`Search ${field.label.toLowerCase()}`} />
          <Command.List className="max-h-72 p-1">
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
                  {selected && <IconCheck className="size-4 text-primary" />}
                </Command.Item>
              );
            })}
          </Command.List>
        </Command>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

/**
 * One custom field value, edited in place by its type. `onSave(null)` clears it.
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
  switch (field.type) {
    case 'boolean':
      return (
        <RecordTableInlineCell>
          <Checkbox
            checked={value === true}
            aria-label={field.label}
            onCheckedChange={(checked) => onSave(checked === true ? true : null)}
          />
        </RecordTableInlineCell>
      );
    case 'date':
      return (
        <DateInlineCell
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
            const items = text
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean);

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
