import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITelegramCustomerDocument } from '@/integrations/telegram/@types/customers';
import { telegramCustomerSchema } from '@/integrations/telegram/db/definitions/customers';

export interface ITelegramCustomerModel extends Model<ITelegramCustomerDocument> {
  getCustomer(
    selector: FilterQuery<ITelegramCustomerDocument>,
  ): Promise<ITelegramCustomerDocument>;
}

export const loadTelegramCustomerClass = (models: IModels) => {
  class TelegramCustomer {
    public static async getCustomer(
      selector: FilterQuery<ITelegramCustomerDocument>,
    ): Promise<ITelegramCustomerDocument> {
      const customer = await models.TelegramCustomers.findOne(selector);

      if (!customer) {
        throw new Error('Telegram customer not found');
      }

      return customer;
    }
  }

  telegramCustomerSchema.loadClass(TelegramCustomer);

  return telegramCustomerSchema;
};
