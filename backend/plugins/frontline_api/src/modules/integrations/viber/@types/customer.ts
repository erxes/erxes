import type { Document } from 'mongoose';

export interface IViberCustomer {
  inboxId: string;
  userId: string;
  contactsId: string;
}

export interface IViberCustomerDocument extends IViberCustomer, Document {
  _id: string;
}
