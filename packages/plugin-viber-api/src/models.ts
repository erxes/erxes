import { Schema, model, Document, Model } from 'mongoose';
import { sendInboxMessage } from './messageBroker';

interface ICustomer {
  inboxIntegrationId: string;
  contactsId: string | null;
  viberId: string;
  name: string;
  country: string;
}

export const customerSchema: Schema<ICustomer> = new Schema<ICustomer>({
  inboxIntegrationId: String,
  contactsId: String,
  viberId: String,
  name: String,
  country: String
});

export const loadCustomerClass = () => {
  class Customer {
    static async getOrCreate(
      viberAccount: ICustomer,
      subdomain: string
    ): Promise<any> {
      let customer = await Customers.findOne({ viberId: viberAccount.viberId });

      if (!customer) {
        customer = await Customers.create({
          inboxIntegrationId: viberAccount.inboxIntegrationId,
          contactsId: null,
          viberId: viberAccount.viberId,
          name: viberAccount.name,
          country: viberAccount.country
        });

        try {
          const apiCustomerResponse = await sendInboxMessage({
            subdomain,
            action: 'integrations.receive',
            data: {
              action: 'get-create-update-customer',
              payload: JSON.stringify({
                integrationId: viberAccount.inboxIntegrationId,
                firstName: viberAccount.name,
                lastName: null,
                avatar: null,
                isUser: true
              })
            },
            isRPC: true
          });

          customer.contactsId = apiCustomerResponse._id;
          await customer.save();
        } catch (e) {
          await customer.deleteOne({ _id: customer._id });
          throw new Error(e);
        }
      }

      return customer;
    }
  }
  customerSchema.loadClass(Customer);
  return customerSchema;
};

export const Customers = model<any, any>(
  'viber_customers',
  loadCustomerClass()
);

export const integrationSchema: Schema<any> = new Schema({
  inboxId: String,
  accountId: String,
  token: String
});

export const loadIntegrationClass = () => {
  class Integration {}
  integrationSchema.loadClass(Integration);
  return integrationSchema;
};

export const Integrations = model<any, any>(
  'viber_integrations',
  loadIntegrationClass()
);

export interface IConversation extends Document {
  erxesApiId?: string;
  timestamp: Date;
  senderId: string;
  recipientId?: string;
  integrationId: string;
}

export const conversationSchema: Schema<IConversation> = new Schema<
  IConversation
>({
  erxesApiId: String,
  timestamp: Date,
  senderId: { type: String, index: true },
  recipientId: { type: String, index: true, required: false },
  integrationId: String
});

conversationSchema.index({ senderId: 1, recipientId: 1 }, { unique: true });

export const Conversations: Model<IConversation, {}> = model<IConversation>(
  'viber_conversation',
  conversationSchema
);

export interface IConversationMessages extends Document {
  conversationId: string;
  userId: string;
  customerId: string;
  createdAt: Date;
  content: string;
  messageType: string;
  attachments?: any;
}

export const conversationMessageSchema: Schema<IConversationMessages> = new Schema<
  IConversationMessages
>({
  conversationId: String,
  userId: String,
  customerId: String,
  createdAt: Date,
  content: String,
  messageType: String,
  attachments: Schema.Types.Mixed
});

export const ConversationMessages: Model<IConversationMessages, {}> = model<
  IConversationMessages
>('viber_conversation_messages', conversationMessageSchema);
