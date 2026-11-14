import {
  TEMPLATE_CORE_REQUIREMENT_KINDS,
  TTemplate,
  TTemplateFill,
} from 'erxes-api-shared/core-modules';

const TICKET_STATUS_CHANGED = 'frontline:tickets.tickets.statusChanged';
const FORM_LINK = 'frontline:form.links.create';
const FORM_SUBMITTED = 'frontline:form.submissions';

const step = (order: number, path: string, from?: string): TTemplateFill => ({
  target: 'step',
  journey: 'resolved',
  order,
  path,
  ...(from ? { from } : {}),
});

const RESOLVED_LINES = [
  'Hi,',
  'Your ticket #{{ trigger.number }} "{{ trigger.name }}" has been resolved. How did we do?',
  '{{ actions.1.url }}',
];

// The email editor opens from `contentJson`; `content` is the html that is sent
const emailBody = (lines: string[]) => ({
  content: lines.map((line) => `<p>${line}</p>`).join(''),
  contentJson: {
    type: 'doc',
    content: lines.map((text) => ({
      type: 'paragraph',
      content: [{ type: 'text', text }],
    })),
  },
  contentFormat: 'maily',
});

export const ticketResolvedRatingTemplate: TTemplate = {
  id: 'frontline.ticket-resolved-rating',
  version: 4,
  name: 'Ticket resolved → ask for a rating',
  icon: 'IconMoodSmile',
  description:
    'Emails the customer a 1-5 rating link when a ticket in your chosen pipeline is resolved, and alerts your team about a low rating.',
  requirements: [
    {
      key: 'destination',
      kind: 'frontline:tickets.status',
      label: 'Which status means resolved',
      description:
        'The channel, pipeline and status a ticket reaches when it is done.',
      fills: [
        {
          target: 'trigger',
          journey: 'resolved',
          path: 'pipelineId',
          from: 'pipelineId',
        },
        {
          target: 'trigger',
          journey: 'resolved',
          path: 'toStatusIds',
          from: 'status',
        },
      ],
    },
    {
      key: 'sender',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.EMAIL_SENDER,
      label: 'Choose the address this comes from',
      description:
        'A verified sender of this organization. Without one there is nowhere for an answer to go.',
      fills: [step(2, 'replyToEmail', 'value'), step(2, 'sender', 'name')],
    },
    {
      key: 'team',
      kind: TEMPLATE_CORE_REQUIREMENT_KINDS.TEAM_MEMBERS,
      label: 'Who hears about a low rating',
      description: 'Told at once when a customer rates a ticket 1 or 2.',
      fills: [{ target: 'step', journey: 'low', order: 1, path: 'userIds' }],
    },
  ],
  parts: [
    {
      key: 'rating',
      type: 'frontline:forms.rating',
      label: 'Rating form',
      icon: 'IconMoodSmile',
      defaults: {
        name: 'Ticket rating',
        question: 'How well was your ticket handled?',
        commentQuestion: 'Anything we should do better?',
        thanks: 'Thank you for telling us.',
      },
    },
  ],
  journeys: [
    {
      key: 'resolved',
      name: 'Ticket resolved → ask for a rating',
      description:
        'Emails the customer a rating link once a ticket is resolved.',
      trigger: { type: TICKET_STATUS_CHANGED, config: {} },
      flow: [
        {
          order: 1,
          type: FORM_LINK,
          label: 'Make a rating link',
          config: { formId: '{{ parts.rating.formId }}', expiresInDays: 14 },
          next: 2,
        },
        {
          order: 2,
          type: 'sendEmail',
          label: 'Email the customer',
          config: {
            type: 'default',
            fromEmailPlaceHolder: '',
            replyToEmail: '',
            toEmailsPlaceHolders: '{{ trigger.customerId.primaryEmail }}',
            ccEmailsPlaceHolders: '',
            subject: 'Your ticket #{{ trigger.number }} is resolved',
            ...emailBody(RESOLVED_LINES),
            sender: '',
          },
        },
      ],
    },
    {
      key: 'low',
      name: 'Low ticket rating → tell the team',
      description: 'Tells the team when a customer rates a ticket 1 or 2.',
      trigger: {
        type: FORM_SUBMITTED,
        config: {
          formId: '{{ parts.rating.formId }}',
          conjunction: 'or',
          conditions: ['1', '2'].map((value) => ({
            fieldId: '{{ parts.rating.ratingFieldId }}',
            operator: 'e',
            value,
          })),
        },
      },
      flow: [
        {
          order: 1,
          type: 'sendNotification',
          label: 'Tell the team',
          config: {
            userIds: '',
            title: 'A customer rated a resolved ticket low',
            message: 'Customer: {{ trigger.customerId.primaryEmail }}',
            priority: 'high',
          },
        },
      ],
    },
  ],
};
