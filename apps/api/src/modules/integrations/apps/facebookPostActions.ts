import type { DataField } from '@erxes/core-contract';
import { z } from 'zod';
import { appAction, type OAuthKeys, Text } from '@erxes/plugin-sdk/integrations';
import { GraphId, isoTime, node, PageId, pageField, postField } from './facebookActions';
import { Done, graph, pageToken } from './facebookGraph';
import { POST_ID } from './facebookOutputs';

const Link = z
  .url({ protocol: /^https?$/ })
  .trim()
  .max(2000);

const Message = Text.pipe(z.string().trim().max(63_206));

const POST_FIELD = postField('postId');

const POST_OUTPUTS: DataField[] = [POST_ID, { key: 'link', label: 'Post link', type: 'text' }];

const posted = (postId: string) => ({ postId, link: `https://www.facebook.com/${postId}` });

const PublishInput = z
  .object({
    page: PageId,
    message: Message.optional(),
    link: Link.optional(),
    photo: Link.optional(),
  })
  .refine((post) => post.message || post.link || post.photo, {
    message: 'Write the text, or give a link or a photo',
    path: ['message'],
  })
  .refine((post) => !(post.link && post.photo), {
    message: 'A post takes a link or a photo, not both',
    path: ['photo'],
  });

const Created = z.object({ id: Text, post_id: Text.optional() });

const publishPost = appAction<OAuthKeys, z.output<typeof PublishInput>>({
  key: 'publish_post',
  label: 'Publish a post',
  description: "Post on the page's timeline: text, with a link or a photo",
  fields: [
    pageField,
    { key: 'message', label: 'Text', type: 'longtext', required: false },
    {
      key: 'link',
      label: 'Link',
      type: 'text',
      required: false,
      placeholder: 'https://…',
      description: 'Shown as a preview card under the text',
    },
    {
      key: 'photo',
      label: 'Photo link',
      type: 'text',
      required: false,
      placeholder: 'https://…',
      description: 'A public link to a photo. Leave the link above blank.',
    },
  ],
  outputs: [...POST_OUTPUTS],
  input: PublishInput,
  async run({ client: keys, input }) {
    const token = await pageToken(keys.accessToken, input.page);

    if (input.photo) {
      const photo = await graph(`${node(input.page)}/photos`, Created, {
        token,
        method: 'POST',
        body: { url: input.photo, caption: input.message },
      });

      return posted(photo.post_id ?? photo.id);
    }

    const post = await graph(`${node(input.page)}/feed`, Created, {
      token,
      method: 'POST',
      body: { message: input.message, link: input.link },
    });

    return posted(post.id);
  },
});

const EditInput = z.object({
  page: PageId,
  postId: GraphId,
  message: Message.pipe(z.string().min(1)),
});

const editPost = appAction<OAuthKeys, z.output<typeof EditInput>>({
  key: 'edit_post',
  label: 'Edit a post',
  description: 'Change the text of a post the page published',
  fields: [
    pageField,
    POST_FIELD,
    { key: 'message', label: 'New text', type: 'longtext', required: true },
  ],
  outputs: [...POST_OUTPUTS],
  input: EditInput,
  async run({ client: keys, input }) {
    await graph(node(input.postId), Done, {
      token: await pageToken(keys.accessToken, input.page),
      method: 'POST',
      body: { message: input.message },
    });

    return posted(input.postId);
  },
});

const PostRef = z.object({ page: PageId, postId: GraphId });

const deletePost = appAction<OAuthKeys, z.output<typeof PostRef>>({
  key: 'delete_post',
  label: 'Delete a post',
  description: 'Delete a post the page published',
  fields: [pageField, POST_FIELD],
  input: PostRef,
  async run({ client: keys, input }) {
    await graph(node(input.postId), Done, {
      token: await pageToken(keys.accessToken, input.page),
      method: 'DELETE',
    });

    return {};
  },
});

const Total = z.object({ summary: z.object({ total_count: z.number() }) }).optional();

const Post = z
  .object({
    id: Text,
    message: z.string().optional(),
    created_time: z.string(),
    permalink_url: z.string().optional(),
    full_picture: z.string().optional(),
    shares: z.object({ count: z.number() }).optional(),
    reactions: Total,
    comments: Total,
  })
  .transform((post) => ({
    postId: post.id,
    message: post.message ?? null,
    createdTime: isoTime(post.created_time),
    link: post.permalink_url ?? null,
    picture: post.full_picture ?? null,
    reactions: post.reactions?.summary.total_count ?? 0,
    comments: post.comments?.summary.total_count ?? 0,
    shares: post.shares?.count ?? 0,
  }));

const POST_FIELDS = [
  'message',
  'created_time',
  'permalink_url',
  'full_picture',
  'shares',
  'reactions.summary(total_count).limit(0)',
  'comments.summary(total_count).limit(0)',
].join(',');

const getPost = appAction<OAuthKeys, z.output<typeof PostRef>>({
  key: 'get_post',
  label: 'Get a post',
  description:
    "Look up a post's text, link, picture, and how many reactions, comments and shares it has",
  fields: [pageField, POST_FIELD],
  outputs: [
    POST_ID,
    { key: 'message', label: 'Text', type: 'text' },
    { key: 'createdTime', label: 'Posted at', type: 'date' },
    { key: 'link', label: 'Post link', type: 'text' },
    { key: 'picture', label: 'Picture link', type: 'text' },
    { key: 'reactions', label: 'Reactions', type: 'number' },
    { key: 'comments', label: 'Comments', type: 'number' },
    { key: 'shares', label: 'Shares', type: 'number' },
  ],
  input: PostRef,
  async run({ client: keys, input }) {
    return graph(`${node(input.postId)}?fields=${encodeURIComponent(POST_FIELDS)}`, Post, {
      token: await pageToken(keys.accessToken, input.page),
    });
  },
});

export const POST_ACTIONS = [publishPost, editPost, deletePost, getPost];
