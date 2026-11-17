import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
  TTemplateFill,
} from 'erxes-api-shared/core-modules';
import { emailBody } from './templateHelpers';

// moduleName:'sales', collectionName:'deals', relationType:'probability'
const DEAL_WON_TRIGGER = 'sales:sales.deals.probability';

const step = (order: number, path: string, from?: string): TTemplateFill => ({
  target: 'step',
  journey: 'won',
  order,
  path,
  ...(from ? { from } : {}),
});

const THANK_YOU_LINES = [
  'Hi {{ trigger.customers.firstName }},',
  'Thank you for choosing us — we are glad to have you as a customer.',
  'If there is anything you need, just reply to this email.',
];

/**
 * A small automation: notifies the team and thanks the customer whenever a
 * deal reaches a stage marked "Won" — in any pipeline, since every org's own
 * Won stage already carries that probability. The thank-you text is the
 * template's own starting draft; an org rewords it in the builder after
 * installing, the same as any other action — it is not asked for here.
 */
export const dealWonTemplate: TTemplate = {
  id: 'sales.deal-won',
  version: 3,
  name: 'Deal won',
  icon: 'IconTrophy',
  description:
    'Notifies your team and emails the customer a thank-you whenever a deal reaches a Won stage.',
  requirements: [
    {
      key: 'team',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who to notify',
      description: 'Told at once when a deal is won.',
      fills: [step(1, 'userIds')],
    },
    {
      key: 'sender',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.EMAIL_SENDER,
      label: 'Choose the address the thank-you comes from',
      description:
        'A verified sender of this organization. Without one there is nowhere for an answer to this email to go.',
      fills: [step(2, 'replyToEmail', 'value'), step(2, 'sender', 'name')],
    },
  ],
  parts: [],
  journeys: [
    {
      key: 'won',
      name: 'Deal won',
      description:
        'Notifies the team and thanks the customer when a deal reaches a Won stage.',
      trigger: { type: DEAL_WON_TRIGGER, config: { probability: 'Won' } },
      flow: [
        {
          order: 1,
          type: 'sendNotification',
          label: 'Tell the team',
          config: {
            userIds: '',
            title: 'Deal #{{ trigger.number }} "{{ trigger.name }}" is won',
            message: 'Total: {{ trigger.totalAmount }}',
            priority: 'medium',
          },
          next: 2,
        },
        {
          order: 2,
          type: 'sendEmail',
          label: 'Thank the customer',
          config: {
            type: 'default',
            fromEmailPlaceHolder: '',
            replyToEmail: '',
            toEmailsPlaceHolders: '{{ trigger.customers.primaryEmail }}',
            ccEmailsPlaceHolders: '',
            subject: 'Thank you for your business',
            ...emailBody(THANK_YOU_LINES),
            sender: '',
          },
        },
      ],
    },
  ],
};
