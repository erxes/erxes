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
import { IForm } from '../types/formTypes';

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
    formValues: {
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
        successImage: confirmation.image?.url,
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
    formFields: Object.values(content.steps)
      .map((step, stepIndex) => {
        return step.fields.map((field) => {
          return {
            tempFieldId: field.id,
            column: field.span,
            description: field.description,
            content: field.placeholder,
            isRequired: field.required,
            options: field.options,
            order: field.order,
            pageNumber: stepIndex + 1,
            text: field.label,
            type: field.type,
            validation: field.validation,
          };
        });
      })
      .flat(),
  });
});

export const resetFormSetupAtom = atom(null, (_, set) => {
  set(formSetupStepAtom, 1);
  set(formSetupGeneralAtom, FORM_STATES_DEFAULT_VALUES.GENERAL);
  set(formSetupContentAtom, FORM_STATES_DEFAULT_VALUES.CONTENT);
  set(formSetupConfirmationAtom, FORM_STATES_DEFAULT_VALUES.CONFIRMATION);
  set(settedFormDetailAtom, false);
});

export const formSetSetupAtom = atom(null, (_, set, payload: IForm) => {
  const general = {
    title: payload.title,
    name: payload.title,
    description: payload.description,
    buttonText: payload.buttonText,
    primaryColor: payload.leadData.primaryColor,
    appearance: payload.leadData.appearance,
  };

  const content = {
    steps: Object.fromEntries(
      Object.entries(payload.leadData.steps || {}).map(([key, step]) => [
        key,
        {
          name: step.name,
          description: step.description,
          order: step.order,
          fields: payload.fields
            .filter((field) => field.pageNumber === step.order)
            .map((field) => ({
              id: field._id,
              type: field.type,
              label: field.text,
              description: field.description,
              placeholder: field.content || '',
              options: field.options,
              span: field.column ?? 1,
              required: field.isRequired || false,
              order: field.order,
              validation: field.validation,
              stepId: key,
            })),
        },
      ]),
    ),
  };

  const confirmation = {
    title: payload.leadData.thankTitle,
    description: payload.leadData.thankContent,
    image: payload.leadData.thankImage,
  };

  set(formSetupGeneralAtom, general);
  set(formSetupContentAtom, content);
  set(formSetupConfirmationAtom, confirmation);
  set(settedFormDetailAtom, true);
});
