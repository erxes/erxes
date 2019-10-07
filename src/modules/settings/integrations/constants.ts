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
  LEAD: 'lead',
  CALLPRO: 'callpro',
  ALL_LIST: [
    'messenger',
    'facebook-post',
    'facebook-messenger',
    'lead',
    'callpro',
    'gmail',
    'nylas-gmail'
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
        createModal: 'facebook-post'
      },
      {
        name: 'Facebook messenger',
        description: 'Connect to Facebook messages right from your Team Inbox',
        inMessenger: false,
        kind: 'facebook-messenger',
        logo: '/images/integrations/fb-messenger.png',
        createModal: 'facebook-messenger'
      },
      {
        name: 'Messenger',
        description: 'See and reply to Messenger messages in your Team Inbox',
        inMessenger: false,
        kind: 'messenger',
        logo: '/images/integrations/messenger.png',
        createUrl: '/settings/integrations/createMessenger'
      },
      {
        name: 'Gmail',
        description:
          'connect straight to your gmail and get those emails going',
        inMessenger: false,
        kind: 'gmail',
        logo: '/images/integrations/gmail.png',
        createModal: 'gmail',
        createUrl: '/settings/integrations/gmail'
      }
    ]
  },
  {
    name: 'row-2',
    rows: [
      {
        name: 'Gmail by Nylas',
        description:
          'Connect straight to your gmail and get those emails going powered by Nylas',
        inMessenger: false,
        kind: 'nylas-gmail',
        logo: '/images/integrations/gmail.png',
        createModal: 'nylas-gmail',
        createUrl: '/settings/integrations/nylas-gmail'
      },
      {
        name: 'Lead',
        description: 'Find your lead forms right here in your Widget',
        inMessenger: true,
        kind: 'lead',
        logo: '/images/integrations/lead.png',
        createModal: 'lead',
        createUrl: '/settings/integrations/lead'
      },
      {
        name: 'Knowledge Base',
        description: 'Get access to your Knowledge Base right in your Widget',
        inMessenger: true,
        kind: 'knowledgebase',
        logo: '/images/integrations/knowledge-base.png',
        createModal: 'knowledgeBase',
        createUrl: '/settings/integrations/knowledgeBase'
      },
      {
        name: 'Engage config',
        description:
          'Set up your custome amazon simple email service account here',
        inMessenger: false,
        kind: 'amazon-ses',
        logo: '/images/integrations/aws-ses.png',
        createModal: 'sesconfig'
      }
    ]
  },
  {
    name: 'row-3',
    rows: [
      {
        name: 'Call Pro',
        description: 'Connect your call pro phone number',
        inMessenger: false,
        kind: 'callpro',
        logo: '/images/integrations/callpro.png',
        createModal: 'callpro'
      }
    ]
  },
  {
    title: 'Coming soon',
    name: 'row-4',
    rows: [
      {
        name: 'Viber',
        description: `Soon you'll be able to connect Viber straight to your Team Inbox`,
        inMessenger: false,
        logo: '/images/integrations/viber.png'
      },
      {
        name: 'WhatsApp',
        description:
          'Get a hold of your Whatsapp messages through your Team Inbox',
        inMessenger: false,
        logo: '/images/integrations/whatsapp.png'
      },
      {
        name: 'Wechat',
        description:
          'Connect with Wechat and start messaging right from your Team Inbox',
        inMessenger: false,
        logo: '/images/integrations/wechat.png'
      },
      {
        name: 'Line',
        description: 'See and reply to Line messages in your Team Inbox',
        inMessenger: false,
        logo: '/images/integrations/line.png'
      }
    ]
  }
];
