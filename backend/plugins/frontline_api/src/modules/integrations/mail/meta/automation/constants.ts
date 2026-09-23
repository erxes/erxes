import type { TAutomationSetPropertyTarget } from 'erxes-api-shared/core-modules';
import {
  MAIL_DRAFT_COLLECTION,
  MAIL_MESSAGE_COLLECTION,
  MAIL_MODULE_NAME,
} from '@/integrations/mail/constants';

const MAIL_MESSAGE_SET_PROPERTY_TARGETS: TAutomationSetPropertyTarget[] = [
  {
    label: 'Mail sender',
    type: 'core:contacts.customers',
    source: 'targetField',
    targetPath: 'customerId',
    cardinality: 'one',
  },
];

const mailMessageTriggerOutput = {
  variables: [
    { key: '_id', label: 'Message ID' },
    { key: 'messageId', label: 'Internet message ID' },
    { key: 'subject', label: 'Subject' },
    { key: 'content', label: 'Body' },
    { key: 'from', label: 'Sender address' },
    { key: 'to', label: 'Recipient addresses' },
    { key: 'conversationId', label: 'Conversation ID' },
    {
      key: 'customerId',
      label: 'Customer ID',
      exposure: 'reference' as const,
      referenceType: 'core:customer',
    },
    { key: 'integrationId', label: 'Inbox ID' },
    { key: 'hasAttachments', label: 'Has attachments' },
    { key: 'senderMismatch', label: 'Unverified sender' },
    { key: 'createdAt', label: 'Received at' },
  ],
};

const mailMessageActionOutput = {
  variables: [
    { key: 'messageId', label: 'Sent message ID' },
    { key: 'subject', label: 'Sent subject' },
    { key: 'conversationId', label: 'Conversation ID' },
    { key: 'deliveryStatus', label: 'Delivery status' },
  ],
};

const mailDraftActionOutput = {
  variables: [
    { key: 'draftId', label: 'Draft ID' },
    { key: 'subject', label: 'Draft subject' },
    { key: 'conversationId', label: 'Conversation ID' },
  ],
};

export const mailConstants = {
  actions: [
    {
      moduleName: MAIL_MODULE_NAME,
      collectionName: MAIL_MESSAGE_COLLECTION,
      method: 'create',
      icon: 'IconMail',
      label: 'Send Email',
      description:
        'Reply to the email right away, without a teammate reviewing it.',
      output: mailMessageActionOutput,
    },
    {
      moduleName: MAIL_MODULE_NAME,
      collectionName: MAIL_DRAFT_COLLECTION,
      method: 'create',
      icon: 'IconMailFast',
      label: 'Draft Email Reply',
      description:
        'Prepare a reply to the email and leave it in the inbox for a teammate to review before it is sent.',
      output: mailDraftActionOutput,
    },
  ],
  triggers: [
    {
      moduleName: MAIL_MODULE_NAME,
      collectionName: MAIL_MESSAGE_COLLECTION,
      icon: 'IconMail',
      label: 'Email Received',
      description:
        'Start this workflow when an email arrives in a connected mail inbox.',
      isCustom: true,
      output: mailMessageTriggerOutput,
      setPropertyTargets: MAIL_MESSAGE_SET_PROPERTY_TARGETS,
    },
  ],
};
