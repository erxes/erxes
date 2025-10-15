import { Schema } from 'mongoose';
import { field } from '../utils';
import { ICallCustomerModel } from '@/integrations/call/db/models/Customers';
import { ICallCustomer } from '@/integrations/call/@types/customers';

export const customerSchema: Schema<ICallCustomer, ICallCustomerModel> =
  new Schema<ICallCustomer, ICallCustomerModel>({
    _id: field({ pkey: true }),
    erxesApiId: { type: String, label: 'Customer id at contacts-api' },
    primaryPhone: {
      type: String,
      unique: true,
      label: 'Call primary phone',
    },
    inboxIntegrationId: { type: String, label: 'Inbox integration id' },
    status: { type: String, label: 'status' },
  });
