import { __ } from '@erxes/ui/src/utils';

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
  BOOKING: 'booking',
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

    { text: 'SMS by Telnyx', value: 'telnyx' },
    { text: 'Booking', value: 'booking' }
  ]
};

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