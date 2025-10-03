import { Document, Model, Schema } from 'mongoose';
import { IModels } from '~/connectionResolvers';
// import { sendCoreMessage, sendInboxMessage } from '../src/messageBroker';
import * as nodemailer from 'nodemailer';

interface IMapMail {
  name: string;
  address: string;
}

export interface IAttachmentIMapParams {
  filename: string;
  size: number;
  mimeType: string;
  data?: string;
  attachmentId?: string;
}
export interface ICustomerImap {
  inboxIntegrationId: string;
  contactsId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  integrationId?: string;
}

export interface ICustomerImapDocument extends ICustomerImap, Document {}

export const customerImapSchema = new Schema({
  inboxIntegrationId: String,
  contactsId: String,
  email: { type: String, unique: true },
  firstName: String,
  lastName: String,
});

export interface ICustomerImapModel extends Model<ICustomerImapDocument> {}

export const loadImapCustomerClass = (models) => {
  class Customer {}

  customerImapSchema.loadClass(Customer);

  return customerImapSchema;
};

export interface IMessageImap {
  inboxIntegrationId: string;
  inboxConversationId: string;
  messageId: string;
  subject: string;
  body: string;
  to: IMapMail[];
  cc: IMapMail[];
  bcc: IMapMail[];
  from: IMapMail[];
  attachments?: IAttachmentIMapParams[];
  createdAt: Date;
}

export interface IMessageImapDocument extends IMessageImap, Document {}

export const attachmentSchema = new Schema(
  {
    filename: String,
    mimeType: String,
    type: String,
    size: Number,
    attachmentId: String,
  },
  { _id: false },
);

const emailSchema = new Schema(
  {
    name: String,
    address: String,
  },
  { _id: false },
);

export const messageImapSchema = new Schema({
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
  type: { type: String, enum: ['SENT', 'INBOX'] },
});

export interface IMessageImapModel extends Model<IMessageImapDocument> {
  createSendMail(
    args: any,
    subdomain: string,
    models: IModels,
  ): Promise<IMessageImapDocument>;
}

export const loadImapMessageClass = (models) => {
  class Message {
    public static async createSendMail(
      args: any,
      subdomain: string,
      models: IModels,
    ) {
      const {
        integrationId,
        conversationId,
        subject,
        body,
        from,
        customerId,
        to,
        attachments,
        replyToMessageId,
        shouldOpen,
        shouldResolve,
      } = args;

      let customer;

      const selector = customerId
        ? { _id: customerId }
        : { status: { $ne: 'deleted' }, emails: { $in: to } };

      // customer = await sendCoreMessage({
      //   subdomain,
      //   action: 'customers.findOne',
      //   data: selector,
      //   isRPC: true
      // });

      if (!customer) {
        const [primaryEmail] = to;

        // customer = await sendCoreMessage({
        //   subdomain,
        //   action: 'customers.createCustomer',
        //   data: {
        //     state: 'lead',
        //     primaryEmail
        //   },
        //   isRPC: true
        // });
      }

      let integration;

      if (from) {
        integration = await models.Integrations.findOne({
          user: from,
        });
      }

      if (!integration) {
        integration = await models.Integrations.findOne({
          inboxId: integrationId,
        });
      }

      if (!integration && conversationId) {
        // const conversation = await sendInboxMessage({
        //   subdomain,
        //   action: 'conversations.findOne',
        //   data: { _id: conversationId },
        //   isRPC: true
        // });
        // integration = await models.Integrations.findOne({
        //   inboxId: conversation.integrationId
        // });
      }

      if (!integration) {
        throw new Error('Integration not found');
      }

      if (conversationId) {
        if (shouldResolve) {
          // await sendInboxMessage({
          //   subdomain,
          //   action: 'conversations.changeStatus',
          //   data: { id: conversationId, status: 'closed' },
          //   isRPC: true
          // });
        }
        if (shouldOpen) {
          // await sendInboxMessage({
          //   subdomain,
          //   action: 'conversations.changeStatus',
          //   data: { id: conversationId, status: 'new' },
          //   isRPC: true
          // });
        }
      }

      const transporter = nodemailer.createTransport({
        host: integration.smtpHost,
        port: integration.smtpPort,
        secure: true,
        logger: true,
        debug: true,
        auth: {
          user: integration.mainUser || integration.user,
          pass: integration.password,
        },
      });

      const mailData = {
        from,
        to,
        subject: replyToMessageId ? `Re: ${subject}` : subject,
        html: body,
        inReplyTo: replyToMessageId,
        references: [replyToMessageId],
        attachments: attachments
          ? attachments.map((attach) => ({
              filename: attach.name,
              path: attach.url,
            }))
          : [], // Default to an empty array if attachments is undefined
      };

      const info = await transporter.sendMail(mailData);

      // models.Messages.create({
      //   inboxIntegrationId: integration.inboxId,
      //   inboxConversationId: conversationId,
      //   createdAt: new Date(),
      //   messageId: info.messageId,
      //   inReplyTo: replyToMessageId,
      //   references: mailData.references,
      //   subject: mailData.subject,
      //   body: mailData.html,
      //   to: (mailData.to || []).map((to) => ({ name: to, address: to })),
      //   from: [{ name: mailData.from, address: mailData.from }],
      //   attachments: attachments
      //     ? attachments.map(({ name, type, size }) => ({
      //         filename: name,
      //         type,
      //         size
      //       }))
      //     : [],
      //   type: 'SENT'
      // });
      return {
        info: info,
      };
    }
  }

  messageImapSchema.loadClass(Message);

  return messageImapSchema;
};
export interface IIntegrationImap {
  inboxId: string;
  host: string;
  smtpHost: string;
  smtpPort: string;
  mainUser: string;
  user: string;
  password: string;
  healthStatus?: string;
  error?: string;
  lastFetchDate?: Date;
}

export interface IIntegrationImapDocument extends IIntegrationImap, Document {}

// schema for integration document
export const integrationImapSchema = new Schema({
  inboxId: String,
  host: String,
  smtpHost: String,
  smtpPort: String,
  mainUser: String,
  user: String,
  password: String,
  healthStatus: String,
  error: String,
  lastFetchDate: Date,
});

export interface IIntegrationImapModel
  extends Model<IIntegrationImapDocument> {}

export const loadImapIntegrationClass = (models) => {
  class Integration {}

  integrationImapSchema.loadClass(Integration);

  return integrationImapSchema;
};

export interface ILog {
  date: Date;
  type: 'info' | 'error';
  message: string;
  errorStack?: String;
}

export interface ILogImapDocument extends ILog, Document {}

export const logImapSchema = new Schema({
  date: Date,
  type: String,
  message: String,
  errorStack: String,
});

export interface ILogImapModel extends Model<ILogImapDocument> {
  createLog({
    type,
    message,
  }: {
    type: 'info' | 'error';
    message: string;
    errorStack?: string;
  }): JSON;
}

export const CreateSendMail = (Model) => {};
export const loadImapLogClass = (models) => {
  class Log {
    public static createLog({ type, message, errorStack }) {
      return models.Logs.create({
        date: new Date(),
        type,
        message,
        errorStack,
      });
    }
  }

  logImapSchema.loadClass(Log);

  return logImapSchema;
};
