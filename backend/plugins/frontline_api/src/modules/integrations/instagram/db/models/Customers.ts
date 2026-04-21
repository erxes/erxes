import { Model, HydratedDocument } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import { customerSchema } from '@/integrations/instagram/db/definitions/customers';
import { IInstagramCustomerDocument } from '@/integrations/instagram/@types/customers';

type InstagramCustomerDoc = HydratedDocument<IInstagramCustomerDocument>;

type InstagramCustomerLean = IInstagramCustomerDocument;

export interface IInstagramCustomerModel extends Model<IInstagramCustomerDocument> {
  getCustomer(selector: any, isLean: true): Promise<InstagramCustomerLean>;

  getCustomer(selector: any, isLean?: false): Promise<InstagramCustomerDoc>;
}

export const loadInstagramCustomerClass = (models: IModels) => {
  class Customer {
    public static async getCustomer(
      selector: any,
      isLean = false,
    ): Promise<InstagramCustomerDoc | InstagramCustomerLean> {
      if (isLean) {
        const customer =
          await models.InstagramCustomers.findOne(
            selector,
          ).lean<InstagramCustomerLean>();

        if (!customer) {
          throw new Error('Customer not found');
        }

        return customer;
      }

      const customer = await models.InstagramCustomers.findOne(selector);

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};
