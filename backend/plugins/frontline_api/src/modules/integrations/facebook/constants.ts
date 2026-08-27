export const FACEBOOK_POST_TYPES = [
  'status',
  'video',
  'photo',
  'post',
  'share',
];

export const LOG_TYPES = {
  ERROR: 'error',
  REGULAR: 'regular',
  SUCCESS: 'success',
  ALL: ['error', 'regular', 'success'],
};

export const INTEGRATION_KINDS = {
  MESSENGER: 'facebook-messenger',
  POST: 'facebook-post',
  ALL: ['facebook-post', 'facebook-messenger'],
};

export const SUBSCRIBED_FIELDS_BY_KIND: Record<string, string[]> = {
  [INTEGRATION_KINDS.MESSENGER]: [
    'messages',
    'messaging_postbacks',
    'messaging_referrals',
  ],
  [INTEGRATION_KINDS.POST]: ['feed'],
};
