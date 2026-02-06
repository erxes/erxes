import { IField, mutateFunction } from '../types/fieldsTypes';
import { FieldBoolean } from './FieldBoolean';
import { FieldDate } from './FieldDate';
import { FieldFile } from './FieldFile';
import { FieldLabel } from './FieldLabel';
import { FieldNumber } from './FieldNumber';
import { FieldRelation } from './FieldRelation';
import { FieldSelect } from './FieldSelect';
import { FieldString } from './FieldString';

export interface FieldProps {
  field: IField;
  inCell?: boolean;
  value: any;
  mutateHook?: () => {
    mutate: mutateFunction;
    loading: boolean;
  };
  customFieldsData?: Record<string, unknown>;
  id: string;
  onFieldChange?: (value: unknown) => void;
}

export interface SpecificFieldProps extends FieldProps {
  handleChange: (value: unknown) => void;
  onInputChange?: (value: unknown) => void;
  loading: boolean;
}

export const Field = (props: FieldProps) => {
  const { field, mutateHook, customFieldsData, id, onFieldChange } = props;
  const { mutate, loading } = mutateHook?.() ?? {
    mutate: () => null,
    loading: false,
  };

  const handleChange = (value: unknown) => {
    if (onFieldChange) {
      onFieldChange(value);
      return;
    }
    mutate({
      _id: id,
      customFieldsData: {
        ...customFieldsData,
        [field._id]: value,
      },
    });
  };

  const fieldProps = {
    ...props,
    handleChange,
    onInputChange: onFieldChange,
    loading,
    id: id + '_' + field._id,
  };

  return (
    <FieldLabel field={field} id={`${id}_${field._id}`} inCell={props.inCell}>
      {(() => {
        switch (field.type) {
          case 'text':
            return <FieldString {...fieldProps} />;
          case 'number':
            return <FieldNumber {...fieldProps} />;
          case 'boolean':
            return <FieldBoolean {...fieldProps} />;
          case 'date':
            return <FieldDate {...fieldProps} />;
          case 'select':
            return <FieldSelect {...fieldProps} />;
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
};
