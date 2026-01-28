import { Model } from 'mongoose';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/modules/campaign/constants';
import {
  ICouponCampaign,
  ICouponCampaignDocument,
} from '@/coupon/@types/couponCampaign';
import { couponCampaignSchema } from '~/modules/coupon/db/definitions/couponCampaign';

export interface ICouponCampaignModel
  extends Model<ICouponCampaignDocument> {
  getCouponCampaign(_id: string): Promise<ICouponCampaignDocument>;

  createCouponCampaign(
    doc: ICouponCampaign,
    user: IUserDocument,
  ): Promise<ICouponCampaignDocument>;

  updateCouponCampaign(
    _id: string,
    doc: ICouponCampaign,
    user: IUserDocument,
  ): Promise<ICouponCampaignDocument>;

  removeCouponCampaigns(_ids: string[]): Promise<any>;
}

export const loadCouponCampaignClass = (models: IModels) => {
  class CouponCampaign {
    /* -------------------- CRUD -------------------- */

    public static async getCouponCampaign(_id: string) {
      const campaign = await models.CouponCampaign.findOne({ _id }).lean();

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      return campaign;
    }

    /* -------------------- validation -------------------- */

    private static validateCampaign(doc: ICouponCampaign) {
      const { codeRule } = doc || {};
      const { pattern, charSet } = codeRule || {};

      if (charSet) {
        if (!Array.isArray(charSet)) {
          throw new Error('charSet should be an array');
        }

        const allowedChars = charSet.join('');
        const charSetRegex = new RegExp(`^[${allowedChars}#-]*$`);

        if (pattern && !charSetRegex.test(pattern)) {
          throw new Error(
            `Invalid pattern '${pattern}'. It contains characters not in the charSet.`,
          );
        }
      }

      if (!charSet && pattern && !/^[#-]*$/.test(pattern)) {
        throw new Error(
          `Invalid pattern '${pattern}'. Only '#' and '-' characters are allowed.`,
        );
      }
    }

    /* -------------------- mutations -------------------- */

    public static async createCouponCampaign(
      doc: ICouponCampaign,
      user: IUserDocument,
    ) {
      this.validateCampaign(doc);

      return models.CouponCampaign.create({
        ...doc,
        createdBy: user._id,
      });
    }

    public static async updateCouponCampaign(
      _id: string,
      doc: ICouponCampaign,
      user: IUserDocument,
    ) {
      this.validateCampaign(doc);

      return models.CouponCampaign.findOneAndUpdate(
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

    public static async removeCouponCampaigns(_ids: string[]) {
      const usedCampaignIds = await models.Coupon.find({
        campaignId: { $in: _ids },
      }).distinct('campaignId');

      const deletableIds = _ids.filter(
        (id) => !usedCampaignIds.includes(id),
      );

      const now = new Date();

      await models.CouponCampaign.updateMany(
        { _id: { $in: usedCampaignIds } },
        {
          $set: {
            status: CAMPAIGN_STATUS,
            updatedAt: now,
          },
        },
      );

      return models.CouponCampaign.deleteMany({
        _id: { $in: deletableIds },
      });
    }
  }

  couponCampaignSchema.loadClass(CouponCampaign);
  return couponCampaignSchema;
};
