import { __ } from '@erxes/ui/src/utils';

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
  FORMS: 'lead',
  CALLPRO: 'callpro',
  WEBHOOK: 'webhook',
  BOOKING: 'booking',
  ALL: [
    { text: 'Messenger', value: 'messenger' },
    { text: 'Forms', value: 'lead' },
    {
      text: 'Facebook Messenger',
      value: 'facebook-messenger'
    },
    { text: 'Facebook Post', value: 'facebook-post' },
    { text: 'Webhook', value: 'webhook' },
    { text: 'Callpro', value: 'callpro' },
    { text: 'Booking', value: 'booking' }
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
];

export const WEBHOOK_DOC_URL =
  'https://www.erxes.org/developer/webhook#samples';
