import type {
  TAutomationRuntimeOutputDefinition,
  TAutomationSetPropertyTarget,
} from 'erxes-api-shared/core-modules';
import type { IConversation } from '@/inbox/@types/conversations';

const CONVERSATION_SET_PROPERTY_TARGETS: TAutomationSetPropertyTarget[] = [
  {
    label: 'Conversation',
    type: 'frontline:inbox.conversations',
    source: 'target',
    cardinality: 'one',
  },
];

const CONVERSATION_EVENT_TRIGGER_OUTPUT: TAutomationRuntimeOutputDefinition<
  IConversation & { _id?: string }
> = {
  variables: [
    { key: '_id', label: 'Conversation ID', field: '_id' },
    { key: 'content', label: 'Conversation content' },
    {
      key: 'customerId',
      label: 'Customer ID',
      exposure: 'reference',
      referenceType: 'core:customer',
    },
    { key: 'integrationId', label: 'Integration ID' },
    {
      key: 'assignedUserId',
      label: 'Assignee',
      exposure: 'reference',
      referenceType: 'core:user',
    },
    { key: 'status', label: 'Conversation status' },
    {
      key: 'tagIds',
      label: 'Conversation tags',
      exposure: 'reference',
    },
    { key: 'createdAt', label: 'Created at' },
    { key: 'updatedAt', label: 'Updated at' },
    { key: 'closedAt', label: 'Closed at' },
    {
      key: 'closedUserId',
      label: 'Closed by',
      exposure: 'reference',
      referenceType: 'core:user',
    },
    {
      key: 'readUserIds',
      label: 'Read users',
      exposure: 'reference',
      referenceType: 'core:user',
    },
    { key: 'messageCount', label: 'Message count' },
    { key: 'number', label: 'Conversation number' },
    {
      key: 'firstRespondedUserId',
      label: 'First responded user',
      exposure: 'reference',
      referenceType: 'core:user',
    },
    { key: 'firstRespondedDate', label: 'First responded date' },
  ],
};

const inboxMessageTriggerOutput = {
  variables: [
    { key: '_id', label: 'Message ID' },
    { key: 'content', label: 'Message content' },
    { key: 'conversationId', label: 'Conversation ID' },
    { key: 'customerId', label: 'Customer ID' },
    { key: 'botId', label: 'Bot ID' },
  ],
};

const inboxMessageActionOutput = {
  variables: [
    { key: '_id', label: 'Message ID' },
    { key: 'conversationId', label: 'Conversation ID' },
    { key: 'content', label: 'Message content' },
  ],
};
export const inboxAutomationConstants = {
  triggers: [
    {
      moduleName: 'inbox',
      collectionName: 'conversations',
      relationType: 'event',
      icon: 'IconInbox',
      label: 'Conversation event',
      description:
        'Start this workflow when a conversation assignee, status, or tag event occurs.',
      isCustom: true,
      output: CONVERSATION_EVENT_TRIGGER_OUTPUT,
      setPropertyTargets: CONVERSATION_SET_PROPERTY_TARGETS,
    },
    {
      moduleName: 'inbox',
      collectionName: 'messages',
      icon: 'IconMessage',
      label: 'Messenger Message',
      description:
        'Start with a blank workflow that enrolls and is triggered off messenger widget messages',
      isCustom: true,
      output: inboxMessageTriggerOutput,
    },
  ],

  actions: [
    {
      moduleName: 'inbox',
      collectionName: 'messages',
      method: 'create',
      icon: 'IconMessage',
      label: 'Send Messenger Message',
      description: 'Send a message to the messenger widget conversation',
      isAvailableOptionalConnect: false,
      output: inboxMessageActionOutput,
    },
  ],
};
