import { useCallback } from 'react';
import { IField } from '../types/fieldsTypes';
import { FIELD_COMPONENT_BY_TYPE } from './Field';
import { FieldLabel } from './FieldLabel';

export function PropertyFormField({
  field,
  value,
  idPrefix,
  onFieldChange,
}: Readonly<{
  field: IField;
  value: unknown;
  idPrefix: string;
  onFieldChange: (fieldId: string, value: unknown) => void;
}>) {
  const handleChange = useCallback(
    (newValue: unknown) => {
      onFieldChange(field._id, newValue);
    },
    [field._id, onFieldChange],
  );

  const FieldComponent = FIELD_COMPONENT_BY_TYPE[field.type];
  if (!FieldComponent) return null;

  const id = `${idPrefix}_${field._id}`;

  return (
    <FieldLabel field={field} id={id} value={value}>
      <FieldComponent
        field={field}
        value={value}
        handleChange={handleChange}
        loading={false}
        id={id}
      />
    </FieldLabel>
  );
}
