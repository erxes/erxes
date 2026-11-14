import { TTemplate } from 'erxes-api-shared/core-modules';
import {
  DEALS,
  dealField,
  OPEN_DEAL_CONDITIONS,
  SEGMENT_MEMBERSHIP,
  SEGMENT_PART,
} from './templateHelpers';

const STALE_DAYS = 7;

/**
 * Reminds whoever owns a deal when it has sat in one stage for a week. The
 * segment counts days since the stage last changed and is re-checked every
 * night, so the reminder comes on that day, once per stay in a stage.
 */
export const staleDealTemplate: TTemplate = {
  id: 'sales.stale-deal',
  version: 1,
  name: 'Stale deal reminder',
  icon: 'IconHourglass',
  description: `Reminds the people on a deal when it has sat in the same stage for ${STALE_DAYS} days.`,
  requirements: [],
  parts: [
    {
      key: 'stale',
      type: SEGMENT_PART,
      label: 'Segment',
      icon: 'IconFilter',
      defaults: {
        name: `Open deals unchanged for ${STALE_DAYS} days`,
        contentType: DEALS,
        root: {
          kind: 'group',
          conjunction: 'and',
          children: [
            ...OPEN_DEAL_CONDITIONS,
            dealField('stageChangedDate', 'woad', STALE_DAYS),
          ],
        },
      },
    },
  ],
  journeys: [
    {
      key: 'stale',
      name: 'Stale deal reminder',
      description: `Notifies the deal's assigned members after ${STALE_DAYS} days in one stage.`,
      trigger: {
        type: DEALS,
        // Runs on every entry: each stay in a stage is a new reason to remind
        config: { event: SEGMENT_MEMBERSHIP, segmentId: '{{ parts.stale }}' },
      },
      flow: [
        {
          order: 1,
          type: 'sendNotification',
          label: 'Remind the owner',
          config: {
            userIds: '{{ trigger.assignedUserIds }}',
            title: `Deal #{{ trigger.number }} "{{ trigger.name }}" has not moved for ${STALE_DAYS} days`,
            message: 'Total: {{ trigger.totalAmount }}',
            priority: 'medium',
          },
        },
      ],
    },
  ],
};
