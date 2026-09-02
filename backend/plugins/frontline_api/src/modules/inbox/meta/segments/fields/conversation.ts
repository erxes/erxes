import {
  booleanField,
  dateField,
  lookupField,
  numberField,
  SEGMENT_ID_OPERATORS,
  SegmentFieldMeta,
  staticField,
  textField,
} from 'erxes-api-shared/core-modules';
import { CONVERSATION_STATUSES } from '~/modules/inbox/db/definitions/constants';

/**
 * Filterable conversation fields.
 *
 * Chosen for what someone building an audience would name rather than for
 * what the document holds: the read receipts, operator state, bot control
 * blocks and Call Pro candidate lists are all working state.
 *
 * `content` is only the snippet the inbox lists. What someone actually wrote
 * lives on the message, which is why searching for it goes through the
 * `customer.messages` relation instead of here.
 */

export const CONVERSATION_SEGMENT_FIELDS: SegmentFieldMeta[] = [
  staticField({
    key: 'status',
    label: 'Status',
    options: CONVERSATION_STATUSES.ALL,
  }),

  lookupField({
    key: 'assignedUserId',
    label: 'Assigned user',
    query: { name: 'users', labelField: 'email' },
  }),
  lookupField({
    key: 'tagIds',
    label: 'Tags',
    query: { name: 'tags', labelField: 'name' },
  }),

  textField({ key: 'integrationId', label: 'Integration' }),

  // Derived: a conversation stores which integration it arrived through, and
  // the channel is a property of that integration. This is what answers "came
  // in from Facebook" without every conversation carrying the channel twice.
  {
    key: 'integrationKind',
    label: 'Channel',
    operators: SEGMENT_ID_OPERATORS,
    kind: 'derived',
    dependsOn: [
      { fields: ['integrationId'] },
      {
        contentType: 'frontline:inbox.integrations',
        fields: ['kind'],
        via: 'integrationId',
      },
    ],
    input: 'text',
  },

  numberField({ key: 'messageCount', label: 'Message count' }),
  booleanField({
    key: 'isCustomerRespondedLast',
    label: 'Customer replied last',
  }),
  booleanField({ key: 'isBot', label: 'Handled by bot' }),

  dateField({ key: 'createdAt', label: 'Created at' }),
  // Touched by every message, so "no conversation in 30 days" reads off this.
  dateField({ key: 'updatedAt', label: 'Last activity' }),
  dateField({ key: 'closedAt', label: 'Closed at' }),
  dateField({ key: 'firstRespondedDate', label: 'First responded date' }),
];
