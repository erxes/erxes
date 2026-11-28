import type { ActionField, DataField } from '@erxes/core-contract';
import { FACEBOOK_ATTACHMENT_KINDS } from '@erxes/core-db/integrationEnums';
import { z } from 'zod';
import { type OAuthKeys } from '@erxes/plugin-sdk/integrations';
import { appAction, Text } from '@erxes/plugin-sdk/integrations';
import { graph, pageToken } from './facebookGraph';

export const PageId = Text.pipe(z.string().trim().regex(/^\d+$/, 'a Facebook page id'));

export const GraphId = Text.pipe(
  z
    .string()
    .trim()
    .regex(/^\d+(_\d+)?$/, 'a Facebook id, like 1234567890 or 1234567890_987654321'),
);

export const pageField: ActionField = {
  key: 'page',
  label: 'Page',
  type: 'plugin_record',
  recordType: 'page',
  required: true,
};

/** One of the page's posts: its latest ones, or the run's post. */
export const postField = (key: string): ActionField => ({
  key,
  label: 'Post',
  type: 'plugin_record',
  recordType: 'post',
  dependsOn: 'page',
  required: true,
});

/** A comment on one of the page's posts: the run's comment. */
export const commentField = (key: string): ActionField => ({
  key,
  label: 'Comment',
  type: 'plugin_record',
  recordType: 'comment',
  required: true,
});

export const node = (id: string) => `/${encodeURIComponent(id)}`;

export const isoTime = (time: string) =>
  new Date(time.replace(/([+-]\d{2})(\d{2})$/, '$1:$2')).toISOString();

const Recipient = Text.pipe(z.string().trim().min(1).max(100));

const MessageText = Text.pipe(z.string().trim().min(1).max(2000));

const MessageInput = z.object({ page: PageId, recipient: Recipient, text: MessageText });

const Sent = z.object({ message_id: z.string(), recipient_id: Text.optional() });

const SENT_OUTPUTS: DataField[] = [
  { key: 'messageId', label: 'Message id', type: 'text' },
  { key: 'recipientId', label: 'Recipient id', type: 'text', recordType: 'person' },
];

const personField: ActionField = {
  key: 'recipient',
  label: 'Person',
  type: 'plugin_record',
  recordType: 'person',
  required: true,
  description: 'Someone who messaged the page',
};

const MESSAGE_FIELD: ActionField = {
  key: 'text',
  label: 'Message',
  type: 'longtext',
  required: true,
};

const sent = async (keys: OAuthKeys, page: string, body: Record<string, unknown>) => {
  const answer = await graph('/me/messages', Sent, {
    token: await pageToken(keys.accessToken, page),
    method: 'POST',
    body: { messaging_type: 'RESPONSE', ...body },
  });

  return { messageId: answer.message_id, recipientId: answer.recipient_id };
};

const sendMessage = appAction<OAuthKeys, z.output<typeof MessageInput>>({
  key: 'send_message',
  label: 'Send a Messenger message',
  description: 'The page messages someone who wrote to it in the last 24 hours',
  fields: [pageField, personField, MESSAGE_FIELD],
  outputs: SENT_OUTPUTS,
  input: MessageInput,
  run: ({ client: keys, input }) =>
    sent(keys, input.page, { recipient: { id: input.recipient }, message: { text: input.text } }),
});

const PrivateReplyInput = z.object({ page: PageId, commentId: Recipient, text: MessageText });

const privateReply = appAction<OAuthKeys, z.output<typeof PrivateReplyInput>>({
  key: 'private_reply',
  label: 'Reply privately to a comment',
  description: "The page answers a comment on its post in the commenter's Messenger",
  fields: [pageField, commentField('commentId'), MESSAGE_FIELD],
  outputs: SENT_OUTPUTS,
  input: PrivateReplyInput,
  run: ({ client: keys, input }) =>
    sent(keys, input.page, {
      recipient: { comment_id: input.commentId },
      message: { text: input.text },
    }),
});

const AttachmentInput = z.object({
  page: PageId,
  recipient: Text.pipe(z.string().trim().min(1).max(100)),
  kind: z.enum(FACEBOOK_ATTACHMENT_KINDS).default('image'),
  url: z
    .url({ protocol: /^https?$/ })
    .trim()
    .max(2000),
});

const sendAttachment = appAction<OAuthKeys, z.output<typeof AttachmentInput>>({
  key: 'send_attachment',
  label: 'Send a Messenger file',
  description:
    'The page sends a photo, video, audio file or document, from a public link, to someone who wrote to it in the last 24 hours',
  fields: [
    pageField,
    personField,
    {
      key: 'kind',
      label: 'File is',
      type: 'select',
      required: false,
      options: [
        { value: 'image', label: 'A photo or GIF' },
        { value: 'video', label: 'A video' },
        { value: 'audio', label: 'An audio file' },
        { value: 'file', label: 'A document' },
      ],
    },
    {
      key: 'url',
      label: 'File link',
      type: 'text',
      required: true,
      placeholder: 'https://…',
      description: 'A public link Facebook can download, up to 25 MB',
    },
  ],
  outputs: SENT_OUTPUTS,
  input: AttachmentInput,
  run: ({ client: keys, input }) =>
    sent(keys, input.page, {
      recipient: { id: input.recipient },
      message: { attachment: { type: input.kind, payload: { url: input.url } } },
    }),
});

const ContactInput = z.object({ page: PageId, recipient: GraphId });

const Profile = z
  .object({
    id: Text,
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    profile_pic: z.string().optional(),
  })
  .transform((person) => ({
    personId: person.id,
    firstName: person.first_name ?? null,
    lastName: person.last_name ?? null,
    picture: person.profile_pic ?? null,
  }));

const getContact = appAction<OAuthKeys, z.output<typeof ContactInput>>({
  key: 'get_contact',
  label: 'Get a Messenger contact',
  description: 'Look up the name and picture of someone who messaged the page',
  fields: [pageField, personField],
  outputs: [
    { key: 'personId', label: 'Person id', type: 'text', recordType: 'person' },
    { key: 'firstName', label: 'First name', type: 'text' },
    { key: 'lastName', label: 'Last name', type: 'text' },
    { key: 'picture', label: 'Profile picture link', type: 'text' },
  ],
  input: ContactInput,
  async run({ client: keys, input }) {
    return graph(`${node(input.recipient)}?fields=first_name,last_name,profile_pic`, Profile, {
      token: await pageToken(keys.accessToken, input.page),
    });
  },
});

export const MESSENGER_ACTIONS = [sendMessage, privateReply, sendAttachment, getContact];
