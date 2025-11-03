import {
  IScoreCampaign,
  IScoreCampaignDocument,
} from '@/score/@types/campaign';
import { campaignSchema } from '@/score/db/definitions/campaign';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IScoreCampaignModel extends Model<IScoreCampaignDocument> {
  getCampaign(_id: string): Promise<IScoreCampaignDocument>;
  getCampaigns(): Promise<IScoreCampaignDocument[]>;
  createCampaign(
    doc: IScoreCampaign,
    user: IUserDocument,
  ): Promise<IScoreCampaignDocument>;
  updateCampaign(
    _id: string,
    doc: IScoreCampaign,
    user: IUserDocument,
  ): Promise<IScoreCampaignDocument>;
  removeCampaign(campaignId: string): Promise<{ ok: number }>;
}

export const loadCampaignClass = (models: IModels) => {
  class Campaign {
    public static async getCampaign(_id: string) {
      const campaign = await models.ScoreCampaign.findOne({ _id }).lean();

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      return campaign;
    }

    public static async getCampaigns() {
      return models.ScoreCampaign.find().lean();
    }

    public static async createCampaign(
      doc: IScoreCampaign,
      user: IUserDocument,
    ) {
      await this.validateCampaign(doc);

      return models.ScoreCampaign.create({ ...doc, createdBy: user._id });
    }

    public static async updateCampaign(
      _id: string,
      doc: IScoreCampaign,
      user: IUserDocument,
    ) {
      await this.validateCampaign(doc);

      return await models.ScoreCampaign.findOneAndUpdate(
        { _id },
        { $set: { ...doc, updatedBy: user._id } },
        { new: true },
      );
    }

    public static async removeCampaign(campaignId: string) {
      const campaign = await models.ScoreCampaign.getCampaign(campaignId);

      return models.ScoreCampaign.findOneAndDelete({ _id: campaign._id });
    }

    public static async validateCampaign(doc: IScoreCampaign) {
      const { startDate, endDate } = doc;

      const NOW = new Date();

      if (!startDate || !endDate) {
        throw new Error('Start date and End date are required');
      }

      if (startDate > endDate) {
        throw new Error('Start date must be before End date');
      }

      if (startDate < NOW) {
        throw new Error('Start date must be after today');
      }

      if (endDate < NOW) {
        throw new Error('End date must be after today');
      }
    }
  }

  campaignSchema.loadClass(Campaign);

  return campaignSchema;
};
