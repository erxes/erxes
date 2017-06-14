export const KIND_CHOICES = {
  MESSENGER: 'messenger',
  FORM: 'form',
  TWITTER: 'twitter',
  FACEBOOK: 'facebook',
  KB_GROUP: 'kb_group',
  ALL_LIST: ['messenger', 'form', 'twitter', 'facebook', 'kb_group'],
};

export const FORM_LOAD_TYPES = {
  SHOUTBOX: 'shoutbox',
  POPUP: 'popup',
  EMBEDDED: 'embedded',
  ALL_LIST: ['', 'shoutbox', 'popup', 'embedded'],
};

export const FORM_SUCCESS_ACTIONS = {
  EMAIL: 'email',
  REDIRECT: 'redirect',
  ONPAGE: 'onPage',
  ALL_LIST: ['', 'email', 'redirect', 'onPage'],
};
