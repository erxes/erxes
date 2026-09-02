import {
  booleanField,
  dateField,
  SegmentFieldMeta,
  textField,
} from 'erxes-api-shared/core-modules';

/**
 * Filterable message fields.
 *
 * Declared so a relation into messages has a vocabulary, not so anyone can
 * build a segment of messages - a single message is nobody's audience. What
 * this exists for is "the customer who wrote 111", which is a condition on the
 * message reached from a customer.
 *
 * `content` carries no index: a `contains` over it is a scan, which is fine
 * against one customer's messages and is not a way to filter every message in
 * the system.
 */

export const MESSAGE_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  textField({ key: 'content', label: 'Content' }),
  booleanField({ key: 'internal', label: 'Is internal note' }),
  booleanField({ key: 'fromBot', label: 'Sent by bot' }),
  textField({ key: 'conversationId', label: 'Conversation' }),
  dateField({ key: 'createdAt', label: 'Created at' }),
];
