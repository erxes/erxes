import { ICampaign, ICampaignDocument } from '@/campaign/@types';
import { campaignSchema } from '@/campaign/db/definitions/campaign';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface ICampaignModel extends Model<ICampaignDocument> {
  getCampaign(_id: string): Promise<ICampaignDocument>;
  getCampaigns(): Promise<ICampaignDocument[]>;
  createCampaign(
    doc: ICampaign,
    user: IUserDocument,
  ): Promise<ICampaignDocument>;
  updateCampaign(
    _id: string,
    doc: ICampaign,
    user: IUserDocument,
  ): Promise<ICampaignDocument>;
  removeCampaign(campaignId: string): Promise<{ ok: number }>;
}

export const loadCampaignClass = (models: IModels) => {
  class Campaign {
    public static async getCampaign(_id: string) {
      const campaign = await models.Campaign.findOne({ _id }).lean();

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      return campaign;
    }

    public static async getCampaigns() {
      return models.Campaign.find().lean();
    }

    public static async createCampaign(doc: ICampaign, user: IUserDocument) {
      await this.validateCampaign(doc);

      return models.Campaign.create({ ...doc, createdBy: user._id });
    }

    public static async updateCampaign(
      _id: string,
      doc: ICampaign,
      user: IUserDocument,
    ) {
      await this.validateCampaign(doc);

      return await models.Campaign.findOneAndUpdate(
        { _id },
        { $set: { ...doc, updatedBy: user._id } },
        { new: true },
      );
    }

    public static async removeCampaign(campaignId: string) {
      const campaign = await models.Campaign.getCampaign(campaignId);

      return models.Campaign.findOneAndDelete({ _id: campaign._id });
    }

    public static async validateCampaign(doc: ICampaign) {
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
