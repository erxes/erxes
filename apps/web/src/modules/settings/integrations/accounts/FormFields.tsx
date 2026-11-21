import type { IntegrationFormField, IntegrationFormValues } from '@erxes/core-contract';
import { Input, Label, Select, Switch } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { usePluginText } from '~/modules/plugins/pluginText';

export type FormDraft = Record<string, string | boolean>;

export type FormErrors = Record<string, string>;

const draftValue = (field: IntegrationFormField, value: unknown): string | boolean => {
  if (field.type === 'boolean') return value === true;

  return typeof value === 'string' || typeof value === 'number' ? `${value}` : '';
};

export const draftOf = (
  fields: IntegrationFormField[],
  saved: Record<string, unknown>,
): FormDraft =>
  Object.fromEntries(fields.map((field) => [field.key, draftValue(field, saved[field.key])]));

const isBlank = (value: string | boolean | undefined) => value === undefined || value === '';

const valueOf = (field: IntegrationFormField, raw: string | boolean) => {
  if (field.type !== 'number' || typeof raw !== 'string') return raw;

  const number = Number(raw);

  return Number.isFinite(number) ? number : null;
};

export const readForm = (
  fields: IntegrationFormField[],
  draft: FormDraft,
  options: {
    sealed: string[];
    clearBlank: boolean;
    required: (field: IntegrationFormField) => string;
    notNumber: (field: IntegrationFormField) => string;
  },
) => {
  const errors: FormErrors = {};
  const values: IntegrationFormValues = {};

  for (const field of fields) {
    const raw = draft[field.key];
    const kept = field.type === 'secret' && options.sealed.includes(field.key);

    if (isBlank(raw)) {
      if (field.required && !kept) errors[field.key] = options.required(field);
      else if (options.clearBlank && !kept) values[field.key] = null;
    } else {
      const value = valueOf(field, raw);

      if (value === null) errors[field.key] = options.notNumber(field);
      else values[field.key] = value;
    }
  }

  return { errors, values, valid: !Object.keys(errors).length };
};

const FieldInput = ({
  id,
  plugin,
  field,
  value,
  sealed,
  invalid,
  disabled,
  onChange,
}: {
  id: string;
  plugin: string;
  field: IntegrationFormField;
  value: string | boolean;
  sealed: boolean;
  invalid: boolean;
  disabled: boolean;
  onChange: (value: string | boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.accounts' });
  const text = usePluginText();

  if (field.type === 'boolean') {
    return (
      <Switch id={id} checked={value === true} disabled={disabled} onCheckedChange={onChange} />
    );
  }

  if (field.type === 'select') {
    return (
      <Select
        value={typeof value === 'string' ? value : ''}
        disabled={disabled}
        onValueChange={(next) => onChange(next ?? '')}
      >
        <Select.Trigger id={id} aria-invalid={invalid}>
          <Select.Value placeholder={t('choose', 'Choose…')} />
        </Select.Trigger>
        <Select.Content>
          {(field.options ?? []).map((option) => (
            <Select.Item key={option.value} value={option.value}>
              {text(plugin, option.label)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  return (
    <Input
      id={id}
      type={field.type === 'secret' ? 'password' : field.type === 'number' ? 'number' : 'text'}
      autoComplete={field.type === 'secret' ? 'new-password' : 'off'}
      value={typeof value === 'string' ? value : ''}
      placeholder={
        sealed ? t('secret-saved', 'Saved. Type to replace it.') : (field.placeholder ?? undefined)
      }
      disabled={disabled}
      aria-required={field.required}
      aria-invalid={invalid}
      aria-describedby={invalid ? `${id}-error` : undefined}
      onChange={(event) => onChange(event.target.value)}
    />
  );
};

const FormField = ({
  plugin,
  field,
  value,
  sealed,
  error,
  disabled,
  onChange,
}: {
  plugin: string;
  field: IntegrationFormField;
  value: string | boolean;
  sealed: boolean;
  error: string | undefined;
  disabled: boolean;
  onChange: (value: string | boolean) => void;
}) => {
  const id = useId();
  const text = usePluginText();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{text(plugin, field.label)}</Label>
      <FieldInput
        id={id}
        plugin={plugin}
        field={field}
        value={value}
        sealed={sealed}
        invalid={!!error}
        disabled={disabled}
        onChange={onChange}
      />
      {field.description && (
        <p className="text-xs text-muted-foreground">{text(plugin, field.description)}</p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive-text">
          {error}
        </p>
      )}
    </div>
  );
};

export const FormFields = ({
  plugin,
  fields,
  draft,
  errors,
  sealed = [],
  disabled = false,
  onChange,
}: {
  plugin: string;
  fields: IntegrationFormField[];
  draft: FormDraft;
  errors: FormErrors;
  sealed?: string[];
  disabled?: boolean;
  onChange: (draft: FormDraft) => void;
}) =>
  fields.map((field) => (
    <FormField
      key={field.key}
      plugin={plugin}
      field={field}
      value={draft[field.key] ?? ''}
      sealed={field.type === 'secret' && sealed.includes(field.key)}
      error={errors[field.key]}
      disabled={disabled}
      onChange={(value) => onChange({ ...draft, [field.key]: value })}
    />
  ));
