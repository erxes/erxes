import { IAssignmentDocument } from '@/assignment/@types/assignment';
import {
  IAssignmentCampaign,
  IAssignmentCampaignDocument,
} from '@/assignment/@types/assignmentCampaign';
import { assignmentCampaignSchema } from '@/assignment/db/definitions/assignmentCampaign';
import { CAMPAIGN_STATUS } from '@/campaign/constants';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IAssignmentCampaignModel
  extends Model<IAssignmentCampaignDocument> {
  getAssignmentCampaign(_id: string): Promise<IAssignmentCampaignDocument>;

  createAssignmentCampaign(
    doc: IAssignmentCampaign,
    user: IUserDocument,
  ): Promise<IAssignmentCampaignDocument>;

  updateAssignmentCampaign(
    _id: string,
    doc: IAssignmentCampaign,
    user: IUserDocument,
  ): Promise<IAssignmentCampaignDocument>;

  removeAssignmentCampaigns(_ids: string[]): Promise<any>;

  awardAssignmentCampaign(
    _id: string,
    customerId: string,
    user: IUserDocument,
  ): Promise<IAssignmentDocument>;
}

export const loadAssignmentCampaignClass = (models: IModels) => {
  class AssignmentCampaign {
    /* ---------- queries ---------- */

    public static async getAssignmentCampaign(_id: string) {
      const campaign = await models.AssignmentCampaign.findOne({ _id }).lean();

      if (!campaign) {
        throw new Error('Assignment campaign not found');
      }

      return campaign;
    }

    /* ---------- mutations ---------- */

    public static async createAssignmentCampaign(
      doc: IAssignmentCampaign,
      user: IUserDocument,
    ) {
      return models.AssignmentCampaign.create({
        ...doc,
        createdBy: user._id,
        updatedBy: user._id,
      });
    }

    public static async updateAssignmentCampaign(
      _id: string,
      doc: IAssignmentCampaign,
      user: IUserDocument,
    ) {
      return models.AssignmentCampaign.findOneAndUpdate(
        { _id },
        {
          $set: {
            ...doc,
            updatedBy: user._id,
          },
        },
        { new: true },
      );
    }

    public static async awardAssignmentCampaign(
      _id: string,
      customerId: string,
      user: IUserDocument,
    ) {
      const campaign = await this.getAssignmentCampaign(_id);

      await models.Voucher.createVoucher(
        {
          campaignId: campaign.voucherCampaignId,
          ownerId: customerId,
          ownerType: 'customer',
        },
        user,
      );

      return models.Assignment.createAssignment({
        campaignId: campaign._id,
        ownerType: 'customer',
        ownerId: customerId,
        createdBy: user._id,
      });
    }

    public static async removeAssignmentCampaigns(_ids: string[]) {
      const usedIds = await models.Assignment.find({
        campaignId: { $in: _ids },
      }).distinct('campaignId');

      const deletableIds = _ids.filter(
        (id) => !usedIds.includes(id),
      );

      await models.AssignmentCampaign.updateMany(
        { _id: { $in: usedIds } },
        {
          $set: {
            status: CAMPAIGN_STATUS.INACTIVE,
            updatedAt: new Date(),
          },
        },
      );

      return models.AssignmentCampaign.deleteMany({
        _id: { $in: deletableIds },
      });
    }
  }

  assignmentCampaignSchema.loadClass(AssignmentCampaign);
  return assignmentCampaignSchema;
};
