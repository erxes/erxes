export const CONTENT_TYPES = {
  CUSTOMER: 'customer',
  LEAD: 'lead',
  VISITOR: 'visitor',
  COMPANY: 'company',
  DEAL: 'deal',
  TASK: 'task',
  TICKET: 'ticket',
  CONVERSATION: 'conversation',
  USER: 'user',

  ALL: [
    'customer',
    'lead',
    'visitor',
    'company',
    'deal',
    'task',
    'ticket',
    'conversation',
    'user'
  ]
};

export const MESSAGE_KINDS = {
  AUTO: 'auto',
  VISITOR_AUTO: 'visitorAuto',
  MANUAL: 'manual',
  ALL: ['auto', 'visitorAuto', 'manual']
};

export const SMS_DELIVERY_STATUSES = {
  // default telnyx values
  QUEUED: 'queued',
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  SENDING_FAILED: 'sending_failed',
  DELIVERY_FAILED: 'delivery_failed',
  DELIVERY_UNCONFIRMED: 'delivery_unconfirmed',
  WEBHOOK_DELIVERED: 'webhook_delivered',
  // custom value
  ERROR: 'error',
  ALL: [
    'queued',
    'sending',
    'sent',
    'delivered',
    'sending_failed',
    'delivery_failed',
    'delivery_unconfirmed',
    'webhook_delivered',
    'error'
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
    },
    {
      value: 'webhook_delivered',
      label: 'Incoming sms delivered through webhook'
    },
    {
      value: 'error',
      label: 'error'
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
  SMS: 'campaign-sms',
  EMAIL: 'campaign-email',
  ALL: ['campaign-sms', 'campaign-email']
};

export const CAMPAIGN_KINDS = {
  AUTO: 'auto',
  VISITOR_AUTO: 'visitorAuto',
  MANUAL: 'manual',
  ALL: ['auto', 'visitorAuto', 'manual']
};

export const CAMPAIGN_METHODS = {
  MESSENGER: 'messenger',
  EMAIL: 'email',
  SMS: 'sms',
  ALL: ['messenger', 'email', 'sms']
};
