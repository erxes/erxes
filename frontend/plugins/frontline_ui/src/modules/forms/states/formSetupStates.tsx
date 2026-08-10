import {
  FORM_SETUP_STEPS,
  FORM_STATES_DEFAULT_VALUES,
  FORM_STORAGE_KEYS,
} from '@/forms/constants/formStatesDefaultValues';
import { atomWithStorage } from 'jotai/utils';
import {
  FORM_GENERAL_SCHEMA,
  FORM_CALLOUT_SCHEMA,
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

export const formSetupCalloutAtom = atomWithStorage<
  z.infer<typeof FORM_CALLOUT_SCHEMA>
>(FORM_STORAGE_KEYS.CALLOUT, FORM_STATES_DEFAULT_VALUES.CALLOUT, undefined, {
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
  const callout = get(formSetupCalloutAtom);
  const content = get(formSetupContentAtom);

  return (confirmation: z.infer<typeof FORM_CONFIRMATION_SCHEMA>) => ({
    formValues: {
      title: general.title,
      name: general.title,
      type: 'lead',
      description: general.description,
      buttonText: general.buttonText,
      numberOfPages: content.steps.length,
      leadData: {
        appearance: general.appearance,
        loadType: general.loadType,
        callout: {
          title: callout.title,
          body: callout.body,
          buttonText: callout.buttonText,
          featuredImage: callout.featuredImage,
          skip: callout.skip,
        },
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
      .map((step) => {
        return step.fields.map((field) => {
          return {
            tempFieldId: field.id,
            column: field.span,
            description: field.description,
            content: field.placeholder,
            isRequired: field.required,
            options: field.options,
            order: field.order,
            pageNumber: step.order,
            text: field.label,
            type: field.type,
            validation: field.validation,
            logics: field.logics?.map(
              ({ fieldId, logicOperator, logicValue }) => ({
                fieldId,
                logicOperator,
                logicValue,
              }),
            ),
            logicAction: field.logicAction,
            allowSearch: field.allowSearch,
            validator: field.validator
              ? {
                  type: field.validator.type,
                  presetKey: field.validator.presetKey,
                  customRegex: field.validator.customRegex,
                  errorMessage: field.validator.errorMessage,
                }
              : undefined,
          };
        });
      })
      .flat(),
  });
});

export const resetFormSetupAtom = atom(null, (_, set) => {
  set(formSetupStepAtom, FORM_SETUP_STEPS.GENERAL);
  set(formSetupGeneralAtom, FORM_STATES_DEFAULT_VALUES.GENERAL);
  set(formSetupCalloutAtom, FORM_STATES_DEFAULT_VALUES.CALLOUT);
  set(formSetupContentAtom, FORM_STATES_DEFAULT_VALUES.CONTENT);
  set(formSetupConfirmationAtom, FORM_STATES_DEFAULT_VALUES.CONFIRMATION);
  set(settedFormDetailAtom, false);
});

export const formSetSetupAtom = atom(null, (_, set, payload: IForm) => {
  const general = {
    channelId: payload.channelId ?? '',
    title: payload.title ?? '',
    name: payload.title ?? '',
    description: payload.description ?? '',
    buttonText: payload.buttonText ?? '',
    primaryColor: payload.leadData.primaryColor ?? '',
    appearance: payload.leadData.appearance ?? 'iframe',
    loadType: payload.leadData.loadType ?? 'embedded',
  };

  const callout = {
    title: payload.leadData.callout?.title ?? '',
    body: payload.leadData.callout?.body ?? '',
    buttonText: payload.leadData.callout?.buttonText ?? '',
    featuredImage: payload.leadData.callout?.featuredImage ?? null,
    skip: payload.leadData.callout?.skip ?? false,
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
              label: field.text ?? '',
              description: field.description ?? '',
              placeholder: field.content || '',
              options: field.options,
              span: field.column ?? 1,
              required: field.isRequired || false,
              order: field.order,
              validation: field.validation,
              logics: field.logics,
              logicAction: field.logicAction || '',
              allowSearch: field.allowSearch || false,
              validator: field.validator,
              stepId: key,
            })),
        },
      ]),
    ),
  };

  const confirmation = {
    title: payload.leadData.thankTitle ?? '',
    description: payload.leadData.thankContent ?? '',
    image: payload.leadData.thankImage ?? null,
  };

  set(formSetupStepAtom, FORM_SETUP_STEPS.GENERAL);
  set(formSetupGeneralAtom, general);
  set(formSetupCalloutAtom, callout);
  set(formSetupContentAtom, content);
  set(formSetupConfirmationAtom, confirmation);
  set(settedFormDetailAtom, true);
});
