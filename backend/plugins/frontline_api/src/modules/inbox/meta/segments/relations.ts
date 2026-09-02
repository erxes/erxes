import { SegmentRelationMeta } from 'erxes-api-shared/core-modules';
import { CONVERSATION_TYPE, MESSAGE_TYPE } from './fields';

/**
 * Traversals into the inbox from the contact on the other end.
 *
 * Both are field joins - a conversation and a message each name their
 * customer, and `customerId` is indexed on both collections - so neither needs
 * a relation record.
 *
 * Messages are reachable directly rather than through the conversation:
 * "wrote a comment saying 111" is a question about what was said, and routing
 * it through the conversation would mean loading every conversation first.
 */
export const INBOX_SEGMENT_RELATIONS: SegmentRelationMeta[] = [
  {
    key: 'customer.conversations',
    label: 'Conversations',
    subjectType: 'core:contacts.customers',
    relatedType: CONVERSATION_TYPE,
    join: { via: 'field', on: 'related', path: 'customerId' },
  },
  {
    key: 'customer.messages',
    label: 'Messages',
    subjectType: 'core:contacts.customers',
    relatedType: MESSAGE_TYPE,
    join: { via: 'field', on: 'related', path: 'customerId' },
  },
];
