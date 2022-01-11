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

export const INTEGRATION_NAMES_MAP = {
  messenger: 'Messenger',
  lead: 'Forms',
  'facebook-messenger': 'Facebook Messenger',
  'facebook-post': 'Facebook Post',
  gmail: 'Gmail',
  webhook: 'Webhook',
  callpro: 'Call pro',
  chatfuel: 'Chatfuel',

  whatsapp: 'WhatsApp by Smooch',
  'smooch-telegram': 'Telegram by Smooch',
  'smooch-viber': 'Viber by Smooch',
  'smooch-line': 'Line by Smooch',
  'smooch-twilio': 'SMS Twilio by Smooch',

  'nylas-imap': 'IMAP by Nylas',
  'nylas-gmail': 'Gmail by Nylas',
  'nylas-office365': 'Office 365 by Nylas',
  'nylas-exchange': 'Microsoft Exchange by Nylas',
  'nylas-outlook': 'Outlook by Nylas',
  'nylas-yahoo': 'Yahoo by Nylas',
  'twitter-dm': 'Twitter dm',

  telnyx: 'SMS by Telnyx'
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

export const DEFAULT_SOCIAL_LINKS = [
  { label: 'Facebook', value: 'facebook' },
  { label: 'Twitter', value: 'twitter' },
  { label: 'Youtube', value: 'youtube' },
  { label: 'Website', value: 'website' }
];

export const AUTO_BOT_MESSAGES = {
  NO_RESPONSE: 'No reply',
  CHANGE_OPERATOR: 'The team will reply in message'
};

export const BOT_MESSAGE_TYPES = {
  SAY_SOMETHING: 'say_something'
};