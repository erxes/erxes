import type { TAutomationRuntimeOutputDefinition } from 'erxes-api-shared/core-modules';
import type { IConversation } from '@/inbox/@types/conversations';

type TConversationEventValues = {
  assignedUserId?: string | null;
  status?: string | null;
  tagIds?: string[];
};

type TConversationEventChangedValues = {
  addedTagIds?: string[];
  removedTagIds?: string[];
};

type TConversationEventAutomationTarget = {
  eventGroup?: 'assignee' | 'status' | 'tag';
  eventAction?:
    | 'assigned'
    | 'unassigned'
    | 'open'
    | 'closed'
    | 'reopened'
    | 'added'
    | 'removed';
  conversation?: IConversation & { _id?: string };
  previousValues?: TConversationEventValues;
  currentValues?: TConversationEventValues;
  changedValues?: TConversationEventChangedValues;
  actorId?: string;
  occurredAt?: Date | string;
};

const CONVERSATION_EVENT_TRIGGER_OUTPUT: TAutomationRuntimeOutputDefinition<TConversationEventAutomationTarget> =
  {
    variables: [
      { key: 'eventGroup', label: 'Event group' },
      { key: 'eventAction', label: 'Event action' },
      { key: 'conversation._id', label: 'Conversation ID' },
      { key: 'conversation.content', label: 'Conversation content' },
      {
        key: 'conversation.customerId',
        label: 'Customer ID',
        exposure: 'reference',
        referenceType: 'core:customer',
      },
      { key: 'conversation.integrationId', label: 'Integration ID' },
      {
        key: 'conversation.assignedUserId',
        label: 'Assignee',
        exposure: 'reference',
        referenceType: 'core:user',
      },
      { key: 'conversation.status', label: 'Conversation status' },
      {
        key: 'conversation.tagIds',
        label: 'Conversation tags',
        exposure: 'reference',
      },
      {
        key: 'previousValues.assignedUserId',
        label: 'Previous assignee',
        exposure: 'reference',
        referenceType: 'core:user',
      },
      {
        key: 'currentValues.assignedUserId',
        label: 'Current assignee',
        exposure: 'reference',
        referenceType: 'core:user',
      },
      { key: 'previousValues.status', label: 'Previous status' },
      { key: 'currentValues.status', label: 'Current status' },
      {
        key: 'changedValues.addedTagIds',
        label: 'Added tags',
        exposure: 'reference',
      },
      {
        key: 'changedValues.removedTagIds',
        label: 'Removed tags',
        exposure: 'reference',
      },
      {
        key: 'actorId',
        label: 'Actor',
        exposure: 'reference',
        referenceType: 'core:user',
      },
      { key: 'occurredAt', label: 'Occurred at' },
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
      conditions: [
        {
          type: 'assignee',
          icon: 'IconUser',
          label: 'Assignee',
          description: 'Assigned or unassigned conversation events',
        },
        {
          type: 'status',
          icon: 'IconRefresh',
          label: 'Status',
          description: 'Open, closed, or reopened conversation events',
        },
        {
          type: 'tag',
          icon: 'IconTag',
          label: 'Tag',
          description: 'Added or removed conversation tag events',
        },
      ],
    },
  ],
};
