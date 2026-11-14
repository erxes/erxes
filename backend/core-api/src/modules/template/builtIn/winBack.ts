import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
} from 'erxes-api-shared/core-modules';
import {
  CUSTOMERS,
  emailStep,
  field,
  hasEmail,
  SEGMENT_MEMBERSHIP,
  segmentPart,
  senderFills,
} from './helpers';

const QUIET_DAYS = 60;

/**
 * Emails a customer who has not been seen for two months. "Seen" is the
 * last visit the widget or messenger recorded; a customer never seen there
 * is not emailed. Each quiet spell is one email.
 */
export const winBackTemplate: TTemplate = {
  id: 'core.win-back',
  version: 1,
  name: 'Win back quiet customers',
  icon: 'IconMoodEmpty',
  description: `Emails a customer ${QUIET_DAYS} days after their last visit to invite them back.`,
  requirements: [
    {
      key: 'sender',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.EMAIL_SENDER,
      label: 'Choose the address the email comes from',
      description: 'A verified sender of this organization.',
      fills: senderFills('win-back', [1]),
    },
  ],
  parts: [
    segmentPart('quiet', `Not seen for ${QUIET_DAYS} days`, CUSTOMERS, [
      hasEmail(CUSTOMERS),
      field(CUSTOMERS, 'lastSeenAt', 'woad', QUIET_DAYS),
    ]),
  ],
  journeys: [
    {
      key: 'win-back',
      name: 'Win back quiet customers',
      description: `Emails a customer on the ${QUIET_DAYS}th day since their last visit.`,
      trigger: {
        type: CUSTOMERS,
        config: { event: SEGMENT_MEMBERSHIP, segmentId: '{{ parts.quiet }}' },
      },
      flow: [
        {
          order: 1,
          type: 'sendEmail',
          label: 'Invite them back',
          config: emailStep('{{ trigger.primaryEmail }}', 'We miss you', [
            'Hi {{ trigger.firstName }},',
            'It has been a while since we last saw you. A lot has happened since then.',
            'Come and have a look. If there is anything we can do better, just reply.',
          ]),
        },
      ],
    },
  ],
};
