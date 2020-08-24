export const days = [
  { value: 'everyday', label: 'Everyday' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
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
  LEAD: 'lead',
  CALLPRO: 'callpro',
  TWITTER_DM: 'twitter-dm',
  CHATFUEL: 'chatfuel',
  SMOOCH_TELEGRAM: 'smooch-telegram',
  SMOOCH_VIBER: 'smooch-viber',
  SMOOCH_LINE: 'smooch-line',
  SMOOCH_TWILIO: 'smooch-twilio',
  WHATSAPP: 'whatsapp',
  TELNYX: 'telnyx',
  ALL: [
    { text: 'Messenger', value: 'messenger' },
    { text: 'Facebook post', value: 'facebook-post' },
    {
      text: 'Facebook messenger',
      value: 'facebook-messenger'
    },
    { text: 'Gmail', value: 'gmail' },
    { text: 'Nylas gmail', value: 'nylas-gmail' },
    { text: 'IMAP', value: 'nylas-imap' },
    { text: 'Office 365', value: 'nylas-office365' },
    { text: 'Exchange', value: 'nylas-exchange' },
    { text: 'Outlook', value: 'nylas-outlook' },
    { text: 'Yahoo', value: 'nylas-yahoo' },
    { text: 'Pop Ups', value: 'lead' },
    { text: 'Callpro', value: 'callpro' },
    { text: 'Twitter direct message', value: 'twitter-dm' },
    { text: 'Chatfuel', value: 'chatfuel' },
    { text: 'Telegram', value: 'smooch-telegram' },
    { text: 'Viber', value: 'smooch-viber' },
    { text: 'Line', value: 'smooch-line' },
    { text: 'Twilio', value: 'smooch-twilio' },
    { text: 'WhatsApp', value: 'whatsapp' },
    { text: 'Telnyx', value: 'telnyx' }
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
  ALL_LIST: ['', 'email', 'redirect', 'onPage']
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
    name: 'Facebook post',
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
    name: 'Facebook messenger',
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
    description:
      'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
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
    name: 'Pop Ups',
    description: 'Find your lead forms right here in your Widget',
    inMessenger: true,
    isAvailable: true,
    kind: 'lead',
    logo: '/images/integrations/lead.png',
    createModal: 'lead',
    createUrl: '/settings/integrations/lead',
    category:
      'All integrations, For support teams, For marketing teams, Marketing automation, Surveys and Feedback, Pop ups'
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
    name: 'Knowledge Base',
    description: 'Get access to your Knowledge Base right in your Widget',
    inMessenger: true,
    isAvailable: true,
    kind: 'knowledgebase',
    logo: '/images/integrations/knowledge-base.png',
    createModal: 'knowledgeBase',
    createUrl: '/settings/integrations/knowledgeBase',
    category:
      'All integrations, For support teams, For marketing teams, Surveys and Feedback'
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
    name: 'Website',
    description: 'Show your responsive website right in your Widget',
    inMessenger: true,
    isAvailable: true,
    kind: 'website',
    logo: '/images/integrations/website.png',
    createModal: 'website',
    createUrl: '/settings/integrations/website',
    category: 'All integrations, For support teams, Marketing automation'
  },
  {
    name: 'WhatsApp',
    description: 'Get a hold of your Whatsapp messages through your Team Inbox',
    inMessenger: false,
    isAvailable: true,
    kind: 'whatsapp',
    logo: '/images/integrations/whatsapp.png',
    createModal: 'whatsapp',
    category: 'All integrations, For support teams, Messaging, Conversation'
  },
  {
    name: 'Telegram',
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
    name: 'Viber',
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
    name: 'Line',
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
    name: 'Telnyx',
    description: 'Connect your Telnyx account to send & receive SMS',
    inMessenger: false,
    isAvailable: true,
    kind: 'telnyx',
    logo: '/images/integrations/telnyx.png',
    createModal: 'telnyx',
    category:
      'All integrations, For support teams, For marketing teams, Conversation'
  }
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
    items: ['Conversation', 'Pop ups']
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
