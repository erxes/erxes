import * as _ from 'underscore';
import { CAMPAIGN_STATUS } from './definitions/constants';
import { Model, model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  assignmentCampaignSchema,
  IAssignmentCampaign,
  IAssignmentCampaignDocument
} from './definitions/assignmentCampaigns';

export interface IAssignmentCampaignModel
  extends Model<IAssignmentCampaignDocument> {
  getAssignmentCampaign(_id: string): Promise<IAssignmentCampaignDocument>;
  createAssignmentCampaign(
    doc: IAssignmentCampaign
  ): Promise<IAssignmentCampaignDocument>;
  updateAssignmentCampaign(
    _id: string,
    doc: IAssignmentCampaign
  ): Promise<IAssignmentCampaignDocument>;
  removeAssignmentCampaigns(_ids: string[]): void;
}

export const loadAssignmentCampaignClass = (
  models: IModels,
  _subdomain: string
) => {
  class AssignmentCampaign {
    public static async getAssignmentCampaign(_id: string) {
      const assignmentCampaign = await models.AssignmentCampaigns.findOne({
        _id
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
        modifiedAt: new Date()
      };

      return models.AssignmentCampaigns.create(modifier);
    }

    public static async updateAssignmentCampaign(
      _id: string,
      doc: IAssignmentCampaign
    ) {
      const modifier = {
        ...doc,
        modifiedAt: new Date()
      };

      return models.AssignmentCampaigns.updateOne({ _id }, { $set: modifier });
    }

    public static async removeAssignmentCampaigns(ids: string[]) {
      const atAssignmentIds = await models.Assignments.find({
        campaignId: { $in: ids }
      }).distinct('campaignId');

      const campaignIds = [...atAssignmentIds];

      const usedCampaignIds = ids.filter(id => campaignIds.includes(id));
      const deleteCampaignIds = ids.map(id => !usedCampaignIds.includes(id));
      const now = new Date();

      await models.AssignmentCampaigns.updateMany(
        { _id: { $in: usedCampaignIds } },
        { $set: { status: CAMPAIGN_STATUS.TRASH, modifiedAt: now } }
      );

      return models.AssignmentCampaigns.deleteMany({
        _id: { $in: deleteCampaignIds }
      });
    }
  }

  assignmentCampaignSchema.loadClass(AssignmentCampaign);

  return assignmentCampaignSchema;
};
