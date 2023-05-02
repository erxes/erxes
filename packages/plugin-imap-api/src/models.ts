import { Document, Model, Schema } from 'mongoose';

interface IMail {
  name: string;
  address: string;
}

export interface IAttachmentParams {
  filename: string;
  size: number;
  mimeType: string;
  data?: string;
  attachmentId?: string;
}
export interface ICustomer {
  inboxIntegrationId: string;
  contactsId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  integrationId?: string;
}

export interface ICustomerDocument extends ICustomer, Document {}

export const customerSchema = new Schema({
  inboxIntegrationId: String,
  contactsId: String,
  email: { type: String, unique: true },
  firstName: String,
  lastName: String
});

export interface ICustomerModel extends Model<ICustomerDocument> {}

export const loadCustomerClass = models => {
  class Customer {}

  customerSchema.loadClass(Customer);

  return customerSchema;
};

export interface IMessage {
  inboxIntegrationId: string;
  inboxConversationId: string;
  messageId: string;
  subject: string;
  body: string;
  to: IMail[];
  cc: IMail[];
  bcc: IMail[];
  from: IMail[];
  attachments?: IAttachmentParams[];
  createdAt: Date;
}

export interface IMessageDocument extends IMessage, Document {}

export const attachmentSchema = new Schema(
  {
    filename: String,
    mimeType: String,
    type: String,
    size: Number,
    attachmentId: String
  },
  { _id: false }
);

const emailSchema = new Schema(
  {
    name: String,
    address: String
  },
  { _id: false }
);

export const messageSchema = new Schema({
  inboxIntegrationId: String,
  inboxConversationId: String,
  subject: String,
  messageId: { type: String, unique: true },
  inReplyTo: String,
  references: [String],
  body: String,
  to: [emailSchema],
  cc: [emailSchema],
  bcc: [emailSchema],
  from: [emailSchema],
  attachments: [attachmentSchema],
  createdAt: { type: Date, index: true, default: new Date() },
  type: { type: String, enum: ['SENT', 'INBOX'] }
});

export interface IMessageModel extends Model<IMessageDocument> {}

export const loadMessageClass = models => {
  class Message {}

  messageSchema.loadClass(Message);

  return messageSchema;
};
export interface IIntegration {
  inboxId: string;
  host: string;
  smtpHost: string;
  smtpPort: string;
  mainUser: string;
  user: string;
  password: string;
}

export interface IIntegrationDocument extends IIntegration, Document {}

// schema for integration document
export const integrationSchema = new Schema({
  inboxId: String,
  host: String,
  smtpHost: String,
  smtpPort: String,
  mainUser: String,
  user: String,
  password: String
});

export interface IIntegrationModel extends Model<IIntegrationDocument> {}

export const loadIntegrationClass = models => {
  class Integration {}

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};

export interface ILog {
  date: Date;
  type: 'info' | 'error';
  message: string;
  errorStack?: String;
}

export interface ILogDocument extends ILog, Document {}

export const logSchema = new Schema({
  date: Date,
  type: String,
  message: String,
  errorStack: String
});

export interface ILogModel extends Model<ILogDocument> {
  createLog({
    type,
    message
  }: {
    type: 'info' | 'error';
    message: string;
    errorStack?: string;
  }): JSON;
}

export const loadLogClass = models => {
  class Log {
    public static createLog({ type, message, errorStack }) {
      return models.Logs.create({
        date: new Date(),
        type,
        message,
        errorStack
      });
    }
  }

  logSchema.loadClass(Log);

  return logSchema;
};
