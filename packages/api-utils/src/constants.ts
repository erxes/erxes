export const EMAIL_DELIVERY_STATUS = {
  PENDING: 'pending',
  RECEIVED: 'received',
  ALL: ['pending', 'received'],
};

export const WEBHOOK_TYPES = {
  CUSTOMER: 'customer',
  COMPANY: 'company',
  CONVERSATION: 'conversation',
  USER_MESSAGES: 'userMessages',
  CUSTOMER_MESSAGES: 'customerMessages',
  FORM_SUBMITTED: 'popupSubmitted',
  KNOWLEDGEBASE: 'knowledgeBaseArticle',
  CAMPAIGN: 'engageMessages',
  DEAL: 'deal',
  TASK: 'task',
  TICKET: 'ticket',
  ALL: [
    'customer',
    'company',
    'conversation',
    'userMessages',
    'customerMessages',
    'popupSubmitted',
    'knowledgeBaseArticle',
    'engageMessages',
    'deal',
    'task',
    'ticket',
  ],
};
