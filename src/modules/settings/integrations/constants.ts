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

export const KIND_CHOICES = {
  MESSENGER: 'messenger',
  FACEBOOK_MESSENGER: 'facebook-messenger',
  FACEBOOK_POST: 'facebook-post',
  GMAIL: 'gmail',
  NYLAS_GMAIL: 'nylas-gmail',
  NYLAS_IMAP: 'nylas-imap',
  NYLAS_OUTLOOK: 'nylas-outlook',
  NYLAS_OFFICE365: 'nylas-office365',
  NYLAS_YAHOO: 'nylas-yahoo',
  LEAD: 'lead',
  CALLPRO: 'callpro',
  TWITTER_DM: 'twitter-dm',
  CHATFUEL: 'chatfuel',
  ALL_LIST: [
    'messenger',
    'facebook-post',
    'facebook-messenger',
    'lead',
    'callpro',
    'twitter-dm',
    'chatfuel',
    'gmail',
    'nylas-gmail',
    'nylas-imap',
    'nylas-office365',
    'nylas-outlook'
  ]
};

export const KIND_CHOICES_WITH_TEXT = [
  { text: 'Messenger', value: 'messenger' },
  { text: 'Facebook post', value: 'facebook-post' },
  { text: 'facebook messenger', value: 'facebook-messenger' },
  { text: 'Pop Ups', value: 'lead' },
  { text: 'Callpro', value: 'callpro' },
  { text: 'Chatfuel', value: 'chatfuel' },
  { text: 'Gmail', value: 'nylas-gmail' }
];

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
    name: 'row-1',
    rows: [
      {
        name: 'Facebook post',
        description: 'Connect to Facebook posts right from your Team Inbox',
        inMessenger: false,
        kind: 'facebook-post',
        logo: '/images/integrations/facebook.png',
        createModal: 'facebook-post',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Social media'
      },
      {
        name: 'Facebook messenger',
        description: 'Connect to Facebook messages right from your Team Inbox',
        inMessenger: false,
        kind: 'facebook-messenger',
        logo: '/images/integrations/fb-messenger.png',
        createModal: 'facebook-messenger',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Messaging, Social media, Conversation'
      },
      {
        name: 'Messenger',
        description: 'See and reply to Messenger messages in your Team Inbox',
        inMessenger: false,
        kind: 'messenger',
        logo: '/images/integrations/messenger.png',
        createUrl: '/settings/integrations/createMessenger',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Conversation'
      },
      {
        name: 'Gmail',
        description:
          'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
        inMessenger: false,
        kind: 'gmail',
        logo: '/images/integrations/gmail.png',
        createModal: 'gmail',
        createUrl: '/settings/integrations/gmail',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Email marketing, Marketing automation, Conversation'
      }
    ]
  },
  {
    name: 'row-2',
    rows: [
      {
        name: 'IMAP by Nylas',
        description:
          'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
        inMessenger: false,
        kind: 'nylas-imap',
        logo: '/images/integrations/email.png',
        createModal: 'nylas-imap',
        createUrl: '/settings/integrations/nylas-imap',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Email marketing'
      },
      {
        name: 'Office 365 by Nylas',
        description:
          'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
        inMessenger: false,
        kind: 'nylas-office365',
        logo: '/images/integrations/office365.png',
        createModal: 'nylas-office365',
        createUrl: '/settings/integrations/nylas-office365',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Email marketing'
      },
      {
        name: 'Gmail by Nylas',
        description:
          'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
        inMessenger: false,
        kind: 'nylas-gmail',
        logo: '/images/integrations/gmail.png',
        createModal: 'nylas-gmail',
        createUrl: '/settings/integrations/nylas-gmail',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Email marketing, Marketing automation, Conversation'
      },
      {
        name: 'Pop Ups',
        description: 'Find your lead forms right here in your Widget',
        inMessenger: true,
        kind: 'lead',
        logo: '/images/integrations/lead.png',
        createModal: 'lead',
        createUrl: '/settings/integrations/lead',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Surveys and Feedback, Pop ups'
      }
    ]
  },
  {
    name: 'row-3',
    rows: [
      {
        name: 'Outlook by Nylas',
        description:
          'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
        inMessenger: false,
        kind: 'nylas-outlook',
        logo: '/images/integrations/outlook.png',
        createModal: 'nylas-outlook',
        createUrl: '/settings/integrations/nylas-outlook',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Email marketing, Conversation'
      },
      {
        name: 'Yahoo by Nylas',
        description:
          'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
        inMessenger: false,
        kind: 'nylas-yahoo',
        logo: '/images/integrations/yahoo.png',
        createModal: 'nylas-yahoo',
        createUrl: '/settings/integrations/nylas-yahoo',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Email marketing, Conversation'
      },
      {
        name: 'Knowledge Base',
        description: 'Get access to your Knowledge Base right in your Widget',
        inMessenger: true,
        kind: 'knowledgebase',
        logo: '/images/integrations/knowledge-base.png',
        createModal: 'knowledgeBase',
        createUrl: '/settings/integrations/knowledgeBase',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Surveys and Feedback'
      },
      {
        name: 'Engage config',
        description:
          'Set up your custome amazon simple email service account here',
        inMessenger: false,
        kind: 'amazon-ses',
        logo: '/images/integrations/aws-ses.png',
        createModal: 'sesconfig',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Messaging, Conversation, Engage'
      }
    ]
  },
  {
    name: 'row-4',
    rows: [
      {
        name: 'Call Pro',
        description: 'Connect your call pro phone number',
        inMessenger: false,
        kind: 'callpro',
        logo: '/images/integrations/callpro.png',
        createModal: 'callpro',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Phone and video, Conversation'
      },
      {
        name: 'Twitter',
        description: 'Connect to your twitter DMs here in your Inbox',
        inMessenger: false,
        kind: 'twitter-dm',
        logo: '/images/integrations/twitter.png',
        createModal: 'twitter',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Social media, Messaging'
      },
      {
        name: 'Chatfuel',
        description: 'Connect your chatfuel account',
        inMessenger: false,
        kind: 'chatfuel',
        logo: '/images/integrations/chatfuel.png',
        createModal: 'chatfuel',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Messaging, Analytics, Conversation'
      },
      {
        name: 'Website',
        description: 'Show your responsive website right in your Widget',
        inMessenger: true,
        kind: 'website',
        logo: '/images/integrations/website.png',
        createModal: 'website',
        createUrl: '/settings/integrations/website',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Social media'
      }
    ]
  },
  {
    title: 'Coming soon',
    name: 'row-coming-soon',
    rows: [
      {
        name: 'Viber',
        description: `Soon you'll be able to connect Viber straight to your Team Inbox`,
        inMessenger: false,
        logo: '/images/integrations/viber.png',
        category:
          'All integrations, For support teams, Marketing automation, Messaging, Conversation'
      },
      {
        name: 'WhatsApp',
        description:
          'Get a hold of your Whatsapp messages through your Team Inbox',
        inMessenger: false,
        logo: '/images/integrations/whatsapp.png',
        category: 'All integrations, For support teams, Messaging, Conversation'
      },
      {
        name: 'Wechat',
        description:
          'Connect with Wechat and start messaging right from your Team Inbox',
        inMessenger: false,
        logo: '/images/integrations/wechat.png',
        category:
          'All integrations, For support teams, Messaging, Marketing automation, Social media, Conversation'
      },
      {
        name: 'Line',
        description: 'See and reply to Line messages in your Team Inbox',
        inMessenger: false,
        logo: '/images/integrations/line.png',
        category:
          'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Messaging, Phone and video, Conversation'
      }
    ]
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
    items: ['Conversation', 'Pop ups', 'Engage']
  },
  {
    name: 'Categories',
    items: [
      'Analytics',
      'Email marketing',
      'Messaging',
      'Marketing automation',
      'Phone and video',
      'Social media',
      'Surveys and Feedback'
    ]
  }
];
