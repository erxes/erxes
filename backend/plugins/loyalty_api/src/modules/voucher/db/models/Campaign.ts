import {
  IVoucherCampaign,
  IVoucherCampaignDocument,
} from '@/voucher/@types/campaign';
import { campaignSchema } from '@/voucher/db/definitions/campaign';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IVoucherCampaignModel extends Model<IVoucherCampaignDocument> {
  getCampaign(_id: string): Promise<IVoucherCampaignDocument>;
  getCampaigns(): Promise<IVoucherCampaignDocument[]>;
  createCampaign(
    doc: IVoucherCampaign,
    user: IUserDocument,
  ): Promise<IVoucherCampaignDocument>;
  updateCampaign(
    _id: string,
    doc: IVoucherCampaign,
    user: IUserDocument,
  ): Promise<IVoucherCampaignDocument>;
  removeCampaign(campaignId: string): Promise<{ ok: number }>;
}

export const loadCampaignClass = (models: IModels) => {
  class Campaign {
    public static async getCampaign(_id: string) {
      const campaign = await models.VoucherCampaign.findOne({ _id }).lean();

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      return campaign;
    }

    public static async getCampaigns() {
      return models.VoucherCampaign.find().lean();
    }

    public static async createCampaign(
      doc: IVoucherCampaign,
      user: IUserDocument,
    ) {
      await this.validateCampaign(doc);

      return models.VoucherCampaign.create({ ...doc, createdBy: user._id });
    }

    public static async updateCampaign(
      _id: string,
      doc: IVoucherCampaign,
      user: IUserDocument,
    ) {
      await this.validateCampaign(doc);

      return await models.VoucherCampaign.findOneAndUpdate(
        { _id },
        { $set: { ...doc, updatedBy: user._id } },
        { new: true },
      );
    }

    public static async removeCampaign(campaignId: string) {
      const campaign = await models.VoucherCampaign.getCampaign(campaignId);

      return models.VoucherCampaign.findOneAndDelete({ _id: campaign._id });
    }

    public static async validateCampaign(doc: IVoucherCampaign) {
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
