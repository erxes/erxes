import {
  IEmailDeliveries,
  IEmailDeliveriesDocument,
} from '@/organization/types';
import { emailDeliverySchema } from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IEmailDeliveryModel extends Model<IEmailDeliveriesDocument> {
  createEmailDelivery(doc: IEmailDeliveries): Promise<IEmailDeliveriesDocument>;
  updateEmailDeliveryStatus(_id: string, status: string): Promise<void>;
}

export const loadEmailDeliveryClass = (models: IModels) => {
  class EmailDelivery {
    /**
     * Create an EmailDelivery document
     */
    public static async createEmailDelivery(doc: IEmailDeliveries) {
      return models.EmailDeliveries.create({
        ...doc,
      });
    }

    public static async updateEmailDeliveryStatus(_id: string, status: string) {
      return models.EmailDeliveries.updateOne({ _id }, { $set: { status } });
    }
  }

  emailDeliverySchema.loadClass(EmailDelivery);

  return emailDeliverySchema;
};
