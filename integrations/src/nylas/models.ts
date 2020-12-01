import { Document, model, Model, Schema } from 'mongoose';
import { field } from '../models/utils';

export interface INylasCustomer {
  email: string;
  firstName: string;
  lastName: string;
  erxesApiId: string;
  integrationId: string;
  kind: string;
}

export interface INylasCustomerDocument extends INylasCustomer, Document {}
export interface INylasCustomerModel extends Model<INylasCustomerDocument> {}

// Customer =============
const customerCommonSchema = {
  _id: field({ pkey: true }),
  email: { type: String, unique: true },
  erxesApiId: String,
  firstName: String,
  lastName: String,
  integrationId: String,
  kind: String
};

export const nylasGmailCustomerSchema = new Schema(customerCommonSchema);
export const nylasImapCustomerSchema = new Schema(customerCommonSchema);
export const nylasOutlookCustomerSchema = new Schema(customerCommonSchema);
export const nylasYahooCustomerSchema = new Schema(customerCommonSchema);
export const nylasOffice365CustomerSchema = new Schema(customerCommonSchema);
export const nylasExchangeCustomerSchema = new Schema(customerCommonSchema);

// tslint:disable-next-line
export const NylasExchangeCustomers = model<
  INylasCustomerDocument,
  INylasCustomerModel
>('customers_nylas_exchange', nylasExchangeCustomerSchema);

// tslint:disable-next-line
export const NylasGmailCustomers = model<
  INylasCustomerDocument,
  INylasCustomerModel
>('customers_nylas_gmail', nylasGmailCustomerSchema);

// tslint:disable-next-line
export const NylasImapCustomers = model<
  INylasCustomerDocument,
  INylasCustomerModel
>('customers_nylas_imap', nylasImapCustomerSchema);

// tslint:disable-next-line
export const NylasYahooCustomers = model<
  INylasCustomerDocument,
  INylasCustomerModel
>('customers_nylas_yahoo', nylasYahooCustomerSchema);

// tslint:disable-next-line
export const NylasOutlookCustomers = model<
  INylasCustomerDocument,
  INylasCustomerModel
>('customers_nylas_outlook', nylasOutlookCustomerSchema);

// tslint:disable-next-line
export const NylasOffice365Customers = model<
  INylasCustomerDocument,
  INylasCustomerModel
>('customers_nylas_office365', nylasOffice365CustomerSchema);

export interface INylasConversation {
  to: string;
  from: string;
  threadId: string;
  content: string;
  customerId: string;
  erxesApiId: string;
  createdAt: Date;
  integrationId: string;
  kind: string;
  unread: boolean;
}

export interface INylasConversationDocument
  extends INylasConversation,
    Document {}

// Conversation ==========
const conversationCommonSchema = {
  _id: field({ pkey: true }),
  to: { type: String, index: true },
  from: { type: String, index: true },
  threadId: { type: String, index: true },
  content: String,
  customerId: String,
  erxesApiId: String,
  integrationId: String,
  unread: Boolean,
  createdAt: field({ type: Date, index: true, default: new Date() })
};

export interface INylasConversatonModel
  extends Model<INylasConversationDocument> {}

export const nylasGmailConversationSchema = new Schema(
  conversationCommonSchema
);
export const nylasImapConversationSchema = new Schema(conversationCommonSchema);
export const nylasOutlookConversationSchema = new Schema(
  conversationCommonSchema
);
export const nylasYahooConversationSchema = new Schema(
  conversationCommonSchema
);
export const nylasOffice365ConversationSchema = new Schema(
  conversationCommonSchema
);
export const nylasExchangeConversationSchema = new Schema(
  conversationCommonSchema
);

// tslint:disable-next-line
export const NylasExchangeConversations = model<
  INylasConversationDocument,
  INylasConversatonModel
>('conversations_nylas_exchange', nylasExchangeConversationSchema);

// tslint:disable-next-line
export const NylasGmailConversations = model<
  INylasConversationDocument,
  INylasConversatonModel
>('conversations_nylas_gmail', nylasGmailConversationSchema);

// tslint:disable-next-line
export const NylasImapConversations = model<
  INylasConversationDocument,
  INylasConversatonModel
>('conversations_nylas_imap', nylasImapConversationSchema);

// tslint:disable-next-line
export const NylasYahooConversations = model<
  INylasConversationDocument,
  INylasConversatonModel
>('conversations_nylas_yahoo', nylasYahooConversationSchema);

// tslint:disable-next-line
export const NylasOutlookConversations = model<
  INylasConversationDocument,
  INylasConversatonModel
>('conversations_nylas_outlook', nylasOutlookConversationSchema);

// tslint:disable-next-line
export const NylasOffice365Conversations = model<
  INylasConversationDocument,
  INylasConversatonModel
>('conversations_nylas_office365', nylasOffice365ConversationSchema);

// Conversation message ===========
export interface IEmail {
  name: string;
  email: string;
}

export interface IAttachments {
  id: string;
  object: string;
  content_type: string;
  size: number;
  filename: string;
  message_ids: string[];
}

export interface ILabels {
  id: string;
  name: string;
  displayName: string;
}

export interface INylasConversationMessage {
  conversationId: string;
  erxesApiMessageId: string;

  // Message type
  messageId: string;
  subject: string;
  account_id: string;
  replyTo: [IEmail];
  to: [IEmail];
  from: [IEmail];
  cc: [IEmail];
  bcc: [IEmail];
  date: number;
  thread_id: string;
  snippet: string;
  body: string;
  files: [IAttachments];
  labels: [ILabels];
  unread: boolean;
}

export interface INylasConversationMessageDocument
  extends INylasConversationMessage,
    Document {}

const emailSchema = new Schema({ name: String, email: String }, { _id: false });

const attachmentsSchema = new Schema(
  {
    id: String,
    object: String,
    content_type: String,
    size: Number,
    filename: String,
    message_ids: [String]
  },
  { _id: false }
);

const labelsSchema = new Schema(
  {
    id: String,
    name: String,
    displayName: String
  },
  { _id: false }
);

const conversationMessageCommonSchema = {
  _id: field({ pkey: true }),
  conversationId: String,
  customerId: String,
  erxesApiMessageId: String,
  messageId: String,
  id: String,
  subject: String,
  body: String,
  accountId: String,
  replyTo: [emailSchema],
  to: [emailSchema],
  from: [emailSchema],
  cc: [emailSchema],
  bcc: [emailSchema],
  date: String,
  unread: Boolean,
  threadId: String,
  snipped: String,
  attachments: [attachmentsSchema],
  labels: [labelsSchema]
};

export const nylasGmailConversationMessageSchema = new Schema(
  conversationMessageCommonSchema
);
export const nylasImapConversationMessageSchema = new Schema(
  conversationMessageCommonSchema
);
export const nylasYahooConversationMessageSchema = new Schema(
  conversationMessageCommonSchema
);
export const nylasOutlookConversationMessageSchema = new Schema(
  conversationMessageCommonSchema
);
export const nylasOffice365ConversationMessageSchema = new Schema(
  conversationMessageCommonSchema
);
export const nylasExchangeConversationMessageSchema = new Schema(
  conversationMessageCommonSchema
);

export interface INylasConversationMessageModel
  extends Model<INylasConversationMessageDocument> {}

// tslint:disable-next-line
export const NylasExchangeConversationMessages = model<
  INylasConversationMessageDocument,
  INylasConversationMessageModel
>(
  'conversation_messages_nylas_exchange',
  nylasExchangeConversationMessageSchema
);

// tslint:disable-next-line
export const NylasGmailConversationMessages = model<
  INylasConversationMessageDocument,
  INylasConversationMessageModel
>('conversation_messages_nylas_gmail', nylasGmailConversationMessageSchema);

// tslint:disable-next-line
export const NylasOutlookConversationMessages = model<
  INylasConversationMessageDocument,
  INylasConversationMessageModel
>('conversation_messages_nylas_outlook', nylasOutlookConversationMessageSchema);

// tslint:disable-next-line
export const NylasYahooConversationMessages = model<
  INylasConversationMessageDocument,
  INylasConversationMessageModel
>('conversation_messages_nylas_yahoo', nylasYahooConversationMessageSchema);

// tslint:disable-next-line
export const NylasImapConversationMessages = model<
  INylasConversationMessageDocument,
  INylasConversationMessageModel
>('conversation_messages_nylas_imap', nylasImapConversationMessageSchema);

// tslint:disable-next-line
export const NylasOffice365ConversationMessages = model<
  INylasConversationMessageDocument,
  INylasConversationMessageModel
>(
  'conversation_messages_nylas_office365',
  nylasOffice365ConversationMessageSchema
);

// Calendar =============
export interface ICalendar {
  providerCalendarId: string;
  kind: string;
  accountUid: string;
  name: string;
  description: string;
  readOnly: boolean;
  show: boolean;
  customName: string;
  color: string;
}

export interface ICalendarDocument extends ICalendar, Document {}
export interface ICalendarModel extends Model<ICalendarDocument> {}

const calendarSchema = {
  _id: field({ pkey: true }),
  providerCalendarId: { type: String, unique: true },
  kind: String,
  accountUid: String,
  name: String,
  description: String,
  readOnly: Boolean,
  show: Boolean,
  customName: String,
  color: String
};

// tslint:disable-next-line
export const NylasCalendars = model<ICalendarDocument, ICalendarModel>(
  'calendar',
  new Schema(calendarSchema)
);

// Event
export interface IEvent {
  kind: string;
  providerEventId: string;
  accountUid: string;
  calendarId: string;
  providerCalendarId: string;
  messageId: string;
  title: string;
  description: string;
  owner: string;
  time: number;
  participants: Array<{
    name?: string;
    email: string;
    status?: string;
    comment?: string;
  }>;
  readOnly: boolean;
  location: string;
  when: {
    end_time: number;
    start_time: number;
  };
  busy: boolean;
  status: string;
  color: string;
}

export interface IEventDocument extends IEvent, Document {}
export interface IEventModel extends Model<IEventDocument> {}

const participantsSchema = new Schema(
  {
    name: String,
    email: String,
    status: String,
    comment: String
  },
  { _id: false }
);

const eventSchema = {
  _id: field({ pkey: true }),
  kind: String,
  providerEventId: { type: String, unique: true },
  accountUid: String,
  calendarId: String,
  providerCalendarId: String,
  messageId: String,
  title: String,
  description: String,
  owner: String,
  time: Number,
  participants: [participantsSchema],
  readOnly: Boolean,
  location: String,
  when: Schema.Types.Mixed,
  busy: Boolean,
  status: String,
  color: String
};

// tslint:disable-next-line
export const NylasEvent = model<IEventDocument, IEventModel>(
  'event',
  new Schema(eventSchema)
);
