export const CONVERSATION_STATUSES = {
  NEW: 'new',
  OPEN: 'open',
  CLOSED: 'closed',
  ALL_LIST: ['new', 'open', 'closed'],
};

export const INTEGRATION_KIND_CHOICES = {
  MESSENGER: 'messenger',
  FORM: 'form',
  TWITTER: 'twitter',
  FACEBOOK: 'facebook',
  ALL_LIST: ['messenger', 'form', 'twitter', 'facebook'],
};

export const TAG_TYPES = {
  CONVERSATION: 'conversation',
  CUSTOMER: 'customer',
  ENGAGE_MESSAGE: 'engageMessage',
  ALL_LIST: ['conversation', 'customer', 'engageMessage'],
};

export const FACEBOOK_DATA_KINDS = {
  FEED: 'feed',
  MESSENGER: 'messenger',
  ALL_LIST: ['feed', 'messenger'],
};

export const FORM_LOAD_TYPES = {
  SHOUTBOX: 'shoutbox',
  POPUP: 'popup',
  EMBEDDED: 'embedded',
  ALL: ['', 'shoutbox', 'popup', 'embedded'],
};

export const FORM_SUCCESS_ACTIONS = {
  EMAIL: 'email',
  REDIRECT: 'redirect',
  ONPAGE: 'onPage',
  ALL_LIST: ['', 'email', 'redirect', 'onPage'],
};

export const KIND_CHOICES = {
  MESSENGER: 'messenger',
  FORM: 'form',
  TWITTER: 'twitter',
  FACEBOOK: 'facebook',
  ALL_LIST: ['messenger', 'form', 'twitter', 'facebook'],
  ALL: ['messenger', 'form', 'twitter', 'facebook'],
};

// module constants
export const MODULES = {
  CHANNEL_MEMBERS_CHANGE: 'channelMembersChange',
  CONVERSATION_ADD_MESSAGE: 'conversationAddMessage',
  CONVERSATION_ASSIGNEE_CHANGE: 'conversationAssigneeChange',
  CONVERSATION_STATE_CHANGE: 'conversationStateChange',
  ALL: [
    'channelMembersChange',
    'conversationAddMessage',
    'conversationAssigneeChange',
    'conversationStateChange',
  ],
};

export const FORM_FIELDS = {
  TYPES: {
    INPUT: 'input',
    TEXT_AREA: 'textarea',
    RADIO: 'radio',
    CHECK: 'check',
    SELECT: 'select',
    DIVIDER: 'divider',
    EMAIL: 'email',
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    ALL: [
      'input',
      'textarea',
      'radio',
      'check',
      'select',
      'divider',
      'email',
      'firstName',
      'lastName',
    ],
  },
  VALIDATION: {
    BLANK: '',
    NUMBER: 'number',
    DATE: 'date',
    EMAIL: 'email',
    ALL: ['', 'number', 'date', 'email'],
  },
};

// messenger data availability constants
export const MESSENGER_DATA_AVAILABILITY = {
  MANUAL: 'manual',
  AUTO: 'auto',
  ALL: ['manual', 'auto'],
};
