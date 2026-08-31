'use client';

import { Checkbox } from 'erxes-ui/components/checkbox';
import { RadioGroup } from 'erxes-ui/components/radio-group';
import { Select } from 'erxes-ui/components/select';
import { TextareaInput, TextInput } from '@/modules/ui/components/FormInput';
import { cn } from '@/modules/ui/lib/cn';
import type { FormField } from '../types';
import { fieldKind, fieldOptions, type FormValue } from '../utils/fields';
import { FileField } from './FileField';

const asText = (value: FormValue): string =>
  typeof value === 'string' ? value : '';

const asList = (value: FormValue): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

const Choice = ({
  checked,
  onChange,
  label,
  name,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  name: string;
}) => (
  <label
    className={cn(
      'flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors',
      checked
        ? 'border-brand/40 bg-brand-soft/50 text-ink'
        : 'border-line bg-white text-ink-soft hover:bg-subtle',
    )}
  >
    <Checkbox
      name={name}
      checked={checked}
      onCheckedChange={(next) => onChange(next === true)}
      className="mt-0.5"
    />
    <span className="min-w-0 flex-1 leading-relaxed">{label}</span>
  </label>
);

/** Draws whichever control the field's kind calls for, over one form value. */
export const FormFieldControl = ({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: FormValue;
  onChange: (next: FormValue) => void;
}) => {
  const kind = fieldKind(field);
  const options = fieldOptions(field);

  if (kind === 'textarea') {
    return (
      <TextareaInput
        rows={4}
        value={asText(value)}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Хариултаа бичнэ үү"
      />
    );
  }

  if (kind === 'select') {
    return (
      <Select value={asText(value)} onValueChange={onChange}>
        <Select.Trigger className="h-11 w-full rounded-lg bg-subtle px-3.5 text-[15px] shadow-none">
          <Select.Value placeholder="Сонгоно уу" />
        </Select.Trigger>
        <Select.Content>
          {options.map((option) => (
            <Select.Item key={option} value={option}>
              {option}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  if (kind === 'radio') {
    return (
      <RadioGroup
        value={asText(value)}
        onValueChange={onChange}
        className="grid gap-2"
      >
        {options.map((option) => (
          <label
            key={option}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors',
              asText(value) === option
                ? 'border-brand/40 bg-brand-soft/50 text-ink'
                : 'border-line bg-white text-ink-soft hover:bg-subtle',
            )}
          >
            <RadioGroup.Item value={option} className="mt-0.5" />
            <span className="min-w-0 flex-1 leading-relaxed">{option}</span>
          </label>
        ))}
      </RadioGroup>
    );
  }

  if (kind === 'check' || kind === 'multiSelect') {
    const picked = asList(value);

    return (
      <div className="grid gap-2">
        {options.map((option) => (
          <Choice
            key={option}
            name={field._id}
            label={option}
            checked={picked.includes(option)}
            onChange={(next) =>
              onChange(
                next
                  ? [...picked, option]
                  : picked.filter((entry) => entry !== option),
              )
            }
          />
        ))}
      </div>
    );
  }

  if (kind === 'file') {
    return <FileField value={value} onChange={onChange} />;
  }

  return (
    <TextInput
      type={kind === 'email' ? 'email' : kind === 'phone' ? 'tel' : kind === 'number' ? 'number' : 'text'}
      inputMode={kind === 'number' ? 'numeric' : undefined}
      value={asText(value)}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Хариултаа бичнэ үү"
    />
  );
};
