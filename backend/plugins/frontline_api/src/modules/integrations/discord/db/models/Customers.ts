import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { customerSchema } from '@/integrations/discord/db/definitions/customers';
import { IDiscordCustomerDocument } from '@/integrations/discord/@types/customers';

export interface IDiscordCustomerModel
  extends Model<IDiscordCustomerDocument> {
  getCustomer(
    selector: FilterQuery<IDiscordCustomerDocument>,
  ): Promise<IDiscordCustomerDocument>;
}

export const loadDiscordCustomerClass = (models: IModels) => {
  class Customer {
    public static async getCustomer(
      selector: FilterQuery<IDiscordCustomerDocument>,
    ) {
      const customer = await models.DiscordCustomers.findOne(selector);

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};
