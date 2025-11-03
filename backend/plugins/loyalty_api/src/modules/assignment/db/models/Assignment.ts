import {
  IAssignment,
  IAssignmentDocument,
} from '@/assignment/@types/assignment';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { LOYALTY_STATUSES, OWNER_TYPES } from '~/constants';
import { assignmentSchema } from '../definitions/assignment';

export interface IAssignmentModel extends Model<IAssignmentDocument> {
  getAssignment(_id: string): Promise<IAssignmentDocument>;
  createAssignment(doc: IAssignment): Promise<IAssignmentDocument>;
  updateAssignment(_id: string, doc: IAssignment): Promise<IAssignmentDocument>;
  removeAssignment(_id: string): Promise<{ ok: number }>;

  awardAssignment(
    _id: string,
    customerId: string,
    user: IUserDocument,
  ): Promise<void>;
}

export const loadAssignmentClass = (models: IModels) => {
  class Assignment {
    public static async getAssignment(_id: string) {
      const assignment = await models.Assignment.findOne({ _id });

      if (!assignment) {
        throw new Error('not found assignment rule');
      }

      return assignment;
    }

    public static async createAssignment(doc: IAssignment) {
      return await models.Assignment.create(doc);
    }

    public static async updateAssignment(_id: string, doc: IAssignment) {
      return models.Assignment.findOneAndUpdate({ _id }, doc);
    }

    public static async removeAssignment(_id: string) {
      return models.Assignment.findOneAndDelete({ _id });
    }

    public static async awardAssignment(
      _id: string,
      customerId: string,
      user: IUserDocument,
    ) {
      const campaign = await models.Campaign.findOne({
        _id,
      });

      if (!campaign) {
        throw new Error('Not found campaign');
      }

      const voucher = await models.Voucher.createVoucher(
        {
          campaignId: campaign?.conditions?.voucherCampaignId,
          ownerId: customerId,
          ownerType: OWNER_TYPES.CUSTOMER,
          status: LOYALTY_STATUSES.NEW,
        },
        user,
      );

      return await models.Assignment.create({
        campaignId: campaign?._id,
        ownerType: OWNER_TYPES.CUSTOMER,
        ownerId: customerId,
        status: LOYALTY_STATUSES.NEW,
        voucherId: voucher._id,
        voucherCampaignId: campaign?.conditions?.voucherCampaignId,
      });
    }
  }

  assignmentSchema.loadClass(Assignment);

  return assignmentSchema;
};
