export const CONVERSATION_STATUSES = {
  NEW: 'new',
  OPEN: 'open',
  CLOSED: 'closed',
  ENGAGE_VISITOR_AUTO: 'engageVisitorAuto',
  ALL: ['new', 'open', 'closed', 'engageVisitorAuto']
};

export const CONVERSATION_OPERATOR_STATUS = {
  BOT: 'bot',
  OPERATOR: 'operator',
  ALL: ['bot', 'operator']
};

export const MESSAGE_TYPES = {
  VIDEO_CALL: 'videoCall',
  VIDEO_CALL_REQUEST: 'videoCallRequest',
  TEXT: 'text',
  ALL: ['videoCall', 'videoCallRequest', 'text']
};

export const CONVERSATION_SELECT_OPTIONS = {
  OPERATOR_STATUS: [
    { label: 'Operator', value: 'operator' },
    { label: 'Bot', value: 'bot' }
  ],
  STATUS: [
    { label: 'New', value: 'new' },
    { label: 'Open', value: 'open' },
    { label: 'Resolved', value: 'closed' }
  ]
};

export const LEAD_LOAD_TYPES = {
  SHOUTBOX: 'shoutbox',
  POPUP: 'popup',
  EMBEDDED: 'embedded',
  DROPDOWN: 'dropdown',
  SLIDEINLEFT: 'slideInLeft',
  SLIDEINRIGHT: 'slideInRight',
  ALL: [
    '',
    'shoutbox',
    'popup',
    'embedded',
    'dropdown',
    'slideInLeft',
    'slideInRight'
  ]
};

export const LEAD_SUCCESS_ACTIONS = {
  EMAIL: 'email',
  REDIRECT: 'redirect',
  ONPAGE: 'onPage',
  ALL: ['', 'email', 'redirect', 'onPage']
};

export const MESSENGER_DATA_AVAILABILITY = {
  MANUAL: 'manual',
  AUTO: 'auto',
  ALL: ['manual', 'auto']
};

export const AUTO_BOT_MESSAGES = {
  NO_RESPONSE: 'No reply',
  CHANGE_OPERATOR: 'The team will reply in message'
};

export const BOT_MESSAGE_TYPES = {
  SAY_SOMETHING: 'say_something'
};
