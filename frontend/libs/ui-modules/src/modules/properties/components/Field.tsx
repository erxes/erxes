import { ComponentType, useState } from 'react';
import {
  IField,
  IFieldGroup,
  IFieldMutation,
  IPropertyRow,
} from 'ui-modules/modules/properties/types/fieldsTypes';
import {
  hasFieldValue,
  toPropertyGroupKey,
  validatePropertyValue,
} from 'ui-modules/modules/properties/propertyUtils';

import { FieldBoolean } from 'ui-modules/modules/properties/components/FieldBoolean';
import { FieldCheck } from 'ui-modules/modules/properties/components/FieldCheck';
import { FieldDate } from 'ui-modules/modules/properties/components/FieldDate';
import { FeaturedFieldValue } from 'ui-modules/modules/properties/components/FeaturedFieldValue';
import { FieldEditor } from 'ui-modules/modules/properties/components/FieldEditor';
import { FieldFile } from 'ui-modules/modules/properties/components/FieldFile';
import { FieldLabel } from 'ui-modules/modules/properties/components/FieldLabel';
import { useFieldSaveState } from 'ui-modules/modules/properties/hooks/useFieldSaveState';
import { FieldNumber } from 'ui-modules/modules/properties/components/FieldNumber';
import { FieldObjectList } from 'ui-modules/modules/properties/components/FieldObjectList';
import { FieldPhone } from 'ui-modules/modules/properties/components/FieldPhone';
import { FieldRadio } from 'ui-modules/modules/properties/components/FieldRadio';
import { FieldRelation } from 'ui-modules/modules/properties/components/FieldRelation';
import { FieldSelect } from 'ui-modules/modules/properties/components/FieldSelect';
import { FieldSelectMultiple } from 'ui-modules/modules/properties/components/FieldSelectMultiple';
import { FieldString } from 'ui-modules/modules/properties/components/FieldString';
import { FieldStringMultiple } from 'ui-modules/modules/properties/components/FieldStringMultiple';
import { FieldTextarea } from 'ui-modules/modules/properties/components/FieldTextarea';

export interface FieldProps {
  field: IField;
  inCell?: boolean;
  value: any;
  mutateHook?: () => IFieldMutation;
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
  editor: FieldEditor,
  objectList: FieldObjectList,
};

export const Field = (props: FieldProps) => {
  const { field, mutateHook, propertiesData, id } = props;
  const {
    mutate,
    loading,
    propertiesDataMode = 'replace',
  }: IFieldMutation = mutateHook?.() ?? {
    mutate: () => null,
    loading: false,
  };

  const [error, setError] = useState<string | null>(null);
  const { saveState, startSave } = useFieldSaveState(loading);

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

    const nextData: Record<string, unknown> =
      propertiesDataMode === 'patch' ? {} : { ...propertiesData };

    // '' would fail the number/email/date checks and block the whole save
    if (hasFieldValue(value)) {
      nextData[field._id] = value;
    } else if (propertiesDataMode === 'patch') {
      nextData[field._id] = null;
    } else {
      delete nextData[field._id];
    }

    mutate({ _id: id, propertiesData: nextData }, startSave());
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
      saveState={saveState}
    >
      {field.owner ? (
        <FeaturedFieldValue
          field={field}
          value={props.value}
          inCell={props.inCell}
        />
      ) : (
        FieldComponent && <FieldComponent {...fieldProps} />
      )}
    </FieldLabel>
  );
};

export interface FieldMultipleProps {
  group: IFieldGroup;
  field: IField;
  inCell?: boolean;
  rowId: string;
  value: any;
  mutateHook?: () => IFieldMutation;
  propertiesData?: Record<string, any>;
  id: string;
}

export const FieldMultiple = (props: FieldMultipleProps) => {
  const { group, field, mutateHook, propertiesData, id, rowId } = props;
  const {
    mutate,
    loading,
    propertiesDataMode = 'replace',
  }: IFieldMutation = mutateHook?.() ?? {
    mutate: () => null,
    loading: false,
  };

  const [error, setError] = useState<string | null>(null);
  const { saveState, startSave } = useFieldSaveState(loading);

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

    mutate(
      {
        _id: id,
        propertiesData: {
          ...(propertiesDataMode === 'patch' ? {} : propertiesData),
          [groupKey]: rows,
        },
      },
      startSave(),
    );
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
      saveState={saveState}
    >
      {FieldComponent && <FieldComponent {...fieldProps} />}
    </FieldLabel>
  );
};
