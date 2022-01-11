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

export const KIND_CHOICES = {
  MESSENGER: 'messenger',
  LEAD: 'lead',
  FACEBOOK_MESSENGER: 'facebook-messenger',
  FACEBOOK_POST: 'facebook-post',
  GMAIL: 'gmail',
  NYLAS_GMAIL: 'nylas-gmail',
  NYLAS_IMAP: 'nylas-imap',
  NYLAS_OFFICE365: 'nylas-office365',
  NYLAS_EXCHANGE: 'nylas-exchange',
  NYLAS_OUTLOOK: 'nylas-outlook',
  NYLAS_YAHOO: 'nylas-yahoo',
  CALLPRO: 'callpro',
  TWITTER_DM: 'twitter-dm',
  CHATFUEL: 'chatfuel',
  SMOOCH_VIBER: 'smooch-viber',
  SMOOCH_LINE: 'smooch-line',
  SMOOCH_TELEGRAM: 'smooch-telegram',
  SMOOCH_TWILIO: 'smooch-twilio',
  WHATSAPP: 'whatsapp',
  TELNYX: 'telnyx',
  WEBHOOK: 'webhook',
  BOOKING: 'booking',
  ALL: [
    'messenger',
    'lead',
    'facebook-messenger',
    'facebook-post',
    'gmail',
    'callpro',
    'chatfuel',
    'nylas-gmail',
    'nylas-imap',
    'nylas-office365',
    'nylas-outlook',
    'nylas-exchange',
    'nylas-yahoo',
    'twitter-dm',
    'smooch-viber',
    'smooch-line',
    'smooch-telegram',
    'smooch-twilio',
    'whatsapp',
    'telnyx',
    'webhook',
    'booking'
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