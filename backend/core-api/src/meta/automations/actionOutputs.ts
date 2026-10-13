import {
  IAutomationExecution,
  replaceOutputPlaceholders,
  TAutomationRuntimeOutputDefinition,
} from 'erxes-api-shared/core-modules';
import { CORE_FIND_OBJECT_TARGETS } from './findObjectTargets';

export const FIND_OBJECT_ACTION_OUTPUT: TAutomationRuntimeOutputDefinition = {
  variables: [
    { key: 'found', label: 'Found' },
    { key: 'objectType', label: 'Object Type' },
    { key: 'objectId', label: 'Object ID' },
    { key: 'object', label: 'Object' },
    { key: 'matchedBy.field', label: 'Matched Field' },
    { key: 'matchedBy.value', label: 'Matched Value' },
  ],
  resolvers: {
    'object.*': async ({ subdomain, source, path, defaultValue }) => {
      const objectType =
        typeof source?.objectType === 'string' ? source.objectType : '';
      const target = objectType ? CORE_FIND_OBJECT_TARGETS[objectType] : null;
      const objectPath = path.replace(/^object\./, '');

      if (!target?.output || !source?.object || !objectPath) {
        return defaultValue;
      }

      const execution: IAutomationExecution = {
        automationId: '',
        triggerId: '',
        triggerType: objectType,
        triggerConfig: {},
        targetId: '',
        target: source.object,
        status: '',
        description: '',
        actions: [],
      };

      const resolved = await replaceOutputPlaceholders({
        subdomain,
        execution,
        values: {
          value: `{{ trigger.${objectPath} }}`,
        },
        defaultValue,
      });

      return resolved.value;
    },
  },
};

export const TRANSFORM_ACTION_OUTPUT: TAutomationRuntimeOutputDefinition = {
  variables: [{ key: 'data', label: 'Data' }],
};

export const SEND_EMAIL_ACTION_OUTPUT: TAutomationRuntimeOutputDefinition = {
  variables: [
    { key: 'title', label: 'Title' },
    { key: 'fromEmail', label: 'From Email' },
    { key: 'toEmails', label: 'To Emails' },
    { key: 'ccEmails', label: 'CC Emails' },
    { key: 'customHtml', label: 'Content' },
    { key: 'response', label: 'Response' },
  ],
};

export const OUTGOING_WEBHOOK_ACTION_OUTPUT: TAutomationRuntimeOutputDefinition =
  {
    variables: [
      { key: 'request.method', label: 'Request Method' },
      { key: 'request.url', label: 'Request URL' },
      { key: 'request.headers', label: 'Request Headers' },
      { key: 'request.bodyText', label: 'Request Body' },
      { key: 'response.status', label: 'Response Status' },
      { key: 'response.statusText', label: 'Response Status Text' },
      { key: 'response.ok', label: 'Response Success' },
      { key: 'response.headers', label: 'Response Headers' },
      { key: 'response.contentType', label: 'Response Content Type' },
      { key: 'response.bodyText', label: 'Response Body Text' },
      { key: 'response.bodyJson', label: 'Response Body JSON' },
      { key: 'meta.attemptCount', label: 'Attempt Count' },
      { key: 'error.phase', label: 'Error Phase' },
      { key: 'error.message', label: 'Error Message' },
    ],
  };

export const MESSAGE_PRO_ACTION_OUTPUT: TAutomationRuntimeOutputDefinition = {
  variables: [
    { key: 'documentId', label: 'Document ID' },
    { key: 'content', label: 'Rendered content' },
    { key: 'phone', label: 'Recipient phone' },
    { key: 'sent', label: 'SMS sent' },
  ],
};

export const AI_AGENT_ACTION_OUTPUT: TAutomationRuntimeOutputDefinition = {
  variables: [
    { key: 'type', label: 'Result Type' },
    { key: 'text', label: 'Generated Text' },
    { key: 'topicId', label: 'Topic ID' },
    { key: 'matched', label: 'Matched' },
    { key: 'attributes', label: 'Attributes' },
    { key: 'usage.inputTokens', label: 'Input Tokens' },
    { key: 'usage.outputTokens', label: 'Output Tokens' },
    { key: 'usage.totalTokens', label: 'Total Tokens' },
  ],
};
