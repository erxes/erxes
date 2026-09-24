import { TAutomationBuiltInTemplate } from 'erxes-api-shared/core-modules';

const FACEBOOK_MESSAGE_ACTION = 'frontline:facebook.messages.create';
const FACEBOOK_COMMENT_ACTION = 'frontline:facebook.comments.create';
const TICKET_CREATE_ACTION = 'frontline:tickets.tickets.create';

/**
 * Flows shipped with the plugin, ready from the moment it is deployed.
 *
 * Both start from a thread that already exists — a message or a comment — not
 * from a contact: Facebook only allows a reply inside a conversation the
 * person opened, so a flow that messaged a list of customers could never send
 * anything. That is also why these never appear on a campaign, whose steps run
 * against a customer.
 */
export const facebookWorkflowTemplates: TAutomationBuiltInTemplate[] = [
  {
    id: 'frontline.facebook.comment-then-dm',
    name: 'Answer publicly, continue in private',
    description:
      'Replies under the comment so everyone reading the post sees an answer, then carries the conversation into Messenger.',
    flow: [
      {
        order: 1,
        type: FACEBOOK_COMMENT_ACTION,
        label: 'Public reply',
        config: {
          texts: [
            'Thanks for reaching out — we have sent you a message so we can help properly.',
          ],
        },
        next: 2,
      },
      {
        order: 2,
        type: FACEBOOK_MESSAGE_ACTION,
        label: 'Private message',
        config: {
          messages: [
            {
              _id: 'comment-then-dm-message',
              type: 'text',
              text: 'Hi! You commented on our post — tell us what you need and we will take it from here.',
              buttons: [],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'frontline.facebook.reply-and-ticket',
    name: 'Reply, then open a ticket',
    description:
      'Answers the message straight away and files a ticket behind it, so a reply that needs following up does not end at the reply.',
    flow: [
      {
        order: 1,
        type: FACEBOOK_MESSAGE_ACTION,
        label: 'Acknowledge the message',
        config: {
          messages: [
            {
              _id: 'reply-and-ticket-message',
              type: 'text',
              text: 'Thanks for writing in — we have logged this and someone will come back to you shortly.',
              buttons: [],
            },
          ],
        },
        next: 2,
      },
      {
        order: 2,
        type: TICKET_CREATE_ACTION,
        label: 'Open a ticket',
        config: {
          // What the person actually wrote, so the ticket is findable by the
          // words they used rather than by a number alone.
          name: '{{ trigger.content }}',
          // Filled in from the requirements below.
          channelId: '',
          pipelineId: '',
          statusId: '',
        },
      },
    ],
    // Asked as one question: a status only means something inside a pipeline,
    // and a pipeline inside a channel, so the picker offers all three together
    // and the answer carries all three.
    requirements: [
      {
        key: 'destination',
        kind: 'frontline:tickets.status',
        label: 'Choose where the ticket opens',
        description:
          'The channel and pipeline tickets from this flow are filed in, and the status they start in.',
        fills: [
          { order: 2, path: 'channelId', from: 'channelId' },
          { order: 2, path: 'pipelineId', from: 'pipelineId' },
          { order: 2, path: 'statusId', from: 'status' },
        ],
      },
    ],
  },
];
