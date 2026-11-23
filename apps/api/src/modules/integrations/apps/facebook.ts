import { defineIntegration, oauthKeys, hookTrigger } from '@erxes/plugin-sdk/integrations';
import { MESSENGER_ACTIONS } from './facebookActions';
import { COMMENT_ACTIONS } from './facebookCommentActions';
import { POST_ACTIONS } from './facebookPostActions';
import { accountOf, GRAPH_VERSION, longLivedToken } from './facebookGraph';
import { facebookHooks } from './facebookHooks';
import { FACEBOOK_RECORDS } from './facebookRecords';
import {
  COMMENT_OUTPUTS,
  LEAD_OUTPUTS,
  MENTION_OUTPUTS,
  MESSAGE_OUTPUTS,
  POST_OUTPUTS,
  POSTBACK_OUTPUTS,
  REFERRAL_OUTPUTS,
  REVIEW_OUTPUTS,
} from './facebookOutputs';

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
    outputs: LEAD_OUTPUTS,
  }),
  hookTrigger({
    key: 'page_mentioned',
    on: 'mention',
    when: is({ verb: 'add' }),
    label: 'Page mentioned',
    description: 'Someone tags the page in a post or a comment',
    outputs: MENTION_OUTPUTS,
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
    outputs: POST_OUTPUTS,
  }),
  hookTrigger({
    key: 'comment_added',
    on: 'feed',
    when: (payload) => is({ item: 'comment', verb: 'add' })(payload) && !byPage(payload),
    label: 'Comment on a post',
    description:
      "Someone comments on one of the page's posts. The page's own comments are left out.",
    outputs: COMMENT_OUTPUTS,
  }),
  hookTrigger({
    key: 'review_left',
    on: 'ratings',
    when: is({ verb: 'add' }),
    label: 'Review left',
    description: 'Someone recommends the page, or not, or rates it',
    outputs: REVIEW_OUTPUTS,
  }),
  hookTrigger({
    key: 'message_received',
    on: 'messages',
    label: 'Message to the page',
    description: 'Someone sends the page a Messenger message',
    outputs: MESSAGE_OUTPUTS,
  }),
  hookTrigger({
    key: 'button_pressed',
    on: 'messaging_postbacks',
    label: 'Messenger button pressed',
    description:
      'Someone taps a button in a page message, the Get started button or a menu item in Messenger',
    outputs: POSTBACK_OUTPUTS,
  }),
  hookTrigger({
    key: 'chat_opened_from_link',
    on: 'messaging_referrals',
    label: 'Chat opened from a link or ad',
    description:
      'Someone who already talks to the page opens the chat again from an m.me link, an ad or a Messenger code',
    outputs: REFERRAL_OUTPUTS,
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
      'pages_manage_posts',
      'pages_manage_engagement',
      'leads_retrieval',
      'pages_messaging',
    ],
    scopeSeparator: ',',
    account: (accessToken) => accountOf(accessToken),
    longLived: longLivedToken,
  },
  client: (keys) => keys,
  async verify(keys) {
    await accountOf(keys.accessToken);
  },
  hooks: facebookHooks,
  triggers: TRIGGERS,
  actions: [...MESSENGER_ACTIONS, ...POST_ACTIONS, ...COMMENT_ACTIONS],
  records: FACEBOOK_RECORDS,
});
