import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITelegramCustomerDocument } from '@/integrations/telegram/@types/customers';
import { telegramCustomerSchema } from '@/integrations/telegram/db/definitions/customers';

export interface ITelegramCustomerModel
  extends Model<ITelegramCustomerDocument> {
  getCustomer(
    selector: FilterQuery<ITelegramCustomerDocument>,
  ): Promise<ITelegramCustomerDocument>;
}

/** Registers tenant-scoped Telegram customer lookup methods. */
export const loadTelegramCustomerClass = (models: IModels) => {
  /** Loads provider identities and their linked Core contact IDs. */
  class TelegramCustomer {
    /** Returns a matching Telegram customer or reports a missing mapping. */
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
