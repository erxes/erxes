'use client';

import { Checkbox } from 'erxes-ui/components/checkbox';
import { Input } from 'erxes-ui/components/input';
import { RadioGroup } from 'erxes-ui/components/radio-group';
import { Select } from 'erxes-ui/components/select';
import { Textarea } from 'erxes-ui/components/textarea';
import type { FormField } from '../types';
import {
  fieldKind,
  fieldOptions,
  fieldPlaceholder,
  type FormValue,
} from '../utils/fields';
import { FileField } from './FileField';

const asText = (value: FormValue): string =>
  typeof value === 'string' ? value : '';

const asList = (value: FormValue): string[] =>
  Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : [];

const INPUT_TYPE = {
  email: 'email',
  phone: 'tel',
  number: 'number',
} as const;

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
  const placeholder = fieldPlaceholder(field);

  if (kind === 'textarea') {
    return (
      <Textarea
        value={asText(value)}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    );
  }

  if (kind === 'select') {
    return (
      <Select value={asText(value)} onValueChange={onChange}>
        <Select.Trigger>
          <Select.Value placeholder={placeholder} />
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
        className="flex flex-col gap-2"
      >
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 cursor-pointer"
          >
            <RadioGroup.Item value={option} />
            <span className="text-sm">{option}</span>
          </label>
        ))}
      </RadioGroup>
    );
  }

  if (kind === 'check' || kind === 'multiSelect') {
    const picked = asList(value);

    return (
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              name={field._id}
              checked={picked.includes(option)}
              onCheckedChange={(next) =>
                onChange(
                  next === true
                    ? [...picked, option]
                    : picked.filter((entry) => entry !== option),
                )
              }
            />
            <span className="text-sm">{option}</span>
          </label>
        ))}
      </div>
    );
  }

  if (kind === 'file') {
    return <FileField value={value} onChange={onChange} />;
  }

  return (
    <Input
      type={
        kind in INPUT_TYPE
          ? INPUT_TYPE[kind as keyof typeof INPUT_TYPE]
          : 'text'
      }
      inputMode={kind === 'number' ? 'numeric' : undefined}
      value={asText(value)}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
};
