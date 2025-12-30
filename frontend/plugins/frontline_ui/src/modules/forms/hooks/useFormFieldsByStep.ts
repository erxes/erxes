import { useMemo } from 'react';
import { FORM_CONTENT_SCHEMA } from '../constants/formSchema';
import { z } from 'zod';

type FormField = z.infer<typeof FORM_CONTENT_SCHEMA>['fields'][number];
type FormStep = z.infer<typeof FORM_CONTENT_SCHEMA>['steps'][number];

export function useFormFieldsByStep(
  fields: FormField[],
  steps: FormStep[],
) {
  const fieldsByStep = useMemo(() => {
    const grouped: Record<string, FormField[]> = {};
    const firstStepId = steps[0]?.id || 'step-1';

    steps.forEach((step) => {
      grouped[step.id] = [];
    });

    fields.forEach((field) => {
      const stepId = field.stepId || firstStepId;
      if (!grouped[stepId]) {
        grouped[stepId] = [];
      }
      grouped[stepId].push(field);
    });

    return grouped;
  }, [fields, steps]);

  const getStepFields = (stepId: string): FormField[] => {
    return fieldsByStep[stepId] || [];
  };

  const getStepFieldIds = (stepId: string): string[] => {
    return getStepFields(stepId).map((f) => f.id);
  };

  const getFirstStepId = (): string => {
    return steps[0]?.id || 'step-1';
  };

  return {
    fieldsByStep,
    getStepFields,
    getStepFieldIds,
    getFirstStepId,
  };
}

