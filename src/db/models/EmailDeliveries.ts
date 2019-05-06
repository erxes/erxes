import { Model, model } from 'mongoose';
import { ActivityLogs } from '.';
import { emailDeliverySchema, IEmailDeliveries, IEmailDeliveriesDocument } from './definitions/emailDeliveries';

export interface IEmailDeliveryModel extends Model<IEmailDeliveriesDocument> {
  createEmailDelivery(doc: IEmailDeliveries): Promise<IEmailDeliveriesDocument>;
}

export const loadClass = () => {
  class EmailDelivery {
    /**
     * Create an EmailDelivery document
     */
    public static async createEmailDelivery(doc: IEmailDeliveries) {
      const emailDelivery = await EmailDeliveries.create(doc);

      // create log
      await ActivityLogs.createEmailDeliveryLog(emailDelivery);

      return emailDelivery;
    }
  }

  emailDeliverySchema.loadClass(EmailDelivery);

  return emailDeliverySchema;
};

loadClass();

// tslint:disable-next-line
const EmailDeliveries = model<IEmailDeliveriesDocument, IEmailDeliveryModel>('email_deliveries', emailDeliverySchema);

export default EmailDeliveries;
