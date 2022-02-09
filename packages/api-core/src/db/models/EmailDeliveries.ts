import { Model, model } from 'mongoose';
import {
  emailDeliverySchema,
  IEmailDeliveries,
  IEmailDeliveriesDocument
} from './definitions/emailDeliveries';

export interface IEmailDeliveryModel extends Model<IEmailDeliveriesDocument> {
  createEmailDelivery(doc: IEmailDeliveries): Promise<IEmailDeliveriesDocument>;
  updateEmailDeliveryStatus(_id: string, status: string): Promise<void>;
}

export const loadClass = () => {
  class EmailDelivery {
    /**
     * Create an EmailDelivery document
     */
    public static async createEmailDelivery(doc: IEmailDeliveries) {
      return EmailDeliveries.create({
        ...doc
      });
    }

    public static async updateEmailDeliveryStatus(_id: string, status: string) {
      return EmailDeliveries.updateOne({ _id }, { $set: { status } });
    }
  }

  emailDeliverySchema.loadClass(EmailDelivery);

  return emailDeliverySchema;
};

loadClass();

// tslint:disable-next-line
const EmailDeliveries = model<IEmailDeliveriesDocument, IEmailDeliveryModel>(
  'email_deliveries',
  emailDeliverySchema
);

export default EmailDeliveries;
