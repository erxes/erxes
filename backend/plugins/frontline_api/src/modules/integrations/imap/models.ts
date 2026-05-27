import { Document, Model, Schema } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import * as nodemailer from 'nodemailer';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

/* ── shared sub-types ───────────────────────────────────────────────── */

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

/* ── Customer ───────────────────────────────────────────────────────── */

export interface ICustomerImap {
  inboxIntegrationId: string;
  contactsId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface ICustomerImapDocument extends ICustomerImap, Document {}
export type ICustomerImapModel = Model<ICustomerImapDocument>;

export const customerImapSchema = new Schema({
  inboxIntegrationId: String,
  contactsId: String,
  email: { type: String, unique: true },
  firstName: String,
  lastName: String,
});

export const loadImapCustomerClass = (_models) => {
  class Customer {}
  customerImapSchema.loadClass(Customer);
  return customerImapSchema;
};

/* ── Message ────────────────────────────────────────────────────────── */

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
  type?: 'SENT' | 'INBOX';
  inReplyTo?: string;
  references?: string[];
}

export interface IMessageImapDocument extends IMessageImap, Document {}

/** Args accepted by `createSendMail`. */
export interface ISendMailArgs {
  integrationId?: string;
  conversationId?: string;
  subject: string;
  body?: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  attachments?: { name?: string; url?: string; type?: string; size?: number }[];
  replyToMessageId?: string;
  references?: string[];
  shouldResolve?: boolean;
  shouldOpen?: boolean;
  customerId?: string;
}

const attachmentSchema = new Schema(
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
  { name: String, address: String },
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
  createdAt: { type: Date, index: true, default: () => new Date() },
  type: { type: String, enum: ['SENT', 'INBOX'] },
});

export interface IMessageImapModel extends Model<IMessageImapDocument> {
  createSendMail(
    args: ISendMailArgs,
    subdomain: string,
    models: IModels,
  ): Promise<{ info: nodemailer.SentMessageInfo }>;
}

export const loadImapMessageClass = (models: IModels) => {
  class Message {
    public static async createSendMail(
      args: ISendMailArgs,
      subdomain: string,
      _models: IModels,
    ): Promise<{ info: nodemailer.SentMessageInfo }> {
      const {
        integrationId,
        conversationId,
        subject,
        body,
        from,
        customerId,
        to,
        cc,
        bcc,
        attachments,
        replyToMessageId,
        references,
        shouldOpen,
        shouldResolve,
      } = args;

      /* ── resolve customer ─────────────────────────────────────── */
      let customer: { _id?: string } | null = null;

      if (customerId) {
        customer = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'customers',
          action: 'findOne',
          input: { selector: { _id: customerId } },
          defaultValue: null,
        });
      }

      if (!customer?._id) {
        customer = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'customers',
          action: 'findOne',
          input: { selector: { status: { $ne: 'deleted' }, emails: { $in: to } } },
          defaultValue: null,
        });
      }

      if (!customer?._id) {
        const [primaryEmail] = to;
        customer = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'customers',
          action: 'createCustomer',
          input: { state: 'lead', primaryEmail },
          defaultValue: null,
        });
      }

      /* ── resolve integration ──────────────────────────────────── */
      let integration = await models.ImapIntegrations.findOne({ user: from });

      if (!integration && integrationId) {
        integration = await models.ImapIntegrations.findOne({
          inboxId: integrationId,
        });
      }

      if (!integration && conversationId) {
        const conversation = await models.Conversations.findOne({
          _id: conversationId,
        });
        if (conversation?.integrationId) {
          integration = await models.ImapIntegrations.findOne({
            inboxId: conversation.integrationId,
          });
        }
      }

      if (!integration) {
        throw new Error('IMAP integration not found');
      }

      /* ── update conversation status ───────────────────────────── */
      if (conversationId) {
        if (shouldResolve) {
          await models.Conversations.updateOne(
            { _id: conversationId },
            { $set: { status: 'closed' } },
          );
        } else if (shouldOpen) {
          await models.Conversations.updateOne(
            { _id: conversationId },
            { $set: { status: 'new' } },
          );
        }
      }

      /* ── send via SMTP ────────────────────────────────────────── */
      const smtpPort = Number(integration.smtpPort) || 465;
      const secure = smtpPort === 465;

      const transporter = nodemailer.createTransport({
        host: integration.smtpHost,
        port: smtpPort,
        secure,
        auth: {
          user: integration.mainUser || integration.user,
          pass: integration.password,
        },
      });

      // Build references chain: existing chain + the message being replied to
      const refsChain: string[] = [
        ...(references ?? []),
        ...(replyToMessageId ? [replyToMessageId] : []),
      ].filter(Boolean);

      const mailOptions: nodemailer.SendMailOptions = {
        from,
        to,
        cc: cc?.length ? cc : undefined,
        bcc: bcc?.length ? bcc : undefined,
        subject,
        html: body,
        inReplyTo: replyToMessageId,
        references: refsChain.length ? refsChain : undefined,
        attachments: (attachments ?? []).map((a) => ({
          filename: a.name,
          path: a.url,
        })),
      };

      const info = await transporter.sendMail(mailOptions);

      /* ── persist sent message ─────────────────────────────────── */
      const toAddr = (addr: string) => ({ name: addr, address: addr });

      await models.ImapMessages.create({
        inboxIntegrationId: integration.inboxId,
        inboxConversationId: conversationId,
        createdAt: new Date(),
        messageId: info.messageId,
        inReplyTo: replyToMessageId,
        references: refsChain,
        subject,
        body: body ?? '',
        to: to.map(toAddr),
        cc: (cc ?? []).map(toAddr),
        bcc: (bcc ?? []).map(toAddr),
        from: [toAddr(from)],
        attachments: (attachments ?? []).map(({ name, type, size }) => ({
          filename: name,
          type,
          size,
        })),
        type: 'SENT',
      });

      return { info };
    }
  }

  messageImapSchema.loadClass(Message);
  return messageImapSchema;
};

/* ── Integration ────────────────────────────────────────────────────── */

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
export type IIntegrationImapModel = Model<IIntegrationImapDocument>;

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

export const loadImapIntegrationClass = (_models) => {
  class Integration {}
  integrationImapSchema.loadClass(Integration);
  return integrationImapSchema;
};

/* ── Log ────────────────────────────────────────────────────────────── */

export interface ILog {
  date: Date;
  type: 'info' | 'error';
  message: string;
  errorStack?: string;
}

export interface ILogImapDocument extends ILog, Document {}

export const logImapSchema = new Schema({
  date: Date,
  type: String,
  message: String,
  errorStack: String,
});

export interface ILogImapModel extends Model<ILogImapDocument> {
  createLog(params: {
    type: 'info' | 'error';
    message: string;
    errorStack?: string;
  }): Promise<ILogImapDocument>;
}

export const loadImapLogClass = (models: IModels) => {
  class Log {
    public static async createLog({
      type,
      message,
      errorStack,
    }: {
      type: 'info' | 'error';
      message: string;
      errorStack?: string;
    }) {
      return models.ImapLogs.create({
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
