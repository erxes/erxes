import {
  IEmailDeliveries,
  IEmailDeliveriesDocument,
} from '@/organization/types';
import {
  emailDeliverySchema,
  TEmailHandoffStatus,
  TEmailLane,
} from 'erxes-api-shared/core-modules';
import { IDeliveryLogPatch } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IFailureRate {
  sent: number;
  failed: number;
  rate: number;
}

export interface IEmailDeliveryModel extends Model<IEmailDeliveriesDocument> {
  createEmailDelivery(doc: IEmailDeliveries): Promise<IEmailDeliveriesDocument>;
  updateEmailDeliveryStatus(
    _id: string,
    status: TEmailHandoffStatus,
  ): Promise<void>;
  recordHandoff(_id: string, patch: IDeliveryLogPatch): Promise<void>;
  measureFailureRate(since: Date, lane?: TEmailLane): Promise<IFailureRate>;
}

export const loadEmailDeliveryClass = (models: IModels) => {
  class EmailDelivery {
    public static async createEmailDelivery(doc: IEmailDeliveries) {
      const recipients = [...(doc.toEmails || []), ...(doc.ccEmails || [])];

      const lane = await models.EmailAddresses.messageLane(recipients);

      const delivery = await models.EmailDeliveries.create({ ...doc, lane });

      await models.EmailAddresses.recordSent(recipients);

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

    public static async recordHandoff(_id: string, patch: IDeliveryLogPatch) {
      return models.EmailDeliveries.updateOne(
        { _id },
        { $set: { ...patch, updatedAt: new Date() } },
      );
    }

    public static async measureFailureRate(since: Date, lane?: TEmailLane) {
      const [row] = await models.EmailDeliveries.aggregate([
        {
          $match: {
            createdAt: { $gte: since },
            status: 'sent',
            ...(lane ? { lane } : {}),
          },
        },
        {
          $group: {
            _id: null,
            sent: {
              $sum: {
                $add: [
                  { $size: { $ifNull: ['$toEmails', []] } },
                  { $size: { $ifNull: ['$ccEmails', []] } },
                ],
              },
            },
            failed: {
              $sum: {
                $add: [
                  { $size: { $ifNull: ['$bounced', []] } },
                  { $size: { $ifNull: ['$complained', []] } },
                ],
              },
            },
          },
        },
      ]);

      const sent = row?.sent || 0;
      const failed = row?.failed || 0;

      return { sent, failed, rate: sent ? (failed / sent) * 100 : 0 };
    }
  }

  emailDeliverySchema.loadClass(EmailDelivery);

  return emailDeliverySchema;
};
