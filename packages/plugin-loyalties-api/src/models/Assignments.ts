import * as _ from 'underscore';
import {
  assignmentSchema,
  IAssignment,
  IAssignmentDocument
} from './definitions/assignments';
import { Model, model } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IAssignmentModel extends Model<IAssignmentDocument> {
  getAssignment(_id: string): Promise<IAssignmentDocument>;
  createAssignment(doc: IAssignment): Promise<IAssignmentDocument>;
  removeAssignments(_ids: string[]): void;
}

export const loadAssignmentClass = (models: IModels, subdomain: string) => {
  class Assignment {
    public static async getAssignment(_id: string) {
      const assignment = await models.Assignments.findOne({ _id });

      if (!assignment) {
        throw new Error('not found assignment rule');
      }

      return assignment;
    }

    public static async createAssignment(doc: IAssignment) {
      const {
        campaignId,
        ownerId,
        segmentIds,
        voucherCampaignId,
        voucherId,
        status
      } = doc;

      const assignmentCampaign = await models.AssignmentCampaigns.getAssignmentCampaign(
        campaignId
      );

      const now = new Date();

      if (
        assignmentCampaign.startDate > now ||
        assignmentCampaign.endDate < now
      ) {
        throw new Error('Not create assignment, expired');
      }

      return await models.Assignments.create({
        campaignId,
        createdAt: new Date(),
        ownerId,
        segmentIds,
        voucherCampaignId,
        voucherId,
        status
      });
    }

    public static async removeAssignments(_ids: string[]) {
      return models.Assignments.deleteMany({ _id: { $in: _ids } });
    }
  }

  assignmentSchema.loadClass(Assignment);

  return assignmentSchema;
};
