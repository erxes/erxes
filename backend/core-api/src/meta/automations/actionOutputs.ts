import { TAutomationRuntimeOutputDefinition } from 'erxes-api-shared/core-modules';

export const FIND_OBJECT_ACTION_OUTPUT: TAutomationRuntimeOutputDefinition = {
  variables: [
    { key: 'object', label: 'Object' },
    { key: 'isExists', label: 'Exists' },
  ],
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
      { key: 'status', label: 'Status' },
      { key: 'ok', label: 'Success' },
      { key: 'headers', label: 'Headers' },
      { key: 'bodyText', label: 'Body Text' },
    ],
  };

export const AI_AGENT_ACTION_OUTPUT: TAutomationRuntimeOutputDefinition = {
  variables: [
    { key: 'type', label: 'Result Type' },
    { key: 'text', label: 'Generated Text' },
    { key: 'topicId', label: 'Topic ID', exposure: 'reference' },
    { key: 'matched', label: 'Matched' },
    { key: 'attributes', label: 'Attributes' },
    { key: 'usage.inputTokens', label: 'Input Tokens' },
    { key: 'usage.outputTokens', label: 'Output Tokens' },
    { key: 'usage.totalTokens', label: 'Total Tokens' },
  ],
};
