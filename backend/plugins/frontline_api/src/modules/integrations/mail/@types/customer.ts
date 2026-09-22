import { Document } from 'mongoose';

export interface IMailCustomer {
  inboxIntegrationId: string;
  contactsId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface IMailCustomerDocument extends IMailCustomer, Document {
  _id: string;
}
