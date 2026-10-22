import { Form, Select } from 'erxes-ui';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { relationMembers, uniqueModelFields } from '../relationGroups';
import { isEmptyRecordValue } from '../recordUtils';
import type { ModelField } from '../types';
import { DataModelRecordInput } from './DataModelRecordInput';
import { DataModelRelationInput } from './DataModelRelationInput';

interface RecordFieldsProps {
  fields: ModelField[];
  form: UseFormReturn<{ values: Record<string, unknown> }>;
  loading: boolean;
  idPrefix: string;
}

export const DataModelRecordFields = ({
  fields,
  form,
  loading,
  idPrefix,
}: RecordFieldsProps) => (
  <>
    {uniqueModelFields(fields).map((definition) => (
      <Form.Field
        key={definition._id}
        control={form.control}
        name={`values.${definition._id}`}
        render={({ field, fieldState }) => (
          <Form.Item>
            <Form.Label htmlFor={`${idPrefix}-${definition._id}`}>
              {definition.label}
              {definition.required ? ' *' : ''}
            </Form.Label>
            {definition.relation?.morphId ? (
              <MorphRelationInput
                key={definition._id}
                members={relationMembers(definition, fields)}
                form={form}
                disabled={loading}
                id={`${idPrefix}-${definition._id}`}
                invalid={Boolean(fieldState.error)}
              />
            ) : (
              <DataModelRecordInput
                field={definition}
                value={field.value}
                onChange={field.onChange}
                id={`${idPrefix}-${definition._id}`}
                disabled={loading}
                invalid={Boolean(fieldState.error)}
                describedBy={
                  fieldState.error
                    ? `${idPrefix}-${definition._id}-error`
                    : undefined
                }
              />
            )}
            <Form.Message id={`${idPrefix}-${definition._id}-error`} />
          </Form.Item>
        )}
      />
    ))}
  </>
);

const MorphRelationInput = ({
  members,
  form,
  disabled,
  id,
  invalid,
}: {
  members: ModelField[];
  form: RecordFieldsProps['form'];
  disabled: boolean;
  id: string;
  invalid: boolean;
}) => {
  const values = form.watch('values');
  const [selectedId, setSelectedId] = useState(
    () =>
      members.find((entry) => !isEmptyRecordValue(values[entry._id]))?._id ??
      members[0]._id,
  );
  const selected =
    members.find((entry) => entry._id === selectedId) ?? members[0];
  const otherCount = members
    .filter((entry) => entry._id !== selected._id)
    .reduce((total, entry) => {
      const value = values[entry._id];
      return (
        total +
        (Array.isArray(value)
          ? value.length
          : isEmptyRecordValue(value)
          ? 0
          : 1)
      );
    }, 0);
  const change = (value: unknown) => {
    if (!selected.relation?.multiple)
      for (const member of members)
        if (member._id !== selected._id)
          form.setValue(`values.${member._id}`, null, { shouldDirty: true });
    form.setValue(`values.${selected._id}`, value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  return (
    <div className="space-y-2">
      <Select
        value={selected._id}
        onValueChange={setSelectedId}
        disabled={disabled}
      >
        <Select.Trigger aria-label={`Object for ${selected.label}`}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {members.map((entry) => (
            <Select.Item key={entry._id} value={entry._id}>
              {entry.relation?.targetModelLabel ??
                entry.relation?.targetModelName ??
                entry.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      <DataModelRelationInput
        key={selected._id}
        field={selected}
        value={values[selected._id]}
        onChange={change}
        id={id}
        disabled={disabled}
        invalid={invalid}
        maxSelections={100 - otherCount}
      />
      {otherCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {otherCount} linked {otherCount === 1 ? 'record' : 'records'} on other
          destination objects.
        </p>
      )}
    </div>
  );
};
