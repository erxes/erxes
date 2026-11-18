import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
} from 'erxes-api-shared/core-modules';
import {
  emailStep,
  FORM_LINK,
  POS_ORDER_EVENT,
  stepFill,
} from './templateHelpers';

// The rating form belongs to frontline; without it the template is hidden
const FORM_SUBMITTED = 'frontline:form.submissions';

/**
 * A day after a POS order is paid, asks the customer to rate it; a rating of
 * 1 or 2 is told to the team at once, while it can still be put right.
 */
export const posReviewTemplate: TTemplate = {
  id: 'sales.pos-review',
  version: 1,
  name: 'Ask for a review after a purchase',
  icon: 'IconStar',
  description:
    'A day after a POS order is paid, emails the customer a 1-5 rating link and alerts your team about a low rating.',
  requirements: [
    {
      key: 'sender',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.EMAIL_SENDER,
      label: 'Choose the address the request comes from',
      description: 'A verified sender of this organization.',
      fills: [
        stepFill('ask')(3, 'replyToEmail', 'value'),
        stepFill('ask')(3, 'sender', 'name'),
      ],
    },
    {
      key: 'team',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who hears about a low rating',
      description: 'Told at once when a customer rates 1 or 2.',
      fills: [stepFill('low')(1, 'userIds')],
    },
  ],
  parts: [
    {
      key: 'rating',
      type: 'frontline:forms.rating',
      label: 'Rating form',
      icon: 'IconStar',
      defaults: {
        name: 'Purchase rating',
        question: 'How happy are you with your purchase?',
        commentQuestion: 'Anything we should do better?',
        thanks: 'Thank you for telling us.',
      },
    },
  ],
  journeys: [
    {
      key: 'ask',
      name: 'Ask for a review after a purchase',
      description: 'Emails a rating link a day after a POS order is paid.',
      trigger: {
        type: POS_ORDER_EVENT,
        config: { eventType: 'paid', posId: '' },
      },
      flow: [
        {
          order: 1,
          type: 'delay',
          label: 'Wait a day',
          config: { value: '1', type: 'day' },
          next: 2,
        },
        {
          order: 2,
          type: FORM_LINK,
          label: 'Make a rating link',
          // The answer is saved as about this order
          config: { formId: '{{ parts.rating.formId }}', expiresInDays: 14 },
          next: 3,
        },
        {
          order: 3,
          type: 'sendEmail',
          label: 'Ask the customer',
          config: emailStep(
            '{{ trigger.customerId.primaryEmail }}',
            'How was your purchase?',
            [
              'Hi,',
              'Thank you for your purchase. How happy are you with it? It takes one click:',
              '{{ actions.2.url }}',
            ],
          ),
        },
      ],
    },
    {
      key: 'low',
      name: 'Low purchase rating → tell the team',
      description: 'Tells the team when a customer rates a purchase 1 or 2.',
      trigger: {
        type: FORM_SUBMITTED,
        config: {
          formId: '{{ parts.rating.formId }}',
          conjunction: 'or',
          conditions: [
            {
              fieldId: '{{ parts.rating.ratingFieldId }}',
              operator: 'e',
              value: '1',
            },
            {
              fieldId: '{{ parts.rating.ratingFieldId }}',
              operator: 'e',
              value: '2',
            },
          ],
        },
      },
      flow: [
        {
          order: 1,
          type: 'sendNotification',
          label: 'Tell the team',
          config: {
            userIds: '',
            title: 'A customer rated a purchase low',
            message: 'Customer: {{ trigger.customerId.primaryEmail }}',
            priority: 'high',
          },
        },
      ],
    },
  ],
};
