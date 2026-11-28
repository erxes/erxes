import type { DataExtensionField, DataExtensionValues } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { PanelFormRow, PanelSection } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { groupsQuery } from '../dataQueries';
import { FIELD_TYPES } from '../fieldTypes';
import { fieldState, type Value } from '../values';
import { ValueInput } from './ValueInput';

interface ValuesFormProps {
  /** The fields to ask for, in order (`formFields`). */
  fields: DataExtensionField[];
  values: DataExtensionValues;
  /** Left out, every value shows as text to read: values the record's plugin keeps. */
  onChange?: (key: string, value: Value) => void;
  /** A field's problem by its key, from the last save. */
  errors?: Record<string, string>;
  disabled?: boolean;
  /** Given, the fields outside a group show under a section of this title, as groups do. */
  ungroupedTitle?: string;
}

const FieldRow = ({
  field,
  values,
  onChange,
  error,
  disabled,
}: Omit<ValuesFormProps, 'fields' | 'errors' | 'ungroupedTitle'> & {
  field: DataExtensionField;
  error?: string;
}) => {
  const id = useId();
  const state = fieldState(field, values);
  const locked = state.locked || !onChange;
  const required = state.required;
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
        onChange={(value) => onChange?.(field.key, value)}
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
  ungroupedTitle,
}: ValuesFormProps) => {
  const shown = fields.filter((field) => fieldState(field, values).visible);
  // Ungrouped fields first, then each group's in the groups' order.
  const listed = useQuery(groupsQuery(fields[0]?.recordType ?? null)).data?.data ?? [];
  const labels = new Map(listed.map((group) => [group.id, group.label]));

  const groupOf = (field: DataExtensionField) =>
    field.groupId && labels.has(field.groupId) ? field.groupId : '';

  const used = new Set(shown.map(groupOf));
  const groups = ['', ...listed.map((group) => group.id)].filter((id) => used.has(id));

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => {
        const rows = shown
          .filter((field) => groupOf(field) === group)
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

        return group || ungroupedTitle ? (
          <PanelSection
            key={group}
            title={group ? (labels.get(group) ?? '') : (ungroupedTitle ?? '')}
          >
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
