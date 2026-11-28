import type { ActionField } from '@erxes/core-contract';
import { z } from 'zod';
import { appAction, type OAuthKeys, Text } from '@erxes/plugin-sdk/integrations';
import {
  commentField,
  GraphId,
  isoTime,
  node,
  PageId,
  pageField,
  postField,
} from './facebookActions';
import { Done, graph, pageToken } from './facebookGraph';
import { COMMENT_ID } from './facebookOutputs';

const CommentRef = z.object({ page: PageId, commentId: GraphId });

const CommentInput = z.object({
  page: PageId,
  target: GraphId,
  message: Text.pipe(z.string().trim().min(1).max(8000)),
  photo: z
    .url({ protocol: /^https?$/ })
    .trim()
    .max(2000)
    .optional(),
});

const Created = z.object({ id: Text });

const comment = (key: string, label: string, target: ActionField) =>
  appAction<OAuthKeys, z.output<typeof CommentInput>>({
    key,
    label,
    description: `${label} in public, as the page`,
    fields: [
      pageField,
      target,
      { key: 'message', label: 'Comment', type: 'longtext', required: true },
      {
        key: 'photo',
        label: 'Photo link',
        type: 'text',
        required: false,
        placeholder: 'https://…',
        description: 'A public link to a photo or GIF to add',
      },
    ],
    outputs: [COMMENT_ID],
    input: CommentInput,
    async run({ client: keys, input }) {
      const created = await graph(`${node(input.target)}/comments`, Created, {
        token: await pageToken(keys.accessToken, input.page),
        method: 'POST',
        body: { message: input.message, attachment_url: input.photo },
      });

      return { commentId: created.id };
    },
  });

const HideInput = CommentRef.extend({ show: z.boolean().optional() });

const hideComment = appAction<OAuthKeys, z.output<typeof HideInput>>({
  key: 'hide_comment',
  label: 'Hide a comment',
  description:
    "Hide a comment on one of the page's posts. Its writer and their friends still see it; nobody else does.",
  fields: [
    pageField,
    commentField('commentId'),
    {
      key: 'show',
      label: 'Show it again instead',
      type: 'boolean',
      required: false,
      description: 'On: a hidden comment shows again',
    },
  ],
  input: HideInput,
  async run({ client: keys, input }) {
    await graph(node(input.commentId), Done, {
      token: await pageToken(keys.accessToken, input.page),
      method: 'POST',
      body: { is_hidden: !input.show },
    });

    return {};
  },
});

const deleteComment = appAction<OAuthKeys, z.output<typeof CommentRef>>({
  key: 'delete_comment',
  label: 'Delete a comment',
  description: "Delete a comment on one of the page's posts",
  fields: [pageField, commentField('commentId')],
  input: CommentRef,
  async run({ client: keys, input }) {
    await graph(node(input.commentId), Done, {
      token: await pageToken(keys.accessToken, input.page),
      method: 'DELETE',
    });

    return {};
  },
});

const LikeInput = z.object({ page: PageId, target: GraphId });

const like = (key: string, label: string, target: ActionField) =>
  appAction<OAuthKeys, z.output<typeof LikeInput>>({
    key,
    label,
    description: `${label}, as the page, on its own timeline`,
    fields: [pageField, target],
    input: LikeInput,
    async run({ client: keys, input }) {
      await graph(`${node(input.target)}/likes`, Done, {
        token: await pageToken(keys.accessToken, input.page),
        method: 'POST',
      });

      return {};
    },
  });

const Comment = z
  .object({
    id: Text,
    message: z.string().optional(),
    created_time: z.string(),
    from: z.object({ id: Text, name: z.string().optional() }).optional(),
    parent: z.object({ id: Text }).optional(),
    permalink_url: z.string().optional(),
    like_count: z.number().optional(),
    comment_count: z.number().optional(),
    is_hidden: z.boolean().optional(),
  })
  .transform((found) => ({
    commentId: found.id,
    message: found.message ?? null,
    createdTime: isoTime(found.created_time),
    fromId: found.from?.id ?? null,
    fromName: found.from?.name ?? null,
    parentId: found.parent?.id ?? null,
    link: found.permalink_url ?? null,
    likes: found.like_count ?? 0,
    replies: found.comment_count ?? 0,
    hidden: found.is_hidden ?? false,
  }));

const COMMENT_FIELDS =
  'message,created_time,from,parent{id},permalink_url,like_count,comment_count,is_hidden';

const getComment = appAction<OAuthKeys, z.output<typeof CommentRef>>({
  key: 'get_comment',
  label: 'Get a comment',
  description: "Look up a comment's text, writer, link, likes and replies",
  fields: [pageField, commentField('commentId')],
  outputs: [
    COMMENT_ID,
    { key: 'message', label: 'Text', type: 'text' },
    { key: 'createdTime', label: 'Written at', type: 'date' },
    { key: 'fromId', label: 'Person id', type: 'text' },
    { key: 'fromName', label: 'Person', type: 'text' },
    { key: 'parentId', label: 'Answers comment', type: 'text' },
    { key: 'link', label: 'Comment link', type: 'text' },
    { key: 'likes', label: 'Likes', type: 'number' },
    { key: 'replies', label: 'Replies', type: 'number' },
    { key: 'hidden', label: 'Hidden', type: 'boolean' },
  ],
  input: CommentRef,
  async run({ client: keys, input }) {
    return graph(`${node(input.commentId)}?fields=${encodeURIComponent(COMMENT_FIELDS)}`, Comment, {
      token: await pageToken(keys.accessToken, input.page),
    });
  },
});

export const COMMENT_ACTIONS = [
  comment('comment_on_post', 'Comment on a post', postField('target')),
  comment('reply_to_comment', 'Reply to a comment', commentField('target')),
  hideComment,
  deleteComment,
  like('like_post', 'Like a post', postField('target')),
  like('like_comment', 'Like a comment', commentField('target')),
  getComment,
];
