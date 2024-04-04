import { Document, Model, Schema } from 'mongoose';

import { IModels } from '.';
import { field } from './definitions/utils';

export interface ICustomer {
  userId: string;
  // id on erxes-api
  erxesApiId?: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  integrationId: string;
  isFollower: boolean;
  isAnonymous: boolean;
}

export interface ICustomerDocument extends ICustomer, Document {}

export const customerSchema = new Schema({
  _id: field({ pkey: true }),
  userId: { type: String, unique: true },
  erxesApiId: String,
  firstName: String,
  lastName: String,
  profilePic: String,
  integrationId: String,
  isFollower: Boolean,
  isAnonymous: Boolean
});

export interface ICustomerModel extends Model<ICustomerDocument> {
  getCustomer(selector: any, isLean?: boolean): Promise<ICustomerDocument>;
}

export const loadCustomerClass = (models: IModels) => {
  class Customer {
    public static async getCustomer(selector: any, isLean: boolean) {
      let customer = await models.Customers.findOne(selector);

      if (isLean) {
        customer = await models.Customers.findOne(selector).lean();
      }

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};
