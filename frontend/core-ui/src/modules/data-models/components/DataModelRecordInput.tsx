import { Checkbox, Input, Select, StringArrayInput, Textarea } from 'erxes-ui';
import { localDateTimeValue } from '../recordUtils';
import type { ModelField } from '../types';
import { DataModelRelationInput } from './DataModelRelationInput';

export const DataModelRecordInput = ({
  field,
  value,
  onChange,
  id,
  disabled,
  invalid,
  describedBy,
}: {
  field: ModelField;
  value: unknown;
  onChange: (value: unknown) => void;
  id: string;
  disabled: boolean;
  invalid?: boolean;
  describedBy?: string;
}) => {
  const accessibility = {
    'aria-invalid': invalid,
    'aria-describedby': describedBy,
  };
  if (field.type === 'relation')
    return (
      <DataModelRelationInput
        {...{ field, value, onChange, id, disabled, invalid, describedBy }}
      />
    );
  if (field.type === 'boolean')
    return (
      <Select
        disabled={disabled}
        value={value === true ? 'true' : value === false ? 'false' : 'unset'}
        onValueChange={(next) =>
          onChange(next === 'unset' ? null : next === 'true')
        }
      >
        <Select.Trigger id={id} {...accessibility}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="unset">Not set</Select.Item>
          <Select.Item value="true">Yes</Select.Item>
          <Select.Item value="false">No</Select.Item>
        </Select.Content>
      </Select>
    );
  if (field.type === 'select' || field.type === 'radio') {
    const options = field.options ?? [];
    return (
      <Select
        disabled={disabled}
        value={typeof value === 'string' && value ? `option:${value}` : 'unset'}
        onValueChange={(next) =>
          onChange(next === 'unset' ? null : next.slice(7))
        }
      >
        <Select.Trigger id={id} {...accessibility}>
          <Select.Value placeholder="Choose an option" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="unset">Not set</Select.Item>
          {options.map((option) => (
            <Select.Item key={option.value} value={`option:${option.value}`}>
              {option.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }
  if (field.type === 'multiSelect' || field.type === 'check') {
    const selected = Array.isArray(value)
      ? value.filter((entry): entry is string => typeof entry === 'string')
      : [];
    return (
      <div
        id={id}
        className="space-y-2 rounded-md border p-3"
        role="group"
        aria-label={field.label}
        {...accessibility}
      >
        {field.options.map((option, index) => (
          <label
            key={option.value}
            htmlFor={`${id}-${index}`}
            className="flex items-center gap-2 text-sm"
          >
            <Checkbox
              id={`${id}-${index}`}
              disabled={disabled}
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) =>
                onChange(
                  checked
                    ? [...selected, option.value]
                    : selected.filter((entry) => entry !== option.value),
                )
              }
            />
            {option.label}
          </label>
        ))}
        {!field.options?.length && (
          <p className="text-sm text-muted-foreground">
            No options configured.
          </p>
        )}
      </div>
    );
  }
  if (field.type === 'list')
    return (
      <fieldset disabled={disabled} {...accessibility}>
        <StringArrayInput
          id={id}
          value={
            Array.isArray(value)
              ? value.filter(
                  (entry): entry is string => typeof entry === 'string',
                )
              : []
          }
          onValueChange={onChange}
          placeholder="Type a value and press Enter"
        />
      </fieldset>
    );
  if (field.type === 'date')
    return (
      <Input
        id={id}
        type="datetime-local"
        {...accessibility}
        step="1"
        disabled={disabled}
        value={localDateTimeValue(value)}
        onChange={(event) => {
          const date = event.target.value ? new Date(event.target.value) : null;
          onChange(
            date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
          );
        }}
      />
    );
  if (field.type === 'number')
    return (
      <Input
        id={id}
        type="number"
        {...accessibility}
        step="any"
        disabled={disabled}
        value={typeof value === 'number' ? value : ''}
        onChange={(event) =>
          onChange(
            event.target.value === '' ? null : event.target.valueAsNumber,
          )
        }
      />
    );
  const text = typeof value === 'string' ? value : '';
  if (field.type === 'textarea')
    return (
      <Textarea
        {...accessibility}
        id={id}
        disabled={disabled}
        value={text}
        maxLength={10000}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  return (
    <Input
      {...accessibility}
      id={id}
      type={field.type === 'phone' ? 'tel' : 'text'}
      disabled={disabled}
      value={text}
      maxLength={10000}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};
