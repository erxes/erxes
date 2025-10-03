import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { customerSchema } from '@/integrations/facebook/db/definitions/customers';
import { IFacebookCustomerDocument } from '@/integrations/facebook/@types/customers';

export interface IFacebookCustomerModel
  extends Model<IFacebookCustomerDocument> {
  getCustomer(
    selector: any,
    isLean?: boolean,
  ): Promise<IFacebookCustomerDocument>;
}

export const loadFacebookCustomerClass = (models: IModels) => {
  class Customer {
    public static async getCustomer(selector: any) {
      const customer = await models.FacebookCustomers.findOne(selector);

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};
