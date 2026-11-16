import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
  TTemplateFill,
} from 'erxes-api-shared/core-modules';

const TIER_CHANGED = 'loyalty:score.tier';
// Answered by loyalty_ui's template requirement: an account type id
const ACCOUNT_TYPE = 'loyalty:score.accountType';

const step = (order: number, path: string, from?: string): TTemplateFill => ({
  target: 'step',
  journey: 'upgraded',
  order,
  path,
  ...(from ? { from } : {}),
});

const LINES = [
  'Congratulations!',
  'You have reached the {{ trigger.toTier }} tier. Thank you for being with us.',
  'Your new benefits apply from your next purchase.',
];

/** Congratulates a customer by email when they move up a tier of a wallet. */
export const tierUpgradeTemplate: TTemplate = {
  id: 'loyalty.tier-upgrade',
  version: 1,
  name: 'Congratulate on a tier upgrade',
  icon: 'IconCrown',
  description:
    'Emails a customer when they move up to a higher tier of your loyalty program.',
  requirements: [
    {
      key: 'accountType',
      kind: ACCOUNT_TYPE,
      label: 'Which loyalty wallet',
      description: 'Tier moves of this wallet are congratulated.',
      fills: [{ target: 'trigger', journey: 'upgraded', path: 'accountTypeId' }],
    },
    {
      key: 'sender',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.EMAIL_SENDER,
      label: 'Choose the address the email comes from',
      description: 'A verified sender of this organization.',
      fills: [step(1, 'replyToEmail', 'value'), step(1, 'sender', 'name')],
    },
  ],
  parts: [],
  journeys: [
    {
      key: 'upgraded',
      name: 'Congratulate on a tier upgrade',
      description: 'Emails the customer when they move up a tier.',
      trigger: {
        type: TIER_CHANGED,
        config: { accountTypeId: '', direction: 'up' },
      },
      flow: [
        {
          order: 1,
          type: 'sendEmail',
          label: 'Congratulate the customer',
          config: {
            type: 'default',
            fromEmailPlaceHolder: '',
            replyToEmail: '',
            toEmailsPlaceHolders: '{{ trigger.customerId.primaryEmail }}',
            ccEmailsPlaceHolders: '',
            subject: 'You reached a new tier',
            // The email editor opens from `contentJson`; `content` is sent
            content: LINES.map((line) => `<p>${line}</p>`).join(''),
            contentJson: {
              type: 'doc',
              content: LINES.map((text) => ({
                type: 'paragraph',
                content: [{ type: 'text', text }],
              })),
            },
            contentFormat: 'maily',
            sender: '',
          },
        },
      ],
    },
  ],
};
