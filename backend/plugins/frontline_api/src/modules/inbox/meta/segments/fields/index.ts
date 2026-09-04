import { SegmentFieldMeta } from 'erxes-api-shared/core-modules';
import { CONVERSATION_SEGMENT_FIELDS } from './conversation';
import { MESSAGE_SEGMENT_FIELDS } from './message';

/** As the event dispatcher would name them. */
export const CONVERSATION_TYPE = 'frontline:inbox.conversations';
export const MESSAGE_TYPE = 'frontline:inbox.conversationMessages';

/**
 * Messages are declared but never offered as a subject: `contentTypes` is what
 * the sidebar reads, and this is what a condition may name. A relation into
 * messages needs the second without the first.
 */
export const INBOX_SEGMENT_FIELDS: Record<string, SegmentFieldMeta[]> = {
  [CONVERSATION_TYPE]: CONVERSATION_SEGMENT_FIELDS,
  [MESSAGE_TYPE]: MESSAGE_SEGMENT_FIELDS,
};

export { CONVERSATION_SEGMENT_FIELDS, MESSAGE_SEGMENT_FIELDS };
