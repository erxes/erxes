import { IUser } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { CAMPAIGN_STATUS } from './definitions/constants';
import {
  couponCampaignSchema,
  ICouponCampaign,
  ICouponCampaignDocument,
} from './definitions/couponCampaigns';

export interface ICouponCampaignModel extends Model<ICouponCampaignDocument> {
  getCouponCampaign(_id: string): Promise<ICouponCampaignDocument>;
  createCouponCampaign(
    doc: ICouponCampaign,
    user: IUser,
  ): Promise<ICouponCampaignDocument>;
  updateCouponCampaign(
    _id: string,
    doc: ICouponCampaign,
    user: IUser,
  ): Promise<ICouponCampaignDocument>;
  removeCouponCampaigns(_ids: string[]): void;
}

export const loadCouponCampaignClass = (
  models: IModels,
  _subdomain: string,
) => {
  class CouponCampaign {
    public static async getCouponCampaign(_id: string) {
      const couponCampaign = await models.CouponCampaigns.findOne({
        _id,
      }).lean();

      if (!couponCampaign) {
        throw new Error('Campaign not found');
      }

      return couponCampaign;
    }

    public static async createCouponCampaign(doc, user) {
      doc = {
        ...doc,
        createdBy: user?._id,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };

      return models.CouponCampaigns.create(doc);
    }

    public static async updateCouponCampaign(_id, doc, user) {
      doc = {
        ...doc,
        modifiedBy: user?._id,
        modifiedAt: new Date(),
      };

      return models.CouponCampaigns.updateOne({ _id }, { $set: doc });
    }

    public static async removeCouponCampaigns(_ids: string[]) {
      const campaignIds = await models.Coupons.find({
        campaignId: { $in: _ids },
      }).distinct('campaignId');

      const usedCampaignIds = _ids.filter((id) => campaignIds.includes(id));

      const deleteCampaignIds = _ids.filter(
        (id) => !usedCampaignIds.includes(id),
      );

      const now = new Date();

      await models.CouponCampaigns.updateMany(
        { _id: { $in: usedCampaignIds } },
        { $set: { status: CAMPAIGN_STATUS.TRASH, modifiedAt: now } },
      );

      return models.CouponCampaigns.deleteMany({
        _id: { $in: deleteCampaignIds },
      });
    }
  }

  couponCampaignSchema.loadClass(CouponCampaign);

  return couponCampaignSchema;
};
