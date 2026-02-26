import { Document } from 'mongoose';

export interface IInstagramCustomer {
  userId: string;
  // id on erxes-api
  erxesApiId?: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  integrationId: string;
}

export interface IInstagramCustomerDocument
  extends IInstagramCustomer,
    Document {
  _id: string;
}
