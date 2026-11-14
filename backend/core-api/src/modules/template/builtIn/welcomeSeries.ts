import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
} from 'erxes-api-shared/core-modules';
import {
  CUSTOMERS,
  emailStep,
  field,
  hasEmail,
  segmentPart,
  senderFills,
} from './helpers';

const TO = '{{ trigger.primaryEmail }}';

/**
 * Three emails over a week to a customer added today with an address: a
 * welcome, a nudge to get started, and an offer to help. Customers added
 * before it was switched on are not welcomed.
 */
export const welcomeSeriesTemplate: TTemplate = {
  id: 'core.welcome-series',
  version: 1,
  name: 'Welcome new customers',
  icon: 'IconHeartHandshake',
  description:
    'Sends a new customer three emails over their first week: a welcome, a nudge to get started and an offer to help.',
  requirements: [
    {
      key: 'sender',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.EMAIL_SENDER,
      label: 'Choose the address the emails come from',
      description: 'A verified sender of this organization; replies go to it.',
      fills: senderFills('welcome', [1, 3, 5]),
    },
  ],
  parts: [
    segmentPart('new', 'Customers added today with an email', CUSTOMERS, [
      hasEmail(CUSTOMERS),
      // The day they were added, so existing customers are left alone
      field(CUSTOMERS, 'createdAt', 'woad', 0),
    ]),
  ],
  journeys: [
    {
      key: 'welcome',
      name: 'Welcome new customers',
      description: 'Three emails over the first week of a new customer.',
      // A segment trigger runs once per customer
      trigger: { type: CUSTOMERS, config: { contentId: '{{ parts.new }}' } },
      flow: [
        {
          order: 1,
          type: 'sendEmail',
          label: 'Welcome',
          config: emailStep(TO, 'Welcome!', [
            'Hi {{ trigger.firstName }},',
            'Welcome, and thank you for joining us. We are glad you are here.',
            'Over the next few days we will send you a couple of tips to get the most out of us.',
          ]),
          next: 2,
        },
        {
          order: 2,
          type: 'delay',
          label: 'Wait 3 days',
          config: { value: '3', type: 'day' },
          next: 3,
        },
        {
          order: 3,
          type: 'sendEmail',
          label: 'Get started',
          config: emailStep(TO, 'Getting started', [
            'Hi {{ trigger.firstName }},',
            'Here is the one thing most of our customers do first, and why it helps.',
            'If anything is unclear, just reply to this email.',
          ]),
          next: 4,
        },
        {
          order: 4,
          type: 'delay',
          label: 'Wait 4 days',
          config: { value: '4', type: 'day' },
          next: 5,
        },
        {
          order: 5,
          type: 'sendEmail',
          label: 'Offer help',
          config: emailStep(TO, 'How is it going?', [
            'Hi {{ trigger.firstName }},',
            'It has been a week. How is everything going so far?',
            'Reply with any question and a real person will get back to you.',
          ]),
        },
      ],
    },
  ],
};
