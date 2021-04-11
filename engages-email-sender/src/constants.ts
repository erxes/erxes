export const SMS_DELIVERY_STATUSES = {
  QUEUED: 'queued',
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  SENDING_FAILED: 'sending_failed',
  DELIVERY_FAILED: 'delivery_failed',
  DELIVERY_UNCONFIRMED: 'delivery_unconfirmed',
  ALL: [
    'queued',
    'sending',
    'sent',
    'delivered',
    'sending_failed',
    'delivery_failed',
    'delivery_unconfirmed'
  ],
  OPTIONS: [
    {
      value: 'queued',
      label: `The message is queued up on Telnyx's side`
    },
    {
      value: 'sending',
      label: 'The message is currently being sent to an upstream provider'
    },
    {
      value: 'sent',
      label: 'The message has been sent to the upstream provider'
    },
    {
      value: 'delivered',
      label: 'The upstream provider has confirmed delivery of the message'
    },
    {
      value: 'sending_failed',
      label: 'Telnyx has failed to send the message to the upstream provider'
    },
    {
      value: 'delivery_failed',
      label:
        'The upstream provider has failed to send the message to the receiver'
    },
    {
      value: 'delivery_unconfirmed',
      label:
        'There is no indication whether or not the message has reached the receiver'
    }
  ]
};

export const SES_DELIVERY_STATUSES = {
  SEND: 'send',
  DELIVERY: 'delivery',
  OPEN: 'open',
  CLICK: 'click',
  COMPLAINT: 'complaint',
  BOUNCE: 'bounce',
  RENDERING_FAILURE: 'renderingfailure',
  REJECT: 'reject',
  ALL: [
    'bounce',
    'click',
    'complaint',
    'delivery',
    'open',
    'reject',
    'renderingfailure',
    'send'
  ]
};

// used for activity logging
export const ACTIVITY_LOG_ACTIONS = {
  SEND_EMAIL_CAMPAIGN: 'sendEmailCampaign',
  SEND_SMS_CAMPAIGN: 'sendSmsCampaign'
};

export const ACTIVITY_CONTENT_TYPES = {
  SMS: 'engage-sms',
  EMAIL: 'engage-email',
  ALL: ['engage-sms', 'engage-email']
};
