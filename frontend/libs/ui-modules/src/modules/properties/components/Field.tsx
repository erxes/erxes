import { IField, IFieldGroup, mutateFunction } from '../types/fieldsTypes';
import { FieldBoolean } from './FieldBoolean';
import { FieldCheck } from './FieldCheck';
import { FieldDate } from './FieldDate';
import { FieldFile } from './FieldFile';
import { FieldLabel } from './FieldLabel';
import { FieldNumber } from './FieldNumber';
import { FieldRadio } from './FieldRadio';
import { FieldRelation } from './FieldRelation';
import { FieldSelect } from './FieldSelect';
import { FieldSelectMultiple } from './FieldSelectMultiple';
import { FieldString } from './FieldString';
import { FieldTextarea } from './FieldTextarea';

export interface FieldProps {
  field: IField;
  inCell?: boolean;
  value: any;
  mutateHook?: () => {
    mutate: mutateFunction;
    loading: boolean;
  };
  propertiesData?: Record<string, unknown>;
  id: string;
}

export interface SpecificFieldProps extends FieldProps {
  handleChange: (value: unknown) => void;
  loading: boolean;
}

export const Field = (props: FieldProps) => {
  const { field, mutateHook, propertiesData, id } = props;
  const { mutate, loading } = mutateHook?.() ?? {
    mutate: () => null,
    loading: false,
  };

  const handleChange = (value: unknown) => {
    mutate({
      _id: id,
      propertiesData: {
        ...propertiesData,
        [field._id]: value,
      },
    });
  };

  const fieldProps = {
    ...props,
    handleChange,
    loading,
    id: id + '_' + field._id,
  };

  return (
    <FieldLabel field={field} id={`${id}_${field._id}`} inCell={props.inCell}>
      {(() => {
        switch (field.type) {
          case 'text':
            return <FieldString {...fieldProps} />;
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
          case 'check':
            return <FieldCheck {...fieldProps} />;
          case 'radio':
            return <FieldRadio {...fieldProps} />;
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

export interface FieldMultipleProps {
  group: IFieldGroup;
  field: IField;
  inCell?: boolean;
  propertyIndex: number;
  value: any;
  mutateHook?: () => {
    mutate: mutateFunction;
    loading: boolean;
  };
  propertiesData?: Record<string, any>;
  id: string;
}

export const FieldMultiple = (props: FieldMultipleProps) => {
  const { group, field, mutateHook, propertiesData, id, propertyIndex } = props;
  const { mutate, loading } = mutateHook?.() ?? {
    mutate: () => null,
    loading: false,
  };

  const handleChange = (value: unknown) => {
    const groupProperties = [...(propertiesData?.[group._id] || [])];

    groupProperties[propertyIndex] = {
      ...groupProperties[propertyIndex],
      [field._id]: value,
    };

    mutate({
      _id: id,
      propertiesData: {
        ...propertiesData,
        [group._id]: groupProperties,
      },
    });
  };

  const fieldProps = {
    ...props,
    handleChange,
    loading,
    id: id + '_' + field._id + '_' + propertyIndex,
  };

  return (
    <FieldLabel
      field={field}
      id={`${id}_${field._id}_${propertyIndex}`}
      inCell={props.inCell}
    >
      {(() => {
        switch (field.type) {
          case 'text':
            return <FieldString {...fieldProps} />;
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
          case 'check':
            return <FieldCheck {...fieldProps} />;
          case 'radio':
            return <FieldRadio {...fieldProps} />;
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
