import { FACEBOOK_MESSAGE_RECIPIENTS } from '@erxes/core-db/integrationEnums';
import { z } from 'zod';
import { type OAuthKeys } from '../define';
import { appAction } from '../appDefinition';
import { Text } from '../gateways/http';
import { graph, pageToken } from './facebookGraph';

const MessageInput = z.object({
  page: Text.pipe(z.string().trim().regex(/^\d+$/, 'a Facebook page id')),
  to: z.enum(FACEBOOK_MESSAGE_RECIPIENTS).default('person'),
  recipient: Text.pipe(z.string().trim().min(1).max(100)),
  text: Text.pipe(z.string().trim().min(1).max(2000)),
});

const Sent = z.object({ message_id: z.string(), recipient_id: Text.optional() });

export const sendMessage = appAction<OAuthKeys, z.output<typeof MessageInput>>({
  key: 'send_message',
  label: 'Send a Messenger message',
  description:
    'The page messages someone who wrote to it in the last 24 hours, or privately answers a comment on its post',
  fields: [
    {
      key: 'page',
      label: 'Page id',
      type: 'text',
      required: true,
      placeholder: '{{event.payload.pageId}}',
    },
    {
      key: 'to',
      label: 'Send to',
      type: 'select',
      required: false,
      options: [
        { value: 'person', label: 'The person who messaged the page' },
        { value: 'commenter', label: 'The person who commented, privately' },
      ],
    },
    {
      key: 'recipient',
      label: 'Person or comment id',
      type: 'text',
      required: true,
      placeholder: '{{event.payload.senderId}}',
      description: 'The sender id of a message, or the comment id for a private reply',
    },
    { key: 'text', label: 'Message', type: 'longtext', required: true },
  ],
  outputs: [
    { key: 'messageId', label: 'Message id', type: 'text' },
    { key: 'recipientId', label: 'Recipient id', type: 'text' },
  ],
  input: MessageInput,
  async run({ client: keys, input }) {
    const sent = await graph('/me/messages', Sent, {
      token: await pageToken(keys.accessToken, input.page),
      method: 'POST',
      body: {
        recipient:
          input.to === 'commenter' ? { comment_id: input.recipient } : { id: input.recipient },
        messaging_type: 'RESPONSE',
        message: { text: input.text },
      },
    });

    return { messageId: sent.message_id, recipientId: sent.recipient_id };
  },
});
