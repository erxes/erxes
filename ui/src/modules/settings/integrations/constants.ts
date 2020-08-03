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
    { text: 'WhatsApp', value: 'whatsapp' }
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
    name: 'Twitter',
    description: 'Connect Twitter DMs to your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    kind: 'twitter-dm',
    logo: '/images/integrations/twitter.png',
    category:
      'All integrations, For support teams, Marketing automation, Social media, Messaging, Conversation'
  },
  {
    name: 'Wechat',
    description:
      'Connect with Wechat and start messaging right from your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/wechat.png',
    category:
      'All integrations, For support teams, Messaging, Marketing automation, Social media, Conversation'
  },
  {
    name: 'Twitter post',
    description: 'Connect to your twitter posts here in your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/twitter.png',
    category:
      'All integrations, For support teams, Marketing automation, Social media'
  },
  {
    name: 'Instagram',
    description: 'Connect to your instagram posts here in your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/instagram.png',
    category:
      'All integrations, For support teams, Messaging, Marketing automation, Social media, Conversation'
  },
  {
    name: 'Amazon Lex',
    description: 'Build conversational interfaces using voice and text',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/amazon-lex.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Messaging, Conversation'
  },
  {
    name: 'Cisco Jabber',
    description:
      'Connect your Cisco account and collaborate from your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/cisco-jabber.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Messaging, Marketing automation, Phone and video, Conversation'
  },
  {
    name: 'Cisco Webex',
    description:
      'Connect your Cisco account and make calls for business right from your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/cisco-webex.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Phone and video, Conversation'
  },
  {
    name: 'Google Dialog Flow',
    description: 'Connect an email address and build conversational experience',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/google-dialogflow.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Messaging, Marketing automation, Conversation'
  },
  {
    name: 'Google Hangouts',
    description:
      'Connect an email address and start free video, voice calls or message with one person or a group',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/google-hangouts.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Messaging, Marketing automation, Phone and video, Conversation'
  },
  {
    name: 'IBM Watson',
    description: 'Get access to your IBM Watson right in your Widget',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/ibm-watson.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Messaging, Natural language processing, Conversation'
  },
  {
    name: 'Microsoft Luis',
    description:
      'Connect this fast and effective way of messaging to your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/microsoft.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Natural language processing, Conversation'
  },
  {
    name: 'Microsoft Team',
    description:
      'Communicate with your team members and share files through your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/ms-teams.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Cloud storage, Messaging, Phone and video, Conversation'
  },
  {
    name: 'Rasa',
    description: 'Connect Rasa straight to your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/rasa.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Messaging, Marketing automation, Conversation'
  },
  {
    name: 'SAP Conversational AI',
    description:
      'Connect SAP AI and send voice messages through your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/sap.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Messaging, Marketing automation'
  },
  {
    name: 'Slack',
    description:
      'Connect Slack to send instant messages through your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/slack.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Messaging, Conversation'
  },
  {
    name: 'WIT.AI',
    description: 'Connect WIT.AI and share knowledge in your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/wit.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Messaging, Marketing automation, Natural language processing, Conversation'
  },
  {
    name: 'Agatha Answers',
    description:
      'Connect Agatha Answers to increase productivity in your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/agatha-answers.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Messaging, Conversation'
  },
  {
    name: 'Asana',
    description: 'Connect Asana to track and manage tasks',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/asana.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Project management'
  },
  {
    name: 'Asknicely',
    description: 'Close the loop in a hands-on manner in your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/ask-nicely.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Analytics, Marketing automation, Conversation'
  },
  {
    name: 'Chatbase',
    description: 'Build your best customer service virtual agent analytics',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/chatbase.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Analytics, Marketing automation, Messaging, Phone and video, Conversation'
  },
  {
    name: 'Clearbit',
    description: 'Connect Clearbit and supercharge your customer interactions',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/clearbit.png',
    category:
      'All integrations, For sales teams, Marketing automation, Contacts'
  },
  {
    name: 'Glassbox',
    description:
      'Help your organization manage the results of big data analytics',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/glassbox.png',
    category:
      'All integrations, For marketing teams, Analytics, Marketing automation, Messaging, Phone and video'
  },
  {
    name: 'Doorbell.io',
    description:
      'Connect DoorBell and understand different languages in your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/doorbell.png',
    category:
      'All integrations, For sales teams, For marketing teams, Surveys and Feedback, Conversation'
  },
  {
    name: 'Dropbox',
    description: 'Connect Dropbox files to your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/dropbox.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Cloud storage'
  },
  {
    name: 'Fivetran',
    description:
      'Connect Fivertran and get all the data you need, with no duplicates in your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/fivetran.png',
    category: 'All integrations, For marketing teams, Analytics'
  },
  {
    name: 'Full contact',
    description:
      'Improve your customer interactions with a simple, real-time API integration',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/full-contact.png',
    category:
      'All integrations, For sales teams, For marketing teams, Contacts, Data'
  },
  {
    name: 'Github',
    description: 'Connect to Github repositories right from your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/github.png',
    category: 'All integrations, Tools'
  },
  {
    name: 'Google calendar',
    description:
      'Connect to Google calendar time-management and scheduling calendar service',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/google-calendar.png',
    category:
      'All integrations, For sales teams, For marketing teams, Scheduling, Sales pipeline'
  },
  {
    name: 'Google Drive',
    description: 'Get started with Google drive right from your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/google-drive.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Cloud storage'
  },
  {
    name: 'Hubspot import',
    description: 'Connect to Hubspot import file from your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/hubspot.png',
    category:
      'All integrations, For sales teams, For marketing teams, Contacts, CRM, Data, Tools'
  },
  {
    name: 'Jira',
    description:
      'Connect Jira then bug tracking and agile project management in your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/jira.png',
    category:
      'All integrations, For sales teams, For marketing teams, Project management'
  },
  {
    name: 'Keen',
    description: 'Connect Keen then analysis fast in your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/keen.png',
    category: 'All integrations, For marketing teams, Analytics'
  },
  {
    name: 'LinkedIn',
    description:
      'Apply and navigate your career with confidence to your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/linkedin.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Messaging, Marketing automation, Social media'
  },
  {
    name: 'Loom',
    description:
      'Get Loom and make quick videos using a lightning-fast video recorder',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/loom.png',
    category:
      'All integrations, For support teams, Screen capture, Conversation'
  },
  {
    name: 'Mailchimp import',
    description: 'Join all‑in‑one Marketing Platform Mailchimp',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/mailchimp_logo.png',
    category:
      'All integrations, For sales teams, For marketing teams, Contacts, CRM, Data, Tools'
  },
  {
    name: 'ManDrill',
    description: 'Connect to ManDrill and sending data-driven mails',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/mandrill.png',
    category:
      'All integrations, For sales teams, For marketing teams, Email marketing, Marketing automation, Engage'
  },
  {
    name: 'ManyChat',
    description:
      'Connect with Facebook account and join Sales and Marketing platform ManyChat',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/manychat.png',
    category:
      'All integrations, For support teams, Messaging, Marketing automation, Conversation'
  },
  {
    name: 'Marketo Import',
    description: 'Connect to Marketo and enrich your leads with Intercom data',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/marketo-logo.png',
    category: 'All integrations, For sales teams, For marketing teams, Tools,'
  },
  {
    name: 'Meya',
    description:
      'Connect to Meya and build a highly sophisticated bot or cognitive application',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/meya.png',
    category:
      'All integrations, For support teams, For sales teams, For marketing teams, Marketing automation, Messaging, Conversation'
  },
  {
    name: 'Mixpanel',
    description:
      'Grow your business by analyzing, measuring and improving your customer experience',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/mix-panel.png',
    category:
      'All integrations, For sales teams, For marketing teams, Analytics, Messaging, Marketing automation, Social media'
  },
  {
    name: 'Outlook calendar',
    description:
      'Connect with Microsoft account and join fully integrated scheduling component of Outlook',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/outlook-calendar.png',
    category:
      'All integrations, For sales teams, For marketing teams, Scheduling, Sales pipeline'
  },
  {
    name: 'Parabola',
    description:
      'Connect to Parabola using your email address then hand off your routine data tasks',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/parabola.png',
    category: 'All integrations, For marketing teams, Project management'
  },
  {
    name: 'Piesync',
    description:
      'Connect to Piesync then keep your customer data 2-way in sync across all your business apps and devices',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/piesync.png',
    category:
      'All integrations, For sales teams, For marketing teams, Contacts, Data'
  },
  {
    name: 'Salesforce',
    description:
      'Connect SalesForce then  marketing automation, analytics in your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/wechat.png',
    category: 'All integrations, For sales teams, CRM, Sales pipeline'
  },
  {
    name: 'Salesforce import',
    description:
      'Connect SalesForce to import data with the Data Import Wizard in your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/salesforce.png',
    category: 'All integrations, Tools'
  },
  {
    name: 'Sendgrid',
    description:
      'Connect to Sendgrid and send promotional emails, shipping notifications and email newsletters',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/sendgrid.png',
    category:
      'All integrations, For sales teams, For marketing teams, Email marketing, Engage'
  },
  {
    name: 'Sendinblue',
    description:
      'Make your business take flight with the complete sales & marketing toolbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/sendinblue.png',
    category:
      'All integrations, For marketing teams, Email marketing, Marketing automation, Engage'
  },
  {
    name: 'Shipamax',
    description:
      'Connect to Shipmamax then aggregation of data in your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/shipamax.png',
    category:
      'All integrations, For sales teams, For marketing teams, Project management, Conversation'
  },
  {
    name: 'Stitch',
    description:
      'Sign in to Stitch, cloud first, open source platform for rapidly moving back',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/stitch.png',
    category: 'All integrations, For marketing teams, Data'
  },
  {
    name: 'Talkdesk',
    description:
      'Connect to Talkdesk combines enterprise performances with consumer simplicity',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/talkdesk.png',
    category:
      'All integrations, For support teams, Phone and video, Conversation'
  },
  {
    name: 'Webhook',
    description:
      'Transparently capture your API interactions and debug them in real-time',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/webhook.png',
    category: 'All integrations, Tools'
  },
  {
    name: 'Youtube',
    description:
      'Watch stream and discover what the world is watching with Youtube',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/youtube.jpeg',
    category:
      'All integrations, For sales teams, For marketing teams, Social media'
  },
  {
    name: 'Zapier',
    description:
      'Connect your apps and automate workflows from your Team Inbox',
    inMessenger: false,
    isAvailable: false,
    logo: '/images/integrations/zapier.png',
    category:
      'All integrations, For sales teams, For marketing teams, Contacts, CRM'
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
    items: ['Conversation', 'Sales pipeline', 'Contacts', 'Pop ups', 'Engage']
  },
  {
    name: 'Categories',
    items: [
      'Analytics',
      'Cloud storage',
      'CRM',
      'Data',
      'Email marketing',
      'Messaging',
      'Tools',
      'Marketing automation',
      'Natural language processing',
      'Phone and video',
      'Social media',
      'Scheduling',
      'Screen capture',
      'Surveys and Feedback'
    ]
  }
];
