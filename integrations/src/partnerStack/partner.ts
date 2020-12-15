import { Document, Model, model, Schema } from 'mongoose';
import { field } from '../models/utils';

export interface ICustomer {
  partnerId: string;
  partnerKey: string;
  groupId: string;
  groupName: string;
  joinedAt: Date;
  erxesApiId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  integrationId: string;
}

export interface ICustomerDocument extends ICustomer, Document {}

export const customerSchema = new Schema({
  _id: field({ pkey: true }),
  email: { type: String, unique: true },
  partnerId: String,
  partnerKey: String,
  groupId: String,
  groupName: String,
  joinedAt: Date,
  erxesApiId: String,
  firstName: String,
  lastName: String,
  phone: String,
  integrationId: String
});

export interface ICustomerModel extends Model<ICustomerDocument> {
  getCustomer(selector: any, isLean?: boolean): Promise<ICustomerDocument>;
}

export const loadCustomerClass = () => {
  class Customer {
    public static async getCustomer(selector: any, isLean: boolean) {
      const customer = isLean
        ? await Customers.findOne(selector).lean()
        : await Customers.findOne(selector);

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};

loadCustomerClass();

// tslint:disable-next-line:variable-name
export const Customers = model<ICustomerDocument, ICustomerModel>(
  'customers_partnerStack',
  customerSchema
);
