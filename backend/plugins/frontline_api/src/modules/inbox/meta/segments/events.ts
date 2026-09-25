import { sendSegmentChanged } from 'erxes-api-shared/core-modules';
import { CONVERSATION_TYPE } from './fields';

/**
 * Announces a conversation change, but only when a segment could care.
 *
 * The conversation collection has no event dispatcher, and it must not get
 * one: every message written writes back to its conversation, so the standard
 * dispatcher would make the highest-volume write in the product also the
 * highest-volume segment event - and almost none of those change anything a
 * segment reads.
 *
 * So the announcement is made here, from the handful of writes that move a
 * declared field, and nowhere else.
 */

/**
 * Paths a segment condition can be built on that a write may move.
 *
 * `updatedAt`, `messageCount` and `isCustomerRespondedLast` are declared as
 * fields but deliberately absent: they change on every message, and the
 * conditions people build on them - "no activity in 30 days", "more than ten
 * messages" - are the clock-dependent kind, which the nightly rebuild already
 * settles. Announcing them would buy a fresher answer to a question that is
 * asked about yesterday anyway.
 */
const WATCHED = new Set([
  'customerId',
  'integrationId',
  'assignedUserId',
  'tagIds',
  'status',
  'closedAt',
  'isBot',
  'firstRespondedDate',
]);

const moved = (doc: Record<string, unknown>): boolean =>
  Object.keys(doc).some((path) => WATCHED.has(path.split('.')[0]));

/**
 * `doc` is what the write set. Passing it is what keeps a message from
 * announcing anything: its update names only `updatedAt` and `messageCount`.
 */
export const conversationsChanged = (
  subdomain: string,
  conversationIds: string[],
  doc?: Record<string, unknown>,
): void => {
  if (!conversationIds.length) {
    return;
  }

  // No `doc` means the whole record appeared or went away - a create or a
  // delete moves every field there is.
  if (doc && !moved(doc)) {
    return;
  }

  sendSegmentChanged({
    subdomain,
    contentType: CONVERSATION_TYPE,
    docIds: conversationIds,
  });
};
