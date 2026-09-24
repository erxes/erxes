import { Model } from 'mongoose';
import { customerSchema } from '@/integrations/whatsapp/db/definitions/customers';
import { IWhatsappCustomerDocument } from '@/integrations/whatsapp/@types/customers';
import { IModels } from '~/connectionResolvers';

export interface IWhatsappCustomerModel extends Model<IWhatsappCustomerDocument> {
  getOrCreateByPhone(params: {
    userId: string;
    integrationId: string;
    firstName?: string;
    lastName?: string;
  }): Promise<IWhatsappCustomerDocument>;
}

export const loadWhatsappCustomerClass = (models: IModels) => {
  class Customer {
    public static async getOrCreateByPhone({
      userId,
      integrationId,
      firstName,
      lastName,
    }: {
      userId: string;
      integrationId: string;
      firstName?: string;
      lastName?: string;
    }) {
      try {
        return await models.WhatsappCustomers.findOneAndUpdate(
          { userId, integrationId },
          {
            $setOnInsert: { userId, integrationId, firstName, lastName },
          },
          { new: true, upsert: true },
        );
      } catch (e) {
        if (e.code === 11000) {
          const existing = await models.WhatsappCustomers.findOne({
            userId,
            integrationId,
          });

          if (existing) {
            return existing;
          }
        }

        throw e;
      }
    }
  }

  customerSchema.loadClass(Customer);

  return customerSchema;
};
