export const EMAIL_CONTENT_CLASS = 'erxes-email-content';
export const EMAIL_CONTENT_PLACEHOLDER = `<div class="${EMAIL_CONTENT_CLASS}"></div>`;

export const MESSAGE_KINDS = {
  AUTO: 'auto',
  VISITOR_AUTO: 'visitorAuto',
  MANUAL: 'manual',
  ALL_LIST: ['auto', 'visitorAuto', 'manual']
};

export const statusFilters = [
  { key: 'live', value: 'Live' },
  { key: 'draft', value: 'draft' },
  { key: 'paused', value: 'Paused' },
  { key: 'yours', value: 'Your messages' }
];

export const MESSAGE_KIND_FILTERS = [
  { name: 'auto', text: 'Auto' },
  { name: 'visitorAuto', text: 'Visitor auto' },
  { name: 'manual', text: 'Manual' }
];

export const MESSENGER_KINDS = {
  CHAT: 'chat',
  NOTE: 'note',
  POST: 'post',
  ALL_LIST: ['chat', 'note', 'post'],
  SELECT_OPTIONS: [
    { value: 'chat', text: 'Chat' },
    { value: 'note', text: 'Note' },
    { value: 'post', text: 'Post' }
  ]
};

export const METHODS = {
  MESSENGER: 'messenger',
  EMAIL: 'email',
  SMS: 'sms',
  ALL_LIST: ['messenger', 'email', 'sms']
};

export const SENT_AS_CHOICES = {
  BADGE: 'badge',
  SNIPPET: 'snippet',
  FULL_MESSAGE: 'fullMessage',
  ALL_LIST: ['badge', 'snippet', 'fullMessage'],
  SELECT_OPTIONS: [
    { value: 'badge', text: 'Badge' },
    { value: 'snippet', text: 'Snippet' },
    { value: 'fullMessage', text: 'Show the full message' }
  ]
};

export const SCHEDULE_TYPES = [
  { value: 'pre', label: 'Schedule for later' },
  { value: 'minute', label: 'Every minute' },
  { value: 'hour', label: 'Every hour' },
  { value: 'day', label: 'Every Day' },
  { value: 'month', label: 'Every Month' },
  { value: 'year', label: 'Every Year' },
  { value: 1, label: 'Every Monday' },
  { value: 2, label: 'Every Tuesday' },
  { value: 3, label: 'Every Wednesday' },
  { value: 4, label: 'Every Thursday' },
  { value: 5, label: 'Every Friday' },
  { value: 6, label: 'Every Saturday' },
  { value: 0, label: 'Every Sunday' }
];

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
      label: 'Queued',
      icon: 'list-ul',
      description: `The message is queued up on Telnyx's side`
    },
    {
      value: 'sending',
      label: 'Sending',
      icon: 'comment-alt-message',
      description: 'The message is currently being sent to an upstream provider'
    },
    {
      value: 'sent',
      label: 'Sent',
      icon: 'send',
      description: 'The message has been sent to the upstream provider'
    },
    {
      value: 'delivered',
      label: 'Delivered',
      icon: 'checked',
      description: 'The upstream provider has confirmed delivery of the message'
    },
    {
      value: 'sending_failed',
      label: 'Sending failed',
      icon: 'comment-alt-block',
      description:
        'Telnyx has failed to send the message to the upstream provider'
    },
    {
      value: 'delivery_failed',
      label: 'Delivery failed',
      icon: 'multiply',
      description:
        'The upstream provider has failed to send the message to the receiver'
    },
    {
      value: 'delivery_unconfirmed',
      label: 'Delivery unconfirmed',
      icon: 'comment-alt-question',
      description:
        'There is no indication whether or not the message has reached the receiver'
    }
  ]
};

export const AWS_EMAIL_DELIVERY_STATUSES = {
  SEND: 'send',
  DELIVERY: 'delivery',
  OPEN: 'open',
  CLICK: 'click',
  COMPLAINT: 'complaint',
  BOUNCE: 'bounce',
  RENDERING_FAILURE: 'renderingfailure',
  REJECT: 'reject',
  OPTIONS: [
    {
      value: 'send',
      label: 'Sent',
      description:
        'The call to Amazon SES was successful and Amazon SES will attempt to deliver the email',
      icon: 'telegram-alt'
    },
    {
      value: 'delivery',
      label: 'Delivered',
      description: `Amazon SES successfully delivered the email to the recipient's mail server`,
      icon: 'comment-check'
    },
    {
      value: 'open',
      label: 'Opened',
      description:
        'The recipient received the message and opened it in their email client',
      icon: 'envelope-open'
    },
    {
      value: 'click',
      label: 'Clicked',
      description: 'The recipient clicked one or more links in the email',
      icon: 'mouse-alt'
    },
    {
      value: 'complaint',
      label: 'Complaint/Spam',
      description:
        'The email was successfully delivered to the recipient. The recipient marked the email as spam',
      icon: 'frown'
    },
    {
      value: 'bounce',
      label: 'Bounce',
      description: `The recipient's mail server permanently rejected the email`,
      icon: 'arrows-up-right'
    },
    {
      value: 'reject',
      label: 'Rejected',
      description:
        'Amazon SES accepted the email, determined that it contained a virus, and rejected it',
      icon: 'times-circle'
    },
    {
      value: 'renderingfailure',
      label: 'Rendering failure',
      description: `The email wasn't sent because of a template rendering issue`,
      icon: 'ban'
    }
  ]
};

export const CAMPAIGN_TARGET_TYPES = {
  SEGMENT: 'segment',
  TAG: 'tag',
  BRAND: 'brand',
  ALL: ['segment', 'tag', 'brand']
};
