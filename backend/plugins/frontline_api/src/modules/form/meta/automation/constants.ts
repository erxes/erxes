import type { TAutomationRuntimeOutputDefinition } from 'erxes-api-shared/core-modules';
import type { TFormSubmittedTriggerTarget } from './types';

export const FORM_MODULE_NAME = 'form';
export const FORM_SUBMISSION_COLLECTION = 'submissions';
export const FORM_ANSWERS_KEY = 'fieldValues';
export const FORM_SUBMITTED_TRIGGER_TYPE = `frontline:${FORM_MODULE_NAME}.${FORM_SUBMISSION_COLLECTION}`;

const formSubmittedTriggerOutput: TAutomationRuntimeOutputDefinition<TFormSubmittedTriggerTarget> =
  {
    variables: [
      { key: '_id', label: 'Submission ID', field: '_id' },
      { key: 'formId', label: 'Form ID' },
      { key: 'channelId', label: 'Channel ID' },
      {
        key: 'customerId',
        label: 'Customer',
        exposure: 'reference',
        referenceType: 'core:customer',
      },
      { key: 'conversationId', label: 'Conversation ID' },
    ],
    // The chosen form's fields, listed by resolveOutputVariables
    dynamicVariables: true,
  };

export const formAutomationConstants = {
  triggers: [
    {
      moduleName: FORM_MODULE_NAME,
      collectionName: FORM_SUBMISSION_COLLECTION,
      icon: 'IconForms',
      label: 'Form submitted',
      description:
        'Start this workflow when a customer submits the selected form and its field conditions match.',
      isCustom: true,
      output: formSubmittedTriggerOutput,
    },
  ],
};
