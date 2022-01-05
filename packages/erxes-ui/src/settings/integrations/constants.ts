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
