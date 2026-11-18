import type { TAutomationRuntimeOutputDefinition } from 'erxes-api-shared/core-modules';
import { createFormLinkActionConfigSchema } from '~/meta/automationConfigSchemas';
import type { TCreateFormLinkResult } from './createFormLinkAction';
import type { TFormSubmittedTriggerTarget } from './types';

export const FORM_MODULE_NAME = 'form';
export const FORM_SUBMISSION_COLLECTION = 'submissions';
export const FORM_ANSWERS_KEY = 'fieldValues';
export const FORM_SUBMITTED_TRIGGER_TYPE = `frontline:${FORM_MODULE_NAME}.${FORM_SUBMISSION_COLLECTION}`;
export const FORM_LINK_COLLECTION = 'links';

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
      { key: 'aboutRecordType', label: 'Answered about (record type)' },
      { key: 'aboutRecordId', label: 'Answered about (record ID)' },
    ],
    // The chosen form's fields, listed by resolveOutputVariables
    dynamicVariables: true,
  };

const createFormLinkOutput: TAutomationRuntimeOutputDefinition<TCreateFormLinkResult> =
  {
    variables: [
      { key: 'url', label: 'Form link' },
      { key: 'expiresAt', label: 'Link expires at' },
      { key: 'formId', label: 'Form ID' },
    ],
  };

export const formAutomationConstants = {
  actions: [
    {
      moduleName: FORM_MODULE_NAME,
      collectionName: FORM_LINK_COLLECTION,
      method: 'create',
      configSchema: createFormLinkActionConfigSchema,
      icon: 'IconLink',
      label: 'Create form link',
      description:
        'Make a personal link to a form; its answer is saved for this record and customer, once.',
      output: createFormLinkOutput,
    },
  ],
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
