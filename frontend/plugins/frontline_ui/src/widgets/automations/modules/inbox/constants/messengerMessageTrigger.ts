export type TMessengerEventType =
  | 'directMessage'
  | 'getStarted'
  | 'quickReply'
  | 'customerRegistration'
  | 'ticketFormSubmission'
  | 'requestCreateTicket';

export type TMessengerEventOption = {
  type: TMessengerEventType;
  labelKey: string;
  descriptionKey: string;
};

export const MESSENGER_EVENT_OPTIONS: TMessengerEventOption[] = [
  {
    type: 'directMessage',
    labelKey: 'direct-message.label',
    descriptionKey: 'direct-message.description',
  },
  {
    type: 'getStarted',
    labelKey: 'get-started.label',
    descriptionKey: 'get-started.description',
  },
  {
    type: 'quickReply',
    labelKey: 'quick-reply.label',
    descriptionKey: 'quick-reply.description',
  },
  {
    type: 'ticketFormSubmission',
    labelKey: 'ticket-form-submission.label',
    descriptionKey: 'ticket-form-submission.description',
  },
  {
    type: 'requestCreateTicket',
    labelKey: 'request-create-ticket.label',
    descriptionKey: 'request-create-ticket.description',
  },
];
