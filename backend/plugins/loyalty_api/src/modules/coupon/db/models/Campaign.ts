import {
  ICouponCampaign,
  ICouponCampaignDocument,
} from '@/coupon/@types/campaign';
import { campaignSchema } from '@/coupon/db/definitions/campaign';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface ICouponCampaignModel extends Model<ICouponCampaignDocument> {
  getCampaign(_id: string): Promise<ICouponCampaignDocument>;
  getCampaigns(): Promise<ICouponCampaignDocument[]>;
  createCampaign(
    doc: ICouponCampaign,
    user: IUserDocument,
  ): Promise<ICouponCampaignDocument>;
  updateCampaign(
    _id: string,
    doc: ICouponCampaign,
    user: IUserDocument,
  ): Promise<ICouponCampaignDocument>;
  removeCampaign(campaignId: string): Promise<{ ok: number }>;
}

export const loadCampaignClass = (models: IModels) => {
  class Campaign {
    public static async getCampaign(_id: string) {
      const campaign = await models.CouponCampaign.findOne({ _id }).lean();

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      return campaign;
    }

    public static async getCampaigns() {
      return models.CouponCampaign.find().lean();
    }

    public static async createCampaign(
      doc: ICouponCampaign,
      user: IUserDocument,
    ) {
      await this.validateCampaign(doc);

      return models.CouponCampaign.create({ ...doc, createdBy: user._id });
    }

    public static async updateCampaign(
      _id: string,
      doc: ICouponCampaign,
      user: IUserDocument,
    ) {
      await this.validateCampaign(doc);

      return await models.CouponCampaign.findOneAndUpdate(
        { _id },
        { $set: { ...doc, updatedBy: user._id } },
        { new: true },
      );
    }

    public static async removeCampaign(campaignId: string) {
      const campaign = await models.CouponCampaign.getCampaign(campaignId);

      return models.CouponCampaign.findOneAndDelete({ _id: campaign._id });
    }

    public static async validateCampaign(doc: ICouponCampaign) {
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
