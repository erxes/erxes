import { Document } from 'mongoose';

export interface IWhatsappCustomer {
  userId: string;
  erxesApiId?: string;
  firstName?: string;
  lastName?: string;
  profilePic?: string;
  integrationId: string;
}

export interface IWhatsappCustomerDocument
  extends IWhatsappCustomer,
    Document {
  _id: string;
}
