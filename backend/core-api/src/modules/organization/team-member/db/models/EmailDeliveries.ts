import {
  IEmailDeliveries,
  IEmailDeliveriesDocument,
} from '@/organization/types';
import { emailDeliverySchema } from 'erxes-api-shared/core-modules';
import { TEmailHandoffStatus } from 'erxes-api-shared/core-modules';
import { IDeliveryLogPatch } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IEmailDeliveryModel extends Model<IEmailDeliveriesDocument> {
  createEmailDelivery(doc: IEmailDeliveries): Promise<IEmailDeliveriesDocument>;
  updateEmailDeliveryStatus(
    _id: string,
    status: TEmailHandoffStatus,
  ): Promise<void>;
  recordHandoff(_id: string, patch: IDeliveryLogPatch): Promise<void>;
}

export const loadEmailDeliveryClass = (models: IModels) => {
  class EmailDelivery {
    /**
     * Create an EmailDelivery document.
     *
     * Stamping each recipient's own history happens here rather than at the
     * call sites because every send arrives through this method — core's send
     * path directly, the automations service over tRPC — and a second place to
     * remember is a place that eventually gets forgotten.
     */
    public static async createEmailDelivery(doc: IEmailDeliveries) {
      const delivery = await models.EmailDeliveries.create({
        ...doc,
      });

      await models.EmailAddresses.recordSent([
        ...(doc.toEmails || []),
        ...(doc.ccEmails || []),
      ]);

      return delivery;
    }

    public static async updateEmailDeliveryStatus(
      _id: string,
      status: TEmailHandoffStatus,
    ) {
      return models.EmailDeliveries.updateOne(
        { _id },
        { $set: { status, updatedAt: new Date() } },
      );
    }

    /**
     * Writes back what the provider said when the message was handed over.
     * Delivery events that arrive later come in through the provider webhook,
     * not here.
     */
    public static async recordHandoff(_id: string, patch: IDeliveryLogPatch) {
      return models.EmailDeliveries.updateOne(
        { _id },
        { $set: { ...patch, updatedAt: new Date() } },
      );
    }
  }

  emailDeliverySchema.loadClass(EmailDelivery);

  return emailDeliverySchema;
};
