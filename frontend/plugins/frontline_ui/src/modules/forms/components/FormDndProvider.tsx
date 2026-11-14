import { UniqueIdentifier } from '@dnd-kit/core';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useConfirm } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { formEditingFieldDirtyAtom } from '../states/formSetupStates';
import { useTranslation } from 'react-i18next';
import { FORM_CONTENT_SCHEMA } from '../constants/formSchema';
import { z } from 'zod';
import { FormFieldType } from '../constants/formFieldTypes';
import { nanoid } from 'nanoid';
import { IFieldValidator, IFormFieldLogics } from '../types/formTypes';

export interface IFieldData {
  id: string;
  type: string;
  expectedType?: string;
  validation?: string | null;
  label: string;
  description: string;
  placeholder: string;
  required: boolean;
  allowSearch?: boolean;
  options: string[];
  span: number;
  order: number;
  stepId: string;
  logics?: IFormFieldLogics[];
  logicAction: string;
  validator?: IFieldValidator;
}

export const FormDndContext = createContext<{
  steps: UniqueIdentifier[];
  setSteps: (steps: UniqueIdentifier[]) => void;
  fields: Record<UniqueIdentifier, UniqueIdentifier[]>;
  setFields: (fields: Record<UniqueIdentifier, UniqueIdentifier[]>) => void;
  getFieldValue: (
    stepId: UniqueIdentifier,
    fieldId: UniqueIdentifier,
  ) => IFieldData | undefined;
  handleAddField: (stepId: UniqueIdentifier, type: FormFieldType) => void;
  newFieldId: UniqueIdentifier | null;
  editingFieldId: UniqueIdentifier | null;
  setEditingFieldId: Dispatch<SetStateAction<UniqueIdentifier | null>>;
  setEditingFieldDirty: (fieldId: UniqueIdentifier, dirty: boolean) => void;
  clearNewFieldId: () => void;
  removeStep: (stepId: UniqueIdentifier) => void;
  handleChangeField: (
    stepId: UniqueIdentifier,
    fieldId: UniqueIdentifier,
    newField: IFieldData,
  ) => void;
  handleChangeStepValue: (
    stepId: UniqueIdentifier,
    fieldKey: string,
    value: string | number | string[],
  ) => void;
  getStepValue: (stepId: UniqueIdentifier) => {
    name?: string;
    description?: string;
    order: number;
  };
  handleDeleteField: (
    stepId: UniqueIdentifier,
    fieldId: UniqueIdentifier,
  ) => void;
} | null>(null);

/** Reads the owning form builder's field and step controls. */
export const useFormDnd = () => {
  const context = useContext(FormDndContext);
  if (!context) {
    throw new Error('useFormDnd must be used within a FormDndProvider');
  }
  return context;
};

/** Owns ordered form steps, field edits, and guarded editor selection. */
export function FormDndProvider({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  value: Record<
    string,
    {
      name?: string;
      description?: string;
      order: number;
      fields: IFieldData[];
    }
  >;
  onValueChange: (values: z.infer<typeof FORM_CONTENT_SCHEMA>['steps']) => void;
}) {
  const [newFieldId, setNewFieldId] = useState<UniqueIdentifier | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<UniqueIdentifier | null>(
    null,
  );
  const setFieldDirty = useSetAtom(formEditingFieldDirtyAtom);
  useEffect(() => () => setFieldDirty(false), [setFieldDirty]);
  const dirtyFieldId = useRef<UniqueIdentifier | null>(null);
  const { confirm } = useConfirm();
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  const setEditingFieldDirty = useCallback(
    (fieldId: UniqueIdentifier, dirty: boolean) => {
      if (dirty) dirtyFieldId.current = fieldId;
      else if (dirtyFieldId.current === fieldId) dirtyFieldId.current = null;
      setFieldDirty(dirtyFieldId.current !== null);
    },
    [setFieldDirty],
  );

  const requestEditingFieldId = useCallback<
    Dispatch<SetStateAction<UniqueIdentifier | null>>
  >(
    (value) => {
      const nextId =
        typeof value === 'function' ? value(editingFieldId) : value;
      if (nextId === editingFieldId) return;

      /** Applies the switch only while the originating field is still selected. */
      const changeField = () =>
        setEditingFieldId((current) =>
          current === editingFieldId ? nextId : current,
        );

      if (editingFieldId !== null && dirtyFieldId.current === editingFieldId) {
        confirm({
          message: t('leave-unsaved-title'),
          options: {
            okLabel: t('leave-without-saving'),
            cancelLabel: t('keep-editing'),
          },
        }).then(changeField);
        return;
      }

      changeField();
    },
    [confirm, editingFieldId, t],
  );

  const steps = Object.entries(value)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key]) => key);

  /** Orders a step's fields by their saved display order. */
  const sortFields = (fields?: IFieldData[]) => {
    return fields?.sort((a, b) => a.order - b.order) ?? [];
  };

  const fieldsDatasObject = useMemo(() => {
    const fieldsDatas = Object.entries(value)
      .map(([, value]) => sortFields(value.fields))
      .flat();
    return Object.fromEntries(
      fieldsDatas.map((field, index) => [
        field.id,
        { ...field, order: index + 1 },
      ]),
    );
  }, [value]);

  /** Finds a field inside its owning step. */
  const getFieldValue = (
    stepId: UniqueIdentifier,
    fieldId: UniqueIdentifier,
  ) => {
    return value[stepId].fields.find((field) => field.id === fieldId);
  };

  /** Reads step metadata without including its fields. */
  const getStepValue = (stepId: UniqueIdentifier) => {
    const { name, description, order } = value[stepId];
    return { name, description, order };
  };

  const fields = useMemo(() => {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        sortFields(value.fields).map((field) => field.id),
      ]),
    );
  }, [value]);

  /** Applies step ordering while preserving each step's fields. */
  const setSteps = (steps: UniqueIdentifier[]) => {
    const stepsWithOrder: [UniqueIdentifier, { order: number }][] = steps.map(
      (step, index) => [
        step,
        {
          order: index + 1,
          name: `Step ${index + 1}`,
          description: '',
        },
      ],
    );

    const stepsObject = stepsWithOrder.map(([key, stepValue]) => [
      key,
      {
        ...stepValue,
        ...value[key],
        fields: (fields[key] || []).map((field) => fieldsDatasObject[field]),
        order: stepValue.order,
      },
    ]);

    onValueChange(Object.fromEntries(stepsObject));
  };

  /** Removes a step and renumbers the remaining steps. */
  const removeStep = (stepId: UniqueIdentifier) => {
    const newSteps = steps.filter((step) => step !== stepId);
    const newStepsObject = newSteps.map((step, index) => [
      step,
      {
        ...value[step],
        fields: (fields[step] || []).map((field) => fieldsDatasObject[field]),
        order: index + 1,
      },
    ]);
    onValueChange(Object.fromEntries(newStepsObject));
  };

  /** Applies field ordering and updates each field's owning step. */
  const setFields = (fields: Record<string, UniqueIdentifier[]>) => {
    const fieldsObject = Object.entries(fields).map(([key, stepFields]) => {
      return [
        key,
        {
          ...value[key],
          fields: stepFields.map((field, index) => ({
            ...fieldsDatasObject[field],
            stepId: key,
            order: index + 1,
          })),
        },
      ];
    });

    onValueChange(Object.fromEntries(fieldsObject));
  };

  /** Creates a field with its type defaults and requests its editor. */
  const handleAddField = (stepId: UniqueIdentifier, type: FormFieldType) => {
    const fieldId = nanoid() as string;
    setNewFieldId(fieldId);
    const field = {
      id: fieldId,
      type: type.value,
      label: type.defaultLabel ?? type.label,
      description: '',
      placeholder: '',
      required: false,
      stepId,
      options: type.defaultOptions ?? [],
      allowSearch: type.defaultAllowSearch,
    };
    const fieldsObject = Object.entries(value || {}).map(([key, value]) => {
      if (key === stepId) {
        return [key, { ...value, fields: [...value.fields, field] }];
      }
      return [key, value];
    });
    onValueChange(Object.fromEntries(fieldsObject));
  };

  /** Replaces one field's draft values inside its owning step. */
  const handleChangeField = (
    stepId: UniqueIdentifier,
    fieldId: UniqueIdentifier,
    newField: IFieldData,
  ) => {
    const fieldsObject = Object.entries(value || {}).map(([key, value]) => {
      if (key === stepId) {
        return [
          key,
          {
            ...value,
            fields: value.fields.map((field) =>
              field.id === fieldId ? newField : field,
            ),
          },
        ];
      }
      return [key, value];
    });
    onValueChange(Object.fromEntries(fieldsObject));
  };

  /** Removes the selected field from its owning step. */
  const handleDeleteField = (
    stepId: UniqueIdentifier,
    fieldId: UniqueIdentifier,
  ) => {
    const fieldsObject = Object.entries(value || {}).map(([key, value]) => {
      if (key === stepId) {
        return [
          key,
          {
            ...value,
            fields: value.fields.filter((field) => field.id !== fieldId),
          },
        ];
      }
      return [key, value];
    });
    onValueChange(Object.fromEntries(fieldsObject));
  };

  /** Updates one step metadata property while preserving its fields. */
  const handleChangeStepValue = (
    stepId: UniqueIdentifier,
    fieldKey: string,
    fieldValue: string | number | string[],
  ) => {
    const fieldsObject = Object.entries(value || {}).map(([key, stepValue]) => {
      if (key === stepId) {
        return [
          key,
          {
            ...stepValue,
            [fieldKey]: fieldValue,
          },
        ];
      }
      return [key, stepValue];
    });
    onValueChange(Object.fromEntries(fieldsObject));
  };

  return (
    <FormDndContext.Provider
      value={{
        steps,
        setSteps,
        fields,
        setFields,
        getFieldValue,
        handleAddField,
        newFieldId,
        editingFieldId,
        setEditingFieldId: requestEditingFieldId,
        setEditingFieldDirty,
        clearNewFieldId: () => setNewFieldId(null),
        removeStep,
        handleChangeField,
        handleChangeStepValue,
        getStepValue,
        handleDeleteField,
      }}
    >
      {children}
    </FormDndContext.Provider>
  );
}
