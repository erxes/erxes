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

/**
 * Emails a customer on their birthday. The segment holds those whose birthday
 * is today and is re-checked every night, so each enters once a year.
 */
export const birthdayGreetingTemplate: TTemplate = {
  id: 'core.birthday-greeting',
  version: 1,
  name: 'Birthday greetings',
  icon: 'IconCake',
  description: 'Emails every customer with an address on their birthday.',
  requirements: [
    {
      key: 'sender',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.EMAIL_SENDER,
      label: 'Choose the address the greeting comes from',
      description: 'A verified sender of this organization.',
      fills: senderFills('birthday', [1]),
    },
  ],
  parts: [
    segmentPart('today', 'Birthday today', CUSTOMERS, [
      hasEmail(CUSTOMERS),
      field(CUSTOMERS, 'birthDate', 'annt'),
    ]),
  ],
  journeys: [
    {
      key: 'birthday',
      name: 'Birthday greetings',
      description: "Emails a customer on the day of their birthday.",
      // Runs on every entry: once a year
      trigger: {
        type: CUSTOMERS,
        config: { event: SEGMENT_MEMBERSHIP, segmentId: '{{ parts.today }}' },
      },
      flow: [
        {
          order: 1,
          type: 'sendEmail',
          label: 'Wish them a happy birthday',
          config: emailStep('{{ trigger.primaryEmail }}', 'Happy birthday!', [
            'Hi {{ trigger.firstName }},',
            'Happy birthday from all of us! We hope your day is a great one.',
          ]),
        },
      ],
    },
  ],
};
