import { IAssignmentDocument } from '@/assignment/@types/assignment';
import {
  IAssignmentCampaign,
  IAssignmentCampaignDocument,
} from '@/assignment/@types/assignmentCampaign';
import { assignmentCampaignSchema } from '@/assignment/db/definitions/assignmentCampaign';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/constants';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

export interface IAssignmentCampaignModel extends Model<IAssignmentCampaignDocument> {
  getAssignmentCampaign(_id: string): Promise<IAssignmentCampaignDocument>;
  createAssignmentCampaign(
    doc: IAssignmentCampaign,
  ): Promise<IAssignmentCampaignDocument>;
  updateAssignmentCampaign(
    _id: string,
    doc: IAssignmentCampaign,
  ): Promise<IAssignmentCampaignDocument>;
  removeAssignmentCampaigns(_ids: string[]): void;
  awardAssignmentCampaign(
    _id: string,
    customerId: string,
  ): Promise<IAssignmentDocument>;
}

export const loadAssignmentCampaignClass = (
  models: IModels,
  dispatcher: EventDispatcherReturn,
) => {
  const { sendDbEventLog } = dispatcher;

  class AssignmentCampaign {
    public static async getAssignmentCampaign(_id: string) {
      const assignmentCampaign = await models.AssignmentCampaigns.findOne({
        _id,
      });

      if (!assignmentCampaign) {
        throw new Error('not found assignment campaign');
      }

      return assignmentCampaign;
    }

    public static async createAssignmentCampaign(doc: IAssignmentCampaign) {
      const modifier = {
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };

      const created = await models.AssignmentCampaigns.create(modifier);

      sendDbEventLog?.({
        action: 'create',
        docId: created._id,
        currentDocument: created.toObject(),
      });

      return created;
    }

    public static async updateAssignmentCampaign(
      _id: string,
      doc: IAssignmentCampaign,
    ) {
      const prevDoc = await models.AssignmentCampaigns.findOne({ _id }).lean();
      const modifier = {
        ...doc,
        modifiedAt: new Date(),
      };

      const result = await models.AssignmentCampaigns.updateOne({ _id }, { $set: modifier });

      sendDbEventLog?.({
        action: 'update',
        docId: _id,
        currentDocument: modifier,
        prevDocument: prevDoc,
      });

      return result;
    }

    public static async awardAssignmentCampaign(
      _id: string,
      customerId: string,
    ) {
      const assignmentCampaign = await models.AssignmentCampaigns.findOne({
        _id,
      });

      if (!assignmentCampaign) {
        throw new Error('Not found assignment campaign');
      }

      const voucher = await models.Vouchers.createVoucher({
        campaignId: assignmentCampaign.voucherCampaignId,
        ownerId: customerId,
        ownerType: 'customer',
        status: 'new',
      });

      return await models.Assignments.createAssignment({
        campaignId: assignmentCampaign._id,
        ownerType: 'customer',
        ownerId: customerId,
        status: 'new',
        voucherId: voucher._id,
        voucherCampaignId: assignmentCampaign.voucherCampaignId,
      });
    }

    public static async removeAssignmentCampaigns(ids: string[]) {
      const atAssignmentIds = await models.Assignments.find({
        campaignId: { $in: ids },
      }).distinct('campaignId');

      const campaignIds = [...atAssignmentIds];

      const usedCampaignIds = ids.filter((id) => campaignIds.includes(id));
      const deleteCampaignIds = ids.filter(
        (id) => !usedCampaignIds.includes(id),
      );
      const now = new Date();

      if (usedCampaignIds.length) {
        await models.AssignmentCampaigns.updateMany(
          { _id: { $in: usedCampaignIds } },
          { $set: { status: CAMPAIGN_STATUS.TRASH, modifiedAt: now } },
        );
        for (const id of usedCampaignIds) {
          sendDbEventLog?.({
            action: 'update',
            docId: id,
            currentDocument: { status: CAMPAIGN_STATUS.TRASH, modifiedAt: now },
          });
        }
      }

      if (deleteCampaignIds.length) {
        const result = await models.AssignmentCampaigns.deleteMany({
          _id: { $in: deleteCampaignIds },
        });
        for (const id of deleteCampaignIds) {
          sendDbEventLog?.({
            action: 'delete',
            docId: id,
          });
        }
        return result;
      }

      return { deletedCount: 0 };
    }
  }

  assignmentCampaignSchema.loadClass(AssignmentCampaign);

  return assignmentCampaignSchema;
};