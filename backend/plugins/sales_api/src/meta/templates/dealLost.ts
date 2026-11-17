import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
} from 'erxes-api-shared/core-modules';
import {
  DEAL_PROBABILITY_TRIGGER,
  emailStep,
  stepFill,
} from './templateHelpers';

const step = stepFill('lost');

/**
 * Tells the team a deal is lost and asks the customer, once, what tipped it.
 * The question is the template's own draft, reworded in the builder.
 */
export const dealLostTemplate: TTemplate = {
  id: 'sales.deal-lost',
  version: 1,
  name: 'Deal lost → ask why',
  icon: 'IconMoodSad',
  description:
    'Tells your team when a deal reaches a Lost stage and asks the customer what made them decide.',
  requirements: [
    {
      key: 'team',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who to tell',
      description: 'Told at once when a deal is lost.',
      fills: [step(1, 'userIds')],
    },
    {
      key: 'sender',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.EMAIL_SENDER,
      label: 'Choose the address the question comes from',
      description:
        'A verified sender of this organization; the customer answers to it.',
      fills: [step(2, 'replyToEmail', 'value'), step(2, 'sender', 'name')],
    },
  ],
  parts: [],
  journeys: [
    {
      key: 'lost',
      name: 'Deal lost → ask why',
      description:
        'Tells the team and asks the customer for a reason when a deal reaches a Lost stage.',
      trigger: {
        type: DEAL_PROBABILITY_TRIGGER,
        config: { probability: 'Lost' },
      },
      flow: [
        {
          order: 1,
          type: 'sendNotification',
          label: 'Tell the team',
          config: {
            userIds: '',
            title: 'Deal #{{ trigger.number }} "{{ trigger.name }}" is lost',
            message: 'Total: {{ trigger.totalAmount }}',
            priority: 'medium',
          },
          next: 2,
        },
        {
          order: 2,
          type: 'sendEmail',
          label: 'Ask the customer why',
          config: emailStep(
            '{{ trigger.customers.primaryEmail }}',
            'Could you tell us what we could have done better?',
            [
              'Hi {{ trigger.customers.firstName }},',
              'Thank you for considering us. We understand you decided not to go ahead this time.',
              'If you have a minute, just reply and tell us what made the difference. It helps us do better.',
            ],
          ),
        },
      ],
    },
  ],
};
