import { ComponentType, useCallback } from 'react';
import { IField } from '../types/fieldsTypes';
import { FieldBoolean } from './FieldBoolean';
import { FieldDate } from './FieldDate';
import { FieldFile } from './FieldFile';
import { FieldLabel } from './FieldLabel';
import { FieldNumber } from './FieldNumber';
import { FieldPhone } from './FieldPhone';
import { FieldRelation } from './FieldRelation';
import { FieldSelect } from './FieldSelect';
import { FieldSelectMultiple } from './FieldSelectMultiple';
import { FieldString } from './FieldString';
import { FieldTextarea } from './FieldTextarea';

const FIELD_COMPONENT_MAP: Record<string, ComponentType<any>> = {
  text: FieldString,
  phone: FieldPhone,
  textarea: FieldTextarea,
  number: FieldNumber,
  boolean: FieldBoolean,
  date: FieldDate,
  select: FieldSelect,
  multiSelect: FieldSelectMultiple,
  relation: FieldRelation,
  file: FieldFile,
};

export function PropertyFormField({
  field,
  value,
  idPrefix,
  onFieldChange,
}: {
  field: IField;
  value: unknown;
  idPrefix: string;
  onFieldChange: (fieldId: string, value: unknown) => void;
}) {
  const handleChange = useCallback(
    (newValue: unknown) => {
      onFieldChange(field._id, newValue);
    },
    [field._id, onFieldChange],
  );

  const FieldComponent = FIELD_COMPONENT_MAP[field.type];
  if (!FieldComponent) return null;

  const id = `${idPrefix}_${field._id}`;

  return (
    <FieldLabel field={field} id={id}>
      <FieldComponent
        field={field}
        value={value}
        handleChange={handleChange}
        loading={false}
        id={id}
        customFieldsData={{}}
      />
    </FieldLabel>
  );
}
