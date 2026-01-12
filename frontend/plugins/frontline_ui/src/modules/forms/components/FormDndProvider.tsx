import { UniqueIdentifier } from '@dnd-kit/core';
import { createContext, useContext, useMemo } from 'react';
import { FORM_CONTENT_SCHEMA } from '../constants/formSchema';
import { z } from 'zod';
import { FormFieldType } from '../constants/formFieldTypes';
import { nanoid } from 'nanoid';

export interface IFieldData {
  id: string;
  type: string;
  label: string;
  description: string;
  placeholder: string;
  required: boolean;
  options: string[];
  span: number;
  order: number;
  stepId: string;
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
  removeStep: (stepId: UniqueIdentifier) => void;
  handleChangeField: (
    stepId: UniqueIdentifier,
    fieldId: UniqueIdentifier,
    newField: IFieldData,
  ) => void;
} | null>(null);

export const useFormDnd = () => {
  const context = useContext(FormDndContext);
  if (!context) {
    throw new Error('useFormDnd must be used within a FormDndProvider');
  }
  return context;
};

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
  const steps = Object.entries(value)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key]) => key);

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

  const getFieldValue = (
    stepId: UniqueIdentifier,
    fieldId: UniqueIdentifier,
  ) => {
    return value[stepId].fields.find((field) => field.id === fieldId);
  };

  const fields = useMemo(() => {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [
        key,
        sortFields(value.fields).map((field) => field.id),
      ]),
    );
  }, [value]);

  const setSteps = (steps: UniqueIdentifier[]) => {
    const stepsWithOrder: [UniqueIdentifier, { order: number }][] = steps.map(
      (step, index) => [
        step,
        {
          order: index + 1,
        },
      ],
    );

    const stepsObject = stepsWithOrder.map(([key, value]) => [
      key,
      {
        fields: (fields[key] || []).map((field) => fieldsDatasObject[field]),
        order: value.order,
      },
    ]);

    onValueChange(Object.fromEntries(stepsObject));
  };

  const removeStep = (stepId: UniqueIdentifier) => {
    const newSteps = steps.filter((step) => step !== stepId);
    const newStepsObject = newSteps.map((step, index) => [
      step,
      {
        fields: (fields[step] || []).map((field) => fieldsDatasObject[field]),
        order: index + 1,
      },
    ]);
    onValueChange(Object.fromEntries(newStepsObject));
  };

  const setFields = (fields: Record<string, UniqueIdentifier[]>) => {
    const fieldsObject = Object.entries(fields).map(([key, value], order) => {
      return [
        key,
        {
          fields: value.map((field, index) => ({
            ...fieldsDatasObject[field],
            order: index + 1,
          })),
          order: order + 1,
        },
      ];
    });

    onValueChange(Object.fromEntries(fieldsObject));
  };

  const handleAddField = (stepId: UniqueIdentifier, type: FormFieldType) => {
    const fieldId = nanoid() as string;
    const field = {
      id: fieldId,
      type: type.value,
      label: type.label,
      description: '',
      placeholder: '',
      required: false,
      stepId,
      options: [],
    };
    const fieldsObject = Object.entries(value || {}).map(([key, value]) => {
      if (key === stepId) {
        return [key, { ...value, fields: [...value.fields, field] }];
      }
      return [key, value];
    });
    onValueChange(Object.fromEntries(fieldsObject));
  };

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

  return (
    <FormDndContext.Provider
      value={{
        steps,
        setSteps,
        fields,
        setFields,
        getFieldValue,
        handleAddField,
        removeStep,
        handleChangeField,
      }}
    >
      {children}
    </FormDndContext.Provider>
  );
}
