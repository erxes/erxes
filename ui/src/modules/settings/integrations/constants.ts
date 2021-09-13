import { __ } from 'modules/common/utils';

export const days = [
  { value: 'everyday', label: __('Everyday') },
  { value: 'weekdays', label: __('Weekdays') },
  { value: 'weekends', label: __('Weekends') },
  { value: 'monday', label: __('Monday') },
  { value: 'tuesday', label: __('Tuesday') },
  { value: 'wednesday', label: __('Wednesday') },
  { value: 'thursday', label: __('Thursday') },
  { value: 'friday', label: __('Friday') },
  { value: 'saturday', label: __('Saturday') },
  { value: 'sunday', label: __('Sunday') }
];

export const hours = [
  { value: '12:00 AM', label: '12:00 AM' },
  { value: '12:30 AM', label: '12:30 AM' },
  { value: '1:00 AM', label: '1:00 AM' },
  { value: '1:30 AM', label: '1:30 AM' },
  { value: '2:00 AM', label: '2:00 AM' },
  { value: '2:30 AM', label: '2:30 AM' },
  { value: '3:00 AM', label: '3:00 AM' },
  { value: '3:30 AM', label: '3:30 AM' },
  { value: '4:00 AM', label: '4:00 AM' },
  { value: '4:30 AM', label: '4:30 AM' },
  { value: '5:00 AM', label: '5:00 AM' },
  { value: '5:30 AM', label: '5:30 AM' },
  { value: '6:00 AM', label: '6:00 AM' },
  { value: '6:30 AM', label: '6:30 AM' },
  { value: '7:00 AM', label: '7:00 AM' },
  { value: '7:30 AM', label: '7:30 AM' },
  { value: '8:00 AM', label: '8:00 AM' },
  { value: '8:30 AM', label: '8:30 AM' },
  { value: '9:00 AM', label: '9:00 AM' },
  { value: '9:30 AM', label: '9:30 AM' },
  { value: '10:00 AM', label: '10:00 AM' },
  { value: '10:30 AM', label: '10:30 AM' },
  { value: '11:00 AM', label: '11:00 AM' },
  { value: '11:30 AM', label: '11:30 AM' },
  { value: '12:00 PM', label: '12:00 PM' },
  { value: '12:30 PM', label: '12:30 PM' },
  { value: '1:00 PM', label: '1:00 PM' },
  { value: '1:30 PM', label: '1:30 PM' },
  { value: '2:00 PM', label: '2:00 PM' },
  { value: '2:30 PM', label: '2:30 PM' },
  { value: '3:00 PM', label: '3:00 PM' },
  { value: '3:30 PM', label: '3:30 PM' },
  { value: '4:00 PM', label: '4:00 PM' },
  { value: '4:30 PM', label: '4:30 PM' },
  { value: '5:00 PM', label: '5:00 PM' },
  { value: '5:30 PM', label: '5:30 PM' },
  { value: '6:00 PM', label: '6:00 PM' },
  { value: '6:30 PM', label: '6:30 PM' },
  { value: '7:00 PM', label: '7:00 PM' },
  { value: '7:30 PM', label: '7:30 PM' },
  { value: '8:00 PM', label: '8:00 PM' },
  { value: '8:30 PM', label: '8:30 PM' },
  { value: '9:00 PM', label: '9:00 PM' },
  { value: '9:30 PM', label: '9:30 PM' },
  { value: '10:00 PM', label: '10:00 PM' },
  { value: '10:30 PM', label: '10:30 PM' },
  { value: '11:00 PM', label: '11:00 PM' },
  { value: '11:30 PM', label: '11:30 PM' },
  { value: '11:59 PM', label: '11:59 PM' }
];

export const INTEGRATION_KINDS = {
  MESSENGER: 'messenger',
  FACEBOOK_MESSENGER: 'facebook-messenger',
  FACEBOOK_POST: 'facebook-post',
  GMAIL: 'gmail',
  NYLAS_GMAIL: 'nylas-gmail',
  NYLAS_IMAP: 'nylas-imap',
  NYLAS_OUTLOOK: 'nylas-outlook',
  NYLAS_EXCHANGE: 'nylas-exchange',
  NYLAS_OFFICE365: 'nylas-office365',
  NYLAS_YAHOO: 'nylas-yahoo',
  FORMS: 'lead',
  CALLPRO: 'callpro',
  TWITTER_DM: 'twitter-dm',
  CHATFUEL: 'chatfuel',
  SMOOCH_TELEGRAM: 'smooch-telegram',
  SMOOCH_VIBER: 'smooch-viber',
  SMOOCH_LINE: 'smooch-line',
  SMOOCH_TWILIO: 'smooch-twilio',
  WHATSAPP: 'whatsapp',
  TELNYX: 'telnyx',
  WEBHOOK: 'webhook',
  ALL: [
    { text: 'Messenger', value: 'messenger' },
    { text: 'Forms', value: 'lead' },
    {
      text: 'Facebook Messenger',
      value: 'facebook-messenger'
    },
    { text: 'Facebook Post', value: 'facebook-post' },
    { text: 'Gmail', value: 'gmail' },
    { text: 'Webhook', value: 'webhook' },
    { text: 'Callpro', value: 'callpro' },
    { text: 'Chatfuel', value: 'chatfuel' },

    { text: 'WhatsApp by Smooch', value: 'whatsapp' },
    { text: 'Telegram by Smooch', value: 'smooch-telegram' },
    { text: 'Viber by Smooch', value: 'smooch-viber' },
    { text: 'Line by Smooch', value: 'smooch-line' },
    { text: 'SMS Twilio by Smooch', value: 'smooch-twilio' },

    { text: 'IMAP by Nylas', value: 'nylas-imap' },
    { text: 'Gmail by Nylas', value: 'nylas-gmail' },
    { text: 'Office 365 by Nylas', value: 'nylas-office365' },
    { text: 'Microsoft Exchange by Nylas', value: 'nylas-exchange' },
    { text: 'Outlook by Nylas', value: 'nylas-outlook' },
    { text: 'Yahoo by Nylas', value: 'nylas-yahoo' },

    { text: 'SMS by Telnyx', value: 'telnyx' }
  ]
};

export const FORM_LOAD_TYPES = {
  SHOUTBOX: 'shoutbox',
  POPUP: 'popup',
  EMBEDDED: 'embedded',
  ALL_LIST: ['', 'shoutbox', 'popup', 'embedded']
};

export const FORM_SUCCESS_ACTIONS = {
  EMAIL: 'email',
  REDIRECT: 'redirect',
  ONPAGE: 'onPage',
  ALL_LIST: [
    { text: 'On page', value: 'onPage' },
    { text: 'Email', value: 'email' },
    { text: 'Page redirect', value: 'redirect' }
  ]
};

export const MAIL_TOOLBARS_CONFIG = [
  { name: 'styles', items: ['Font', 'FontSize'] },
  {
    name: 'other',
    items: [
      'TextColor',
      'BGColor',
      'Bold',
      'Italic',
      'Underline',
      'NumberedList',
      'BulletedList',
      'Link'
    ]
  },
  { name: 'clear', items: ['RemoveFormat'] }
];

export const INTEGRATIONS = [
  {
    name: 'Facebook Post',
    description: 'Connect to Facebook posts right from your Team Inbox',
    inMessenger: false,
    isAvailable: true,
    kind: 'facebook-post',
    logo: '/images/integrations/facebook.png',
    createModal: 'facebook-post',
    createUrl: '/settings/integrations/createFacebook',
    category:
      'All integrations, For support teams, Marketing automation, Social media'
  },
  {
    name: 'Facebook Messenger',
    description:
      'Connect and manage Facebook Messages right from your Team Inbox',
    inMessenger: false,
    isAvailable: true,
    kind: 'facebook-messenger',
    logo: '/images/integrations/fb-messenger.png',
    createModal: 'facebook-messenger',
    createUrl: '/settings/integrations/createFacebook',
    category:
      'All integrations, For support teams, Messaging, Social media, Conversation'
  },
  {
    name: 'Messenger',
    description: 'See and reply to Messenger messages in your Team Inbox',
    inMessenger: false,
    isAvailable: true,
    kind: 'messenger',
    logo: '/images/integrations/messenger.png',
    createModal: 'messenger',
    createUrl: '/settings/integrations/createMessenger',
    category:
      'All integrations, For support teams, For marketing teams, Marketing automation, Conversation'
  },
  {
    name: 'Gmail',
    description: __(
      'Connect a company email address such as sales@mycompany.com or info@mycompany.com'
    ),
    inMessenger: false,
    isAvailable: true,
    kind: 'gmail',
    logo: '/images/integrations/gmail.png',
    createModal: 'gmail',
    createUrl: '/settings/integrations/createGmail',
    category:
      'All integrations, For support teams, Email marketing, Marketing automation, Conversation'
  },
  {
    name: 'IMAP by Nylas',
    description:
      'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
    inMessenger: false,
    isAvailable: true,
    kind: 'nylas-imap',
    logo: '/images/integrations/email.png',
    createModal: 'nylas-imap',
    createUrl: '/settings/integrations/nylas-imap',
    category:
      'All integrations, For support teams, Marketing automation, Email marketing'
  },
  {
    name: 'Office 365 by Nylas',
    description:
      'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
    inMessenger: false,
    isAvailable: true,
    kind: 'nylas-office365',
    logo: '/images/integrations/office365.png',
    createModal: 'nylas-office365',
    createUrl: 'nylas/oauth2/callback',
    category:
      'All integrations, For support teams, Marketing automation, Email marketing, Conversation'
  },
  {
    name: 'Gmail by Nylas',
    description:
      'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
    inMessenger: false,
    isAvailable: true,
    kind: 'nylas-gmail',
    logo: '/images/integrations/gmail.png',
    createModal: 'nylas-gmail',
    createUrl: 'nylas/oauth2/callback',
    category:
      'All integrations, For support teams, Email marketing, Marketing automation, Conversation'
  },
  {
    name: 'Microsoft Exchange by Nylas',
    description:
      'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
    inMessenger: false,
    isAvailable: true,
    kind: 'nylas-exchange',
    logo: '/images/integrations/exchange.png',
    createModal: 'nylas-exchange',
    createUrl: '/settings/integrations/nylas-exchange',
    category:
      'All integrations, For support teams, Email marketing, Marketing automation, Conversation'
  },
  {
    name: 'Outlook by Nylas',
    description:
      'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
    inMessenger: false,
    isAvailable: true,
    kind: 'nylas-outlook',
    logo: '/images/integrations/outlook.png',
    createModal: 'nylas-outlook',
    createUrl: '/settings/integrations/nylas-outlook',
    category:
      'All integrations, For support teams, Marketing automation, Email marketing'
  },
  {
    name: 'Yahoo by Nylas',
    description:
      'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
    inMessenger: false,
    isAvailable: true,
    kind: 'nylas-yahoo',
    logo: '/images/integrations/yahoo.png',
    createModal: 'nylas-yahoo',
    createUrl: '/settings/integrations/nylas-yahoo',
    category:
      'All integrations, For support teams, Marketing automation, Email marketing, Conversation'
  },
  {
    name: 'Call Pro',
    description: 'Connect your call pro phone number',
    inMessenger: false,
    isAvailable: true,
    kind: 'callpro',
    logo: '/images/integrations/callpro.png',
    createModal: 'callpro',
    category:
      'All integrations, For support teams, Marketing automation, Phone and video, Conversation'
  },
  {
    name: 'Chatfuel',
    description: 'Connect your chatfuel account',
    inMessenger: false,
    isAvailable: true,
    kind: 'chatfuel',
    logo: '/images/integrations/chatfuel.png',
    createModal: 'chatfuel',
    category:
      'All integrations, For support teams, Marketing automation, Messaging, Conversation'
  },
  {
    name: 'WhatsApp by Smooch',
    description: 'Get a hold of your Whatsapp messages through your Team Inbox',
    inMessenger: false,
    isAvailable: true,
    kind: 'whatsapp',
    logo: '/images/integrations/whatsapp.png',
    createModal: 'whatsapp',
    category: 'All integrations, For support teams, Messaging, Conversation'
  },
  {
    name: 'Telegram by Smooch',
    description:
      'Connect to your Telegram, a cloud-based mobile and desktop messaging app',
    inMessenger: false,
    isAvailable: true,
    kind: 'smooch-telegram',
    logo: '/images/integrations/telegram.png',
    createModal: 'smooch-telegram',
    category: 'All integrations, For support teams, Messaging, Conversation'
  },
  {
    name: 'Viber by Smooch',
    description: 'Connect Viber to your Team Inbox',
    inMessenger: false,
    isAvailable: true,
    kind: 'smooch-viber',
    logo: '/images/integrations/viber.png',
    createModal: 'smooch-viber',
    category:
      'All integrations, For support teams, Marketing automation, Messaging, Conversation'
  },
  {
    name: 'Line by Smooch',
    description: 'See and reply to Line messages in your Team Inbox',
    inMessenger: false,
    isAvailable: true,
    kind: 'smooch-line',
    logo: '/images/integrations/line.png',
    createModal: 'smooch-line',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Messaging, Phone and video, Conversation'
  },
  {
    name: 'SMS by Telnyx',
    description: 'Connect your Telnyx account to send & receive SMS',
    inMessenger: false,
    isAvailable: true,
    kind: 'telnyx',
    logo: '/images/integrations/telnyx.png',
    createModal: 'telnyx',
    category:
      'All integrations, For support teams, For marketing teams, Conversation'
  },
  {
    name: 'Incoming Webhook',
    description: 'Configure incoming webhooks',
    inMessenger: false,
    isAvailable: true,
    kind: 'webhook',
    logo: '/images/integrations/incoming-webhook.png',
    createModal: 'webhook',
    category:
      'All integrations, For support teams, Conversation, Marketing automation'
  }
  // {
  //   name: 'Outgoing Webhook',
  //   description: 'Configure outging webhooks',
  //   inMessenger: false,
  //   isAvailable: true,
  //   kind: 'outgoing-webhook',
  //   logo: '/images/integrations/webhook.png',
  //   createModal: 'outgoing-webhook',
  //   category:
  //     'All integrations, For support teams, Conversation, Marketing automation'
  // }
];

export const INTEGRATION_FILTERS = [
  {
    name: 'Featured',
    items: [
      'All integrations',
      'For support teams',
      'For sales teams',
      'For marketing teams'
    ]
  },

  {
    name: 'Works with',
    items: ['Conversation', 'Forms']
  },
  {
    name: 'Categories',
    items: [
      'Email marketing',
      'Messaging',
      'Marketing automation',
      'Phone and video',
      'Social media',
      'Surveys and Feedback'
    ]
  }
];

export const WEBHOOK_DOC_URL =
  'https://documenter.getpostman.com/view/7654214/TVRoXRnM';
