import { __ } from 'coreui/utils';

export const CALENDAR_INTEGRATIONS = [
  {
    kind: 'nylas-gmail',
    name: 'Gmail by Nylas'
  },
  {
    kind: 'nylas-office365',
    name: 'Office 365 by Nylas'
  }
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
    createUrl: '/settings/add-ons/createFacebook',
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
    createUrl: '/settings/add-ons/createFacebook',
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
    createUrl: '/settings/add-ons/createMessenger',
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
    createUrl: '/settings/add-ons/createGmail',
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
    createUrl: '/settings/add-ons/nylas-imap',
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
    createUrl: '/settings/add-ons/nylas-exchange',
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
    createUrl: '/settings/add-ons/nylas-outlook',
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
    createUrl: '/settings/add-ons/nylas-yahoo',
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
