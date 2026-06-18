import { useCallback } from 'react';
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

export function PropertyFormField({
  field,
  value,
  idPrefix,
  onFieldChange,
}: {
  field: any;
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

  const fieldProps = {
    field,
    value: value ?? '',
    handleChange,
    loading: false,
    id: `${idPrefix}_${field._id}`,
    customFieldsData: {},
  };

  return (
    <FieldLabel field={field} id={fieldProps.id}>
      {(() => {
        switch (field.type) {
          case 'text':
            return <FieldString {...fieldProps} />;
          case 'phone':
            return <FieldPhone {...fieldProps} />;
          case 'textarea':
            return <FieldTextarea {...fieldProps} />;
          case 'number':
            return <FieldNumber {...fieldProps} />;
          case 'boolean':
            return <FieldBoolean {...fieldProps} />;
          case 'date':
            return <FieldDate {...fieldProps} />;
          case 'select':
            return <FieldSelect {...fieldProps} />;
          case 'multiSelect':
            return <FieldSelectMultiple {...fieldProps} />;
          case 'relation':
            return <FieldRelation {...fieldProps} />;
          case 'file':
            return <FieldFile {...fieldProps} />;
          default:
            return null;
        }
      })()}
    </FieldLabel>
  );
}
