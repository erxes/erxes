export const KIND_CHOICES = {
  MESSENGER: 'messenger',
  LEAD: 'lead',
  FACEBOOK_MESSENGER: 'facebook-messenger',
  FACEBOOK_POST: 'facebook-post',
  GMAIL: 'gmail',
  NYLAS_GMAIL: 'nylas-gmail',
  NYLAS_IMAP: 'nylas-imap',
  NYLAS_OFFICE365: 'nylas-office365',
  NYLAS_EXCHANGE: 'nylas-exchange',
  NYLAS_OUTLOOK: 'nylas-outlook',
  NYLAS_YAHOO: 'nylas-yahoo',
  CALLPRO: 'callpro',
  TWITTER_DM: 'twitter-dm',
  CHATFUEL: 'chatfuel',
  SMOOCH_VIBER: 'smooch-viber',
  SMOOCH_LINE: 'smooch-line',
  SMOOCH_TELEGRAM: 'smooch-telegram',
  SMOOCH_TWILIO: 'smooch-twilio',
  WHATSAPP: 'whatsapp',
  TELNYX: 'telnyx',
  WEBHOOK: 'webhook',
  ALL: [
    'messenger',
    'lead',
    'facebook-messenger',
    'facebook-post',
    'gmail',
    'callpro',
    'chatfuel',
    'nylas-gmail',
    'nylas-imap',
    'nylas-office365',
    'nylas-outlook',
    'nylas-exchange',
    'nylas-yahoo',
    'twitter-dm',
    'smooch-viber',
    'smooch-line',
    'smooch-telegram',
    'smooch-twilio',
    'whatsapp',
    'telnyx',
    'webhook'
  ]
};

export const DashboardFilterTypes = {
  User: ['modifiedBy', 'firstRespondedUser', 'assignedUser']
};

export const DashboardFilters = {
  'Customer.status': [
    { label: 'Active', value: 'Active' },
    { label: 'Deleted', value: 'Deleted' }
  ],
  'Visitors.status': [
    { label: 'Active', value: 'Active' },
    { label: 'Deleted', value: 'Deleted' }
  ],
  'Leads.status': [
    { label: 'Active', value: 'Active' },
    { label: 'Deleted', value: 'Deleted' }
  ],
  'Deals.stageProbability': [
    { label: 'Won', value: 'Won' },
    { label: 'Lost', value: 'Lost' },
    { label: '10%', value: '10%' },
    { label: '20%', value: '20%' },
    { label: '30%', value: '30%' },
    { label: '40%', value: '40%' },
    { label: '50%', value: '50%' },
    { label: '60%', value: '60%' },
    { label: '70%', value: '70%' },
    { label: '80%', value: '80%' },
    { label: '90%', value: '90%' }
  ],
  'Deals.status': [
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' }
  ],
  'Deals.priority': [
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'High' },
    { label: 'Normal', value: 'Normal' },
    { label: 'Low', value: 'Low' }
  ],

  'Tasks.status': [
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' }
  ],
  'Tasks.priority': [
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'High' },
    { label: 'Normal', value: 'Normal' },
    { label: 'Low', value: 'Low' }
  ],

  'Tickets.stageProbability': [
    { label: 'Won', value: 'Won' },
    { label: 'Lost', value: 'Lost' },
    { label: '10%', value: '10%' },
    { label: '20%', value: '20%' },
    { label: '30%', value: '30%' },
    { label: '40%', value: '40%' },
    { label: '50%', value: '50%' },
    { label: '60%', value: '60%' },
    { label: '70%', value: '70%' },
    { label: '80%', value: '80%' },
    { label: '90%', value: '90%' }
  ],
  'Tickets.status': [
    { label: 'Active', value: 'active' },
    { label: 'Archived', value: 'archived' }
  ],
  'Tickets.priority': [
    { label: 'Critical', value: 'Critical' },
    { label: 'High', value: 'High' },
    { label: 'Normal', value: 'Normal' },
    { label: 'Low', value: 'Low' }
  ],

  'Conversations.status': [
    { label: 'New', value: 'new' },
    { label: 'Open', value: 'open' },
    { label: 'Closed', value: 'closed' }
  ]
};
