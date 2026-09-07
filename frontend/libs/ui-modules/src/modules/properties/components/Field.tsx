import { ComponentType, useState } from 'react';
import {
  IField,
  IFieldGroup,
  IPropertyRow,
  mutateFunction,
} from '../types/fieldsTypes';
import {
  hasFieldValue,
  toPropertyGroupKey,
  validatePropertyValue,
} from '../propertyUtils';
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
import { FieldStringMultiple } from './FieldStringMultiple';
import { FieldPhone } from './FieldPhone';
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
  onFieldChange?: (value: unknown) => void;
}

export interface SpecificFieldProps extends FieldProps {
  handleChange: (value: unknown) => void;
  onInputChange?: (value: unknown) => void;
  loading: boolean;
}

export const FIELD_COMPONENT_BY_TYPE: Record<
  string,
  ComponentType<SpecificFieldProps>
> = {
  text: FieldString,
  phone: FieldPhone,
  textarea: FieldTextarea,
  list: FieldStringMultiple,
  number: FieldNumber,
  boolean: FieldBoolean,
  date: FieldDate,
  select: FieldSelect,
  multiSelect: FieldSelectMultiple,
  check: FieldCheck,
  radio: FieldRadio,
  relation: FieldRelation,
  file: FieldFile,
};

export const Field = (props: FieldProps) => {
  const { field, mutateHook, propertiesData, id } = props;
  const { mutate, loading } = mutateHook?.() ?? {
    mutate: () => null,
    loading: false,
  };

  const [error, setError] = useState<string | null>(null);

  const handleChange = (value: unknown) => {
    // tabbing through an untouched empty input reports '' — nothing changed
    if (!hasFieldValue(value) && !hasFieldValue(propertiesData?.[field._id])) {
      return;
    }

    const message = validatePropertyValue(field, value);

    setError(message);

    if (message) {
      return;
    }

    const nextData = { ...propertiesData };

    // '' would fail the number/email/date checks and block the whole save
    if (hasFieldValue(value)) {
      nextData[field._id] = value;
    } else {
      delete nextData[field._id];
    }

    mutate({ _id: id, propertiesData: nextData });
  };

  const fieldProps = {
    ...props,
    handleChange,
    loading,
    id: id + '_' + field._id,
  };

  const FieldComponent = FIELD_COMPONENT_BY_TYPE[field.type];

  return (
    <FieldLabel
      field={field}
      id={`${id}_${field._id}`}
      inCell={props.inCell}
      value={props.value}
      error={error}
    >
      {FieldComponent && <FieldComponent {...fieldProps} />}
    </FieldLabel>
  );
};

export interface FieldMultipleProps {
  group: IFieldGroup;
  field: IField;
  inCell?: boolean;
  rowId: string;
  value: any;
  mutateHook?: () => {
    mutate: mutateFunction;
    loading: boolean;
  };
  propertiesData?: Record<string, any>;
  id: string;
}

export const FieldMultiple = (props: FieldMultipleProps) => {
  const { group, field, mutateHook, propertiesData, id, rowId } = props;
  const { mutate, loading } = mutateHook?.() ?? {
    mutate: () => null,
    loading: false,
  };

  const [error, setError] = useState<string | null>(null);

  const handleChange = (value: unknown) => {
    const groupKey = toPropertyGroupKey(group._id);
    const rows = [...((propertiesData?.[groupKey] || []) as IPropertyRow[])];
    const index = rows.findIndex((row) => row._id === rowId);

    // tabbing through an untouched empty input reports '' — nothing changed
    if (!hasFieldValue(value) && !hasFieldValue(rows[index]?.[field._id])) {
      return;
    }

    const message = validatePropertyValue(field, value);

    setError(message);

    if (message) {
      return;
    }

    const nextRow: IPropertyRow = {
      ...(index === -1 ? { _id: rowId } : rows[index]),
    };

    if (hasFieldValue(value)) {
      nextRow[field._id] = value;
    } else {
      delete nextRow[field._id];
    }

    if (index === -1) {
      rows.push(nextRow);
    } else {
      rows[index] = nextRow;
    }

    mutate({
      _id: id,
      propertiesData: {
        ...propertiesData,
        [groupKey]: rows,
      },
    });
  };

  const fieldProps = {
    ...props,
    handleChange,
    loading,
    id: id + '_' + field._id + '_' + rowId,
  };

  const FieldComponent = FIELD_COMPONENT_BY_TYPE[field.type];

  return (
    <FieldLabel
      field={field}
      id={`${id}_${field._id}_${rowId}`}
      inCell={props.inCell}
      value={props.value}
      error={error}
    >
      {FieldComponent && <FieldComponent {...fieldProps} />}
    </FieldLabel>
  );
};
