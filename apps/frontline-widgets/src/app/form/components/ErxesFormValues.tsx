import { ErxesForm } from './ErxesForm';
import { IFieldValidator, IFormStep } from '../types/formTypes';
import { z } from 'zod';
import { useErxesForm } from '../context/erxesFormContext';
import { useAtomValue } from 'jotai';
import { formValuesAtom } from '../states/erxesFormStates';

const PRESET_PATTERNS: Record<string, RegExp> = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  PHONE_INTL: /^\+?[1-9]\d{6,14}$/,
  POSTAL_CODE: /^[A-Z0-9]{2,10}(?:[\s-][A-Z0-9]{2,7})?$/i,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
};

const PRESET_DEFAULT_MESSAGES: Record<string, string> = {
  EMAIL: 'Please enter a valid email address.',
  PHONE_INTL: 'Please enter a valid international phone number.',
  POSTAL_CODE: 'Please enter a valid postal / ZIP code.',
  ALPHANUMERIC: 'Only letters and digits are allowed.',
};

function withValidatorRefinement(
  base: z.ZodString,
  validator: IFieldValidator | undefined,
): z.ZodType {
  if (!validator || validator.type === 'NONE') return base;

  let pattern: RegExp | null = null;
  let defaultMessage = 'The value does not match the required format.';

  if (validator.type === 'PRESET' && validator.presetKey) {
    pattern = PRESET_PATTERNS[validator.presetKey] ?? null;
    defaultMessage =
      PRESET_DEFAULT_MESSAGES[validator.presetKey] ?? defaultMessage;
  } else if (validator.type === 'CUSTOM' && validator.customRegex) {
    try {
      pattern = new RegExp(validator.customRegex);
    } catch {
      return base;
    }
  }

  if (!pattern) return base;

  const message = validator.errorMessage || defaultMessage;
  const finalPattern = pattern;

  // Allow empty string through — required check is handled separately by .min(1)
  return base.refine((val) => !val || finalPattern.test(val), { message });
}

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
    if (!field?.type) return;

    if (field.type === 'number') {
      formSchema[field._id] = field.isRequired ? z.number().min(1) : z.number();
      return;
    }
    if (field.type === 'date' || field.type === 'core:customer:birthDate') {
      formSchema[field._id] = field.isRequired
        ? z.date().min(new Date())
        : z.date();
      return;
    }
    if (field.type === 'boolean') {
      formSchema[field._id] = z.boolean();
      return;
    }
    if (field.type === 'file') {
      formSchema[field._id] = field.isRequired
        ? z.array(z.string()).min(1, { message: 'Please upload a file.' })
        : z.array(z.string());
      return;
    }
    if (field.type === 'core:customer:avatar') {
      formSchema[field._id] = field.isRequired
        ? z.any({ message: 'Please upload a avatar picture.' })
        : z.any();
      return;
    }
    if (field.type === 'radio' || field.type === 'core:customer:sex') {
      formSchema[field._id] = field.isRequired
        ? z.string().min(1, { message: 'Please select an option.' })
        : z.string();
      return;
    }
    if (field.type === 'check') {
      formSchema[field._id] = field.isRequired
        ? z
            .array(z.string())
            .min(1, { message: 'Please select at least one option.' })
        : z.array(z.string());
      return;
    }

    // All string-valued field types — apply validator refinement if configured
    const base = field.isRequired ? z.string().min(1) : z.string();
    formSchema[field._id] = withValidatorRefinement(base, field.validator);
  });

  const defaultValues: Record<string, any> = {};

  fields.forEach((field) => {
    if (!field?.type) return;
    if (
      field.type === 'text' ||
      field.type === 'textarea' ||
      field.type === 'email' ||
      field.type === 'select'
    ) {
      defaultValues[field._id] = '';
    } else if (field.type === 'number') {
      defaultValues[field._id] = '';
    } else if (
      field.type === 'date' ||
      field.type === 'core:customer:birthDate'
    ) {
      defaultValues[field._id] = new Date();
    } else if (field.type === 'boolean') {
      defaultValues[field._id] = false;
    } else if (field.type === 'radio' || field.type === 'core:customer:sex') {
      defaultValues[field._id] = '';
    } else if (field.type === 'file') {
      defaultValues[field._id] = [];
    } else if (field.type === 'core:customer:avatar') {
      defaultValues[field._id] = null;
    } else if (field.type === 'check') {
      defaultValues[field._id] = [];
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
