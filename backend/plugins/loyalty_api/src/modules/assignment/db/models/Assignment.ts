import {
  IAssignment,
  IAssignmentDocument,
} from '@/assignment/@types/assignment';
import { assignmentSchema } from '@/assignment/db/definitions/assignment';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IAssignmentModel extends Model<IAssignmentDocument> {
  getAssignment(_id: string): Promise<IAssignmentDocument>;
  createAssignment(doc: IAssignment, checkExpiry?: boolean): Promise<IAssignmentDocument>;
  removeAssignments(_ids: string[]): void;
}

export const loadAssignmentClass = (models: IModels) => {
  class Assignment {
    public static async getAssignment(_id: string) {
      const assignment = await models.Assignments.findOne({ _id });

      if (!assignment) {
        throw new Error('not found assignment rule');
      }

      return assignment;
    }

    public static async createAssignment(doc: IAssignment, checkExpiry = false) {
      const {
        campaignId,
        ownerId,
        ownerType,
        segmentIds,
        voucherCampaignId,
        voucherId,
        status,
      } = doc;

      const assignmentCampaign =
        await models.AssignmentCampaigns.getAssignmentCampaign(campaignId);

      if (checkExpiry) {
        const now = new Date();
        if (
          assignmentCampaign.startDate > now ||
          assignmentCampaign.endDate < now
        ) {
          throw new Error('Not create assignment, expired');
        }
      }

      return await models.Assignments.create({
        campaignId,
        createdAt: new Date(),
        ownerId,
        ownerType,
        segmentIds,
        voucherCampaignId,
        voucherId,
        status,
      });
    }

    public static async removeAssignments(_ids: string[]) {
      return models.Assignments.deleteMany({ _id: { $in: _ids } });
    }
  }

  assignmentSchema.loadClass(Assignment);

  return assignmentSchema;
};
