import { Document, Model, model, Schema } from 'mongoose';
import { SMS_DIRECTIONS } from './constants';

interface ISmsStatus {
  date: Date;
  status: string;
}

interface ICommon {
  erxesApiId?: string;
  integrationId: string;
}

interface IConversationMessage {
  from?: string;
  to?: string;
  content?: string;
  requestData?: string;
  conversationId: string;
  erxesApiId?: string;
  // telnyx data
  status?: string;
  responseData?: string;
  telnyxId?: string;
  statusUpdates?: ISmsStatus[];
  errorMessages?: string[];
  direction?: string;
}

interface IConversationMessageUpdate {
  status?: string;
  statusUpdates?: ISmsStatus[];
  responseData?: string;
  errorMessages?: string[];
  telnyxId?: string;
}

interface ICustomer extends ICommon {
  createdAt: Date;
  phoneNumber: string;
}

interface IConversation extends ICommon {
  from: string;
  to: string;
}

const commonFields = {
  createdAt: { type: Date, label: 'Created at', default: new Date() },
  erxesApiId: { type: String, label: 'Erxes api id' },
  integrationId: { type: String, label: 'Integration id' }
};

const customerSchema = new Schema({
  ...commonFields,
  phoneNumber: { type: String, label: 'Phone number', unique: true }
});

const conversationSchema = new Schema({
  ...commonFields,
  from: { type: String, label: 'Source phone number' },
  to: { type: String, label: 'Destination phone number' },
  customerId: { type: String, label: 'Customer saved in integrations-api' }
});

interface ICustomerDocument extends ICustomer, Document {}

interface IConversationMessageDocument extends IConversationMessage, Document {}

interface IConversationDocument extends IConversation, Document {}

interface IConversationMessageModel
  extends Model<IConversationMessageDocument> {
  createRequest(
    doc: IConversationMessage
  ): Promise<IConversationMessageDocument>;
  updateRequest(
    _id: string,
    doc: IConversationMessageUpdate
  ): Promise<IConversationMessageDocument>;
}

interface ICustomerModel extends Model<ICustomerDocument> {}

interface IConversationModel extends Model<IConversationDocument> {}

const statusSchema = new Schema(
  {
    date: { type: Date, label: 'Status update date' },
    status: { type: String, label: 'Sms delivery status' }
  },
  { _id: false }
);

// this serves as a conversation message
const schema = new Schema({
  createdAt: { type: Date, default: new Date(), label: 'Created at' },
  from: { type: String, label: 'Sender phone number' },
  to: { type: String, label: 'Receiver phone number' },
  content: { type: String, label: 'Sms content' },
  requestData: { type: String, label: 'Stringified request JSON' },
  // erxes-api data
  erxesApiId: { type: String, label: 'Conversation message id' },
  conversationId: { type: String, label: 'Conversation id' },
  integrationId: { type: String, label: 'Linked integration id' },
  // telnyx data
  direction: { type: String, label: 'Sms direction', enum: SMS_DIRECTIONS.ALL },
  status: { type: String, label: 'Sms delivery status' },
  responseData: { type: String, label: 'Stringified response JSON' },
  telnyxId: { type: String, label: 'Telnyx message record id' },
  statusUpdates: { type: [statusSchema], label: 'Sms status updates' },
  errorMessages: { type: [String], label: 'Error messages' }
});

const loadConversationMessageClass = () => {
  class ConversationMessage {
    public static async createRequest(doc: IConversationMessage) {
      const { erxesApiId, to } = doc;

      // single sms sent from customer detail page doesn't have conversation message id
      if (!erxesApiId) {
        return ConversationMessages.create(doc);
      }

      const exists = await ConversationMessages.findOne({ erxesApiId, to });

      if (exists) {
        throw new Error(
          `Sms request to "${to}" from conversation message id "${erxesApiId}" already exists.`
        );
      }

      return ConversationMessages.create(doc);
    }

    public static async updateRequest(
      _id: string,
      doc: IConversationMessageUpdate
    ) {
      await ConversationMessages.updateOne({ _id }, { $set: doc });

      return ConversationMessages.findOne({ _id });
    }
  }

  schema.loadClass(ConversationMessage);

  return schema;
};

loadConversationMessageClass();

// tslint:disable-next-line
export const ConversationMessages = model<
  IConversationMessageDocument,
  IConversationMessageModel
>('conversation_messages_telnyx', schema);

// tslint:disable-next-line
export const Customers = model<ICustomerDocument, ICustomerModel>(
  'customers_telnyx',
  customerSchema
);

// tslint:disable-next-line
export const Conversations = model<IConversationDocument, IConversationModel>(
  'conversations_telnyx',
  conversationSchema
);
