import type { DataExtensionField, DataExtensionValues } from '@erxes/core-contract';
import { PanelFormRow, PanelSection } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { FIELD_TYPES } from '../fieldTypes';
import { fieldState, type Value } from '../values';
import { ValueInput } from './ValueInput';

interface ValuesFormProps {
  /** The fields to ask for, in order (`formFields`). */
  fields: DataExtensionField[];
  values: DataExtensionValues;
  onChange: (key: string, value: Value) => void;
  /** A field's problem by its key, from the last save. */
  errors?: Record<string, string>;
  disabled?: boolean;
}

const FieldRow = ({
  field,
  values,
  onChange,
  error,
  disabled,
}: Omit<ValuesFormProps, 'fields' | 'errors'> & { field: DataExtensionField; error?: string }) => {
  const id = useId();
  const { required, locked } = fieldState(field, values);
  const { t } = useTranslation('data', { keyPrefix: 'form' });

  return (
    <PanelFormRow
      label={field.label}
      icon={FIELD_TYPES[field.type].icon}
      required={required && !locked}
      error={error}
      hint={
        field.settings.readOnly
          ? t('read-only-hint', 'Only members who manage the data model change it.')
          : (field.description ?? undefined)
      }
      htmlFor={id}
    >
      <ValueInput
        id={id}
        field={field}
        value={values[field.key]}
        locked={locked}
        disabled={disabled}
        onChange={(value) => onChange(field.key, value)}
      />
    </PanelFormRow>
  );
};

/**
 * Inputs for a record's fields, under their groups: a field shows while its `visibleWhen`
 * holds and is required while `requiredWhen` does, as the API checks them on save.
 */
export const ValuesForm = ({
  fields,
  values,
  onChange,
  errors = {},
  disabled,
}: ValuesFormProps) => {
  const shown = fields.filter((field) => fieldState(field, values).visible);
  const groups = [...new Set(shown.map((field) => field.settings.group ?? ''))];

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => {
        const rows = shown
          .filter((field) => (field.settings.group ?? '') === group)
          .map((field) => (
            <FieldRow
              key={field.id}
              field={field}
              values={values}
              onChange={onChange}
              error={errors[field.key]}
              disabled={disabled}
            />
          ));

        return group ? (
          <PanelSection key={group} title={group}>
            {rows}
          </PanelSection>
        ) : (
          <div key="" className="flex flex-col gap-3">
            {rows}
          </div>
        );
      })}
    </div>
  );
};
