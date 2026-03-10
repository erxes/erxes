import { ErxesForm } from './ErxesForm';
import { IFormStep } from '../types/formTypes';
import { z } from 'zod';
import { useErxesForm } from '../ context/erxesFormContext';
import { useAtomValue } from 'jotai';
import { formValuesAtom } from '../states/erxesFormStates';

export const ErxesFormValues = ({
  step,
  stepsLength,
  isLastStep,
}: {
  step: IFormStep;
  stepsLength: number;
  isLastStep: boolean;
}) => {
  const formData = useErxesForm();
  const formValues = useAtomValue(formValuesAtom);

  const fields = formData.fields.filter(
    (field) => field.pageNumber === step.order,
  );

  const formSchema: Record<string, z.ZodType> = {};

  fields.forEach((field) => {
    if (!field || !field.type) return;
    if (field.type === 'text' || field.type === 'textarea') {
      formSchema[field._id] = field.isRequired ? z.string().min(1) : z.string();
    } else if (field.type === 'email') {
      formSchema[field._id] = field.isRequired
        ? z.string().email().min(1)
        : z.string().email();
    } else if (field.type === 'number') {
      formSchema[field._id] = field.isRequired ? z.number().min(1) : z.number();
    } else if (field.type === 'date') {
      formSchema[field._id] = field.isRequired
        ? z.date().min(new Date())
        : z.date();
    } else if (field.type === 'boolean') {
      formSchema[field._id] = z.boolean();
    } else if (field.type === 'select') {
      formSchema[field._id] = field.isRequired ? z.string().min(1) : z.string();
    }
  });

  const defaultValues: Record<string, any> = {};

  fields.forEach((field) => {
    if (!field || !field.type) return;
    if (
      field.type === 'text' ||
      field.type === 'textarea' ||
      field.type === 'email' ||
      field.type === 'select'
    ) {
      defaultValues[field._id] = '';
    } else if (field.type === 'number') {
      defaultValues[field._id] = '';
    } else if (field.type === 'date') {
      defaultValues[field._id] = new Date();
    } else if (field.type === 'boolean') {
      defaultValues[field._id] = false;
    }
  });

  return (
    <ErxesForm
      defaultValue={formValues?.[step.order] || defaultValues}
      schema={z.object(formSchema)}
      step={step}
      stepsLength={stepsLength}
      isLastStep={isLastStep}
    />
  );
};
