import { ruleSchema } from 'erxes-api-shared/core-modules';
import { channelSchema } from '@/channel/db/definitions/channel';
import { integrationSchema } from '@/inbox/db/definitions/integrations';

export const MODULE_NAMES = {
  CHANNEL: 'channel',
  EMAIL_TEMPLATE: 'emailTemplate',
  RESPONSE_TEMPLATE: 'responseTemplate',
  CONVERSATION: 'conversation',
  CONVERSATION_MESSAGE: 'conversation_message',
  INTEGRATION: 'integration',
  SCRIPT: 'script',
};

export const LOG_MAPPINGS = [
  {
    name: MODULE_NAMES.CHANNEL,
    schemas: [channelSchema],
  },
  {
    name: MODULE_NAMES.RESPONSE_TEMPLATE,
    schemas: [],
  },
  {
    name: MODULE_NAMES.INTEGRATION,
    schemas: [integrationSchema, ruleSchema],
  },
];

export const CONVERSATION_INFO = {
  opened: 'Opened',
  channels: 'Channels',
  brand: 'Brand',
  integration: 'Integration',
  count: 'Conversations',
  ALL: [
    { field: 'opened', label: 'Opened' },
    { field: 'channels', label: 'Channels' },
    { field: 'brand', label: 'Brand' },
    { field: 'integration', label: 'Integration' },
    { field: 'count', label: 'Conversations' },
  ],
};

export const NOTIFICATION_MODULES = [
  {
    name: 'conversations',
    description: 'Conversations',
    icon: 'chat',
    types: [
      {
        name: 'conversationStateChange',
        text: 'State change',
      },
      {
        name: 'conversationAssigneeChange',
        text: 'Assignee change',
      },
      {
        name: 'conversationAddMessage',
        text: 'Add message',
      },
    ],
  },
  {
    name: 'channels',
    description: 'Channels',
    icon: 'laptop',
    types: [
      {
        name: 'channelMembersChange',
        text: 'Members change',
      },
    ],
  },
];

export const IMPORT_EXPORT_TYPES = [
  {
    text: 'Conversations',
    contentType: 'conversation',
    icon: 'chat',
  },
];
