import { IField, mutateFunction } from '../types/fieldsTypes';
import { FieldBoolean } from './FieldBoolean';
import { FieldNumber } from './FieldNumber';
import { FieldString } from './FieldString';

export interface FieldProps {
  field: IField;
  inCell?: boolean;
  value: string;
  mutateHook?: () => {
    mutate: mutateFunction;
    loading: boolean;
  };
  customFieldsData?: Record<string, unknown>;
  id: string;
}

export interface SpecificFieldProps extends FieldProps {
  handleChange: (value: unknown) => void;
  loading: boolean;
}

export const Field = (props: FieldProps) => {
  const { field, mutateHook, customFieldsData, id } = props;
  const { mutate, loading } = mutateHook?.() ?? {
    mutate: () => null,
    loading: false,
  };

  const handleChange = (value: unknown) => {
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
    loading,
  };

  switch (field.type) {
    case 'text':
      return <FieldString {...fieldProps} />;
    case 'number':
      return <FieldNumber {...fieldProps} />;
    case 'boolean':
      return <FieldBoolean {...fieldProps} />;
    default:
      return null;
  }
};
