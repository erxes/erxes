import { HydratedDocument } from 'mongoose';

export interface ICallCustomer {
  _id: string;
  inboxIntegrationId: string;
  primaryPhone: string | number;
  erxesApiId?: string;
  status: string;
}

export type ICustomerDocument = HydratedDocument<ICallCustomer>;
