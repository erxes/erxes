import {
  FORM_STATES_DEFAULT_VALUES,
  FORM_STORAGE_KEYS,
} from '@/forms/constants/formStatesDefaultValues';
import { atomWithStorage } from 'jotai/utils';
import {
  FORM_GENERAL_SCHEMA,
  FORM_CONTENT_SCHEMA,
  FORM_CONFIRMATION_SCHEMA,
} from '../constants/formSchema';
import { z } from 'zod';
import { atom } from 'jotai';

export const formSetupStepAtom = atomWithStorage<number>(
  FORM_STORAGE_KEYS.STEP,
  1,
);

export const formSetupGeneralAtom = atomWithStorage<
  z.infer<typeof FORM_GENERAL_SCHEMA>
>(FORM_STORAGE_KEYS.GENERAL, FORM_STATES_DEFAULT_VALUES.GENERAL, undefined, {
  getOnInit: true,
});

export const formSetupContentAtom = atomWithStorage<
  z.infer<typeof FORM_CONTENT_SCHEMA>
>(FORM_STORAGE_KEYS.CONTENT, FORM_STATES_DEFAULT_VALUES.CONTENT, undefined, {
  getOnInit: true,
});

export const formSetupConfirmationAtom = atomWithStorage<
  z.infer<typeof FORM_CONFIRMATION_SCHEMA>
>(
  FORM_STORAGE_KEYS.CONFIRMATION,
  FORM_STATES_DEFAULT_VALUES.CONFIRMATION,
  undefined,
  {
    getOnInit: true,
  },
);

export const settedFormDetailAtom = atomWithStorage('settedFormDetail', false);

export const formSetupValuesAtom = atom((get) => {
  const general = get(formSetupGeneralAtom);
  const content = get(formSetupContentAtom);

  return (confirmation: z.infer<typeof FORM_CONFIRMATION_SCHEMA>) => ({
    addFormVariables: {
      title: general.title,
      name: general.title,
      type: 'lead',
      description: confirmation.description,
      buttonText: general.buttonText,
      numberOfPages: content.steps.length,
      leadData: {
        appearance: general.appearance,
        thankTitle: confirmation.title,
        thankContent: confirmation.description,
        thankImage: confirmation.image,
        primaryColor: general.primaryColor,
        successImage: confirmation.image,
        steps: Object.fromEntries(
          Object.entries(content.steps).map(([key, step]) => [
            key,
            {
              name: step.name,
              description: step.description,
              order: step.order,
            },
          ]),
        ),
      },
    },
    formFields: Object.entries(content.steps)
      .map(([key, step]) => {
        return step.fields.map((field) => {
          return {
            ...field,
            stepId: key,
          };
        });
      })
      .flat(),
  });
});
