import { Document } from 'mongoose';

export interface ITelegramCustomer {
  userId: string;
  erxesApiId?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  integrationId: string;
}

export interface ITelegramCustomerDocument extends ITelegramCustomer, Document {
  _id: string;
}
