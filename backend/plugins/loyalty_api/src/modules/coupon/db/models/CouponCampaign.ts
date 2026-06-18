import {
  ICouponCampaign,
  ICouponCampaignDocument,
} from '@/coupon/@types/couponCampaign';
import { couponCampaignSchema } from '@/coupon/db/definitions/couponCampaign';
import { IUser } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/constants';
import { validCampaign } from '~/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

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
  dispatcher: EventDispatcherReturn,
) => {
  const { sendDbEventLog } = dispatcher;

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

    static validateCampaign = (doc) => {
      const { codeRule } = doc || {};

      const { pattern, charSet } = codeRule || {};

      validCampaign(doc);

      if (charSet) {
        if (!Array.isArray(charSet)) {
          throw new TypeError(`charSet should be an array.`);
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
    };

    public static async createCouponCampaign(doc, user) {
      this.validateCampaign(doc);

      doc = {
        ...doc,
        createdBy: user?._id,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };

      const created = await models.CouponCampaigns.create(doc);

      sendDbEventLog?.({
        action: 'create',
        docId: created._id,
        currentDocument: created.toObject(),
      });

      return created;
    }

    public static async updateCouponCampaign(_id, doc, user) {
      const prevDoc = await models.CouponCampaigns.findOne({ _id }).lean();
      this.validateCampaign(doc);

      doc = {
        ...doc,
        modifiedBy: user?._id,
        modifiedAt: new Date(),
      };

      const updated = await models.CouponCampaigns.findOneAndUpdate(
        { _id },
        { $set: doc },
        { new: true },
      );

      sendDbEventLog?.({
        action: 'update',
        docId: _id,
        currentDocument: doc,
        prevDocument: prevDoc,
      });

      return updated;
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

      if (usedCampaignIds.length) {
        await models.CouponCampaigns.updateMany(
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
        const result = await models.CouponCampaigns.deleteMany({
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

  couponCampaignSchema.loadClass(CouponCampaign);

  return couponCampaignSchema;
};