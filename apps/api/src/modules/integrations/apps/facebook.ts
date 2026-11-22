import type { DataField } from '@erxes/core-contract';
import { defineIntegration, hookTrigger, oauthKeys } from '../define';
import { sendMessage } from './facebookActions';
import { accountOf, GRAPH_VERSION, longLivedToken } from './facebookGraph';
import { facebookHooks } from './facebookHooks';

const PAGE: DataField[] = [{ key: 'pageId', label: 'Page id', type: 'text' }];

const POST: DataField[] = [
  ...PAGE,
  { key: 'postId', label: 'Post id', type: 'text' },
  { key: 'message', label: 'Text', type: 'text' },
  { key: 'createdTime', label: 'Posted at', type: 'date' },
];

const POST_ITEMS = new Set(['post', 'status', 'photo', 'video', 'share']);

const is = (want: Record<string, string>) => (payload: Record<string, unknown>) =>
  Object.entries(want).every(([key, value]) => payload[key] === value);

const byPage = (payload: Record<string, unknown>) => payload.fromId === payload.pageId;

const TRIGGERS = [
  hookTrigger({
    key: 'lead_form_filled',
    on: 'leadgen',
    label: 'Lead form filled',
    description:
      "Someone sends a Lead Ads form for the page. Each question's answer arrives under its name, as email, phone_number or full_name.",
    outputs: [
      ...PAGE,
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone_number', label: 'Phone', type: 'text' },
      { key: 'full_name', label: 'Full name', type: 'text' },
      { key: 'first_name', label: 'First name', type: 'text' },
      { key: 'last_name', label: 'Last name', type: 'text' },
      { key: 'leadId', label: 'Lead id', type: 'text' },
      { key: 'formId', label: 'Form id', type: 'text' },
      { key: 'adId', label: 'Ad id', type: 'text' },
      { key: 'campaignId', label: 'Campaign id', type: 'text' },
      { key: 'createdTime', label: 'Sent at', type: 'date' },
    ],
  }),
  hookTrigger({
    key: 'page_mentioned',
    on: 'mention',
    when: is({ verb: 'add' }),
    label: 'Page mentioned',
    description: 'Someone tags the page in a post or a comment',
    outputs: [
      ...PAGE,
      { key: 'item', label: 'In a post or comment', type: 'text' },
      { key: 'postId', label: 'Post id', type: 'text' },
      { key: 'commentId', label: 'Comment id', type: 'text' },
      { key: 'senderId', label: 'Person id', type: 'text' },
      { key: 'senderName', label: 'Person', type: 'text' },
      { key: 'message', label: 'Text', type: 'text' },
    ],
  }),
  hookTrigger({
    key: 'post_published',
    on: 'feed',
    when: (payload) =>
      payload.verb === 'add' &&
      typeof payload.item === 'string' &&
      POST_ITEMS.has(payload.item) &&
      byPage(payload),
    label: 'Page posted',
    description: 'The page publishes a post, photo, video or link',
    outputs: [
      ...POST,
      { key: 'link', label: 'Link', type: 'text' },
      { key: 'photo', label: 'Photo', type: 'text' },
      { key: 'video', label: 'Video', type: 'text' },
    ],
  }),
  hookTrigger({
    key: 'comment_added',
    on: 'feed',
    when: (payload) => is({ item: 'comment', verb: 'add' })(payload) && !byPage(payload),
    label: 'Comment on a post',
    description:
      "Someone comments on one of the page's posts. The page's own comments are left out.",
    outputs: [
      ...POST,
      { key: 'commentId', label: 'Comment id', type: 'text' },
      { key: 'parentId', label: 'Answers', type: 'text' },
      { key: 'fromId', label: 'Person id', type: 'text' },
      { key: 'fromName', label: 'Person', type: 'text' },
    ],
  }),
  hookTrigger({
    key: 'review_left',
    on: 'ratings',
    when: is({ verb: 'add' }),
    label: 'Review left',
    description: 'Someone recommends the page, or not, or rates it',
    outputs: [
      ...PAGE,
      { key: 'reviewerId', label: 'Person id', type: 'text' },
      { key: 'reviewerName', label: 'Person', type: 'text' },
      { key: 'recommendation', label: 'Recommends (positive or negative)', type: 'text' },
      { key: 'rating', label: 'Stars', type: 'number' },
      { key: 'reviewText', label: 'Review', type: 'text' },
      { key: 'createdTime', label: 'Left at', type: 'date' },
    ],
  }),
  hookTrigger({
    key: 'message_received',
    on: 'messages',
    label: 'Message to the page',
    description: 'Someone sends the page a Messenger message',
    outputs: [
      ...PAGE,
      { key: 'senderId', label: 'Sender id', type: 'text' },
      { key: 'messageId', label: 'Message id', type: 'text' },
      { key: 'text', label: 'Text', type: 'text' },
      { key: 'attachmentType', label: 'Attachment type', type: 'text' },
      { key: 'attachmentUrl', label: 'Attachment link', type: 'text' },
      { key: 'sentAt', label: 'Sent at', type: 'date' },
    ],
  }),
];

export const facebook = defineIntegration({
  key: 'facebook',
  name: 'Facebook Pages',
  summary:
    'Start automations from lead forms, comments, mentions, reviews and messages on your Facebook pages.',
  category: 'social',
  countries: [],
  permission: 'integrations.manage',
  dashboard: 'https://developers.facebook.com/apps',
  keys: oauthKeys,
  oauth: {
    authorizeUrl: `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`,
    tokenUrl: `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`,
    scopes: [
      'pages_show_list',
      'pages_manage_metadata',
      'pages_read_engagement',
      'pages_read_user_content',
      'leads_retrieval',
      'pages_messaging',
    ],
    scopeSeparator: ',',
    account: (accessToken) => accountOf(accessToken),
    longLived: longLivedToken,
  },
  async verify(keys, options) {
    await accountOf(keys.accessToken, options);
  },
  hooks: facebookHooks,
  triggers: TRIGGERS,
  actions: [sendMessage],
});
