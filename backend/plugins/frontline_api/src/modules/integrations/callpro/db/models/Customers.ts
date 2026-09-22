import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { callProCustomerSchema } from '@/integrations/callpro/db/definitions/customers';
import { ICallProCustomerDocument } from '@/integrations/callpro/@types/customers';

export interface ICallProCustomerModel
  extends Model<ICallProCustomerDocument> {
  getCustomer(
    selector: FilterQuery<ICallProCustomerDocument>,
  ): Promise<ICallProCustomerDocument>;
}

export const loadCallProCustomerClass = (models: IModels) => {
  // skipcq: JS-0327
  class Customer {
    public static async getCustomer(
      selector: FilterQuery<ICallProCustomerDocument>,
    ) {
      const customer = await models.CallProCustomers.findOne(selector);

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }
  }

  callProCustomerSchema.loadClass(Customer);

  return callProCustomerSchema;
};
