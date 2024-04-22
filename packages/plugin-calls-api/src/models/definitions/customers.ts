import { Schema, HydratedDocument } from 'mongoose';
import { stringId } from '@erxes/api-utils/src/definitions/utils';

export interface ICustomer {
  _id: string;
  inboxIntegrationId: string;
  primaryPhone: string | number;
  erxesApiId?: string;
  status: string;
}

export type ICustomerDocument = HydratedDocument<ICustomer>;

export const customerSchema: Schema<ICustomer> = new Schema<ICustomer>({
  _id: stringId,
  erxesApiId: { type: String, label: 'Customer id at contacts-api' },
  primaryPhone: {
    type: String,
    unique: true,
    label: 'Call primary phone',
  },
  inboxIntegrationId: { type: String, label: 'Inbox integration id' },
  status: { type: String, label: 'status' },
});
