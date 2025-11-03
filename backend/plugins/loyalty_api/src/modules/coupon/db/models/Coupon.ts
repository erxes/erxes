import { ICoupon, ICouponDocument } from '@/coupon/@types/coupon';
import { couponSchema } from '@/coupon/db/definitions/coupon';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { STATUSES } from '~/@types';
import { IModels } from '~/connectionResolvers';
import { LOYALTY_CHAR_SET, LOYALTY_STATUSES } from '~/constants';
import { CAMPAIGN_STATUS } from '~/modules/campaign/constants';

export interface ICouponModel extends Model<ICouponDocument> {
  getCoupon(code: string): Promise<ICouponDocument>;
  getCoupons(): Promise<ICouponDocument[]>;
  createCoupon(
    doc: ICoupon,
    user: IUserDocument,
  ): Promise<ICouponDocument | ICouponDocument[]>;
  updateCoupon(
    _id: string,
    doc: ICoupon,
    user: IUserDocument,
  ): Promise<ICouponDocument>;
  removeCoupon(_id: string): Promise<{ ok: number }>;
}

export const loadCouponClass = (models: IModels) => {
  class Coupon {
    public static async getCoupon(code: string) {
      const coupon = await models.Coupon.findOne({ code }).lean();

      if (!coupon) {
        throw new Error('coupon not found');
      }

      return coupon;
    }

    public static async getCoupons(): Promise<ICouponDocument[]> {
      return models.Coupon.find().lean();
    }

    public static async createCoupon(
      doc: ICoupon,
      user: IUserDocument,
    ): Promise<ICouponDocument | ICouponDocument[]> {
      const { campaignId, code } = doc;

      if (!campaignId) {
        throw new Error('Campaign id is required');
      }

      const campaign = await models.Campaign.getCampaign(campaignId);
      const coupon = await models.Coupon.getCoupon(code);

      if (coupon) {
        throw new Error('Coupon already exists');
      }

      const { conditions = {} } = campaign || {};

      if (code) {
        return models.Coupon.create({
          ...doc,
          createdBy: user._id,
        });
      }

      const codes = await this.generateCodes(conditions);

      const couponDocs: any = [];

      for (const code in codes) {
        const value = codes[code];

        couponDocs.push({
          ...doc,
          code: value,
          conditions: {
            usageCount: 0,
            usageLimit: 1,
            ...doc.conditions,
          },
          createdBy: user._id,
        });
      }

      const coupons = await models.Coupon.insertMany(couponDocs);

      return coupons as ICouponDocument[];
    }

    public static async updateCoupon(
      _id: string,
      doc: ICoupon,
      user: IUserDocument,
    ) {
      return await models.Coupon.findOneAndUpdate(
        { _id },
        { $set: { ...doc, updatedBy: user._id } },
        { new: true },
      );
    }

    public static async removeCoupon(_id: string) {
      return models.Coupon.findOneAndDelete({ _id });
    }

    public static async generateCodes(config) {
      const {
        codeLength = 6,
        staticCode,
        prefix = '',
        postfix = '',
        pattern = '',
        charSet = ['A-Z', '0-9'],
        size = 1,
      } = config;

      try {
        const codes = new Set<string>();

        if (staticCode) {
          const code = staticCode.trim().toUpperCase().replace(/\s+/g, '');

          codes.add(code);
        } else {
          let alphabet = '';

          for (const range of charSet) {
            alphabet += LOYALTY_CHAR_SET[range];
          }

          const actualCodeLength = pattern
            ? pattern.split('').filter((char) => char === '#').length
            : codeLength;

          const nanoid = customAlphabet(alphabet, actualCodeLength);

          while (codes.size < size) {
            let code = nanoid();

            if (pattern) {
              let formattedCode = '';
              let codeIndex = 0;

              for (const char of pattern) {
                if (char === '#') {
                  if (codeIndex < code.length) {
                    formattedCode += code[codeIndex];
                    codeIndex++;
                  }
                } else {
                  formattedCode += char;
                }
              }

              code = formattedCode;
            }

            if (prefix || postfix) {
              code = [prefix.toUpperCase(), code, postfix.toUpperCase()]
                .filter(Boolean)
                .join('');
            }

            codes.add(code);
          }
        }

        return Array.from(codes);
      } catch (error) {
        throw new Error(error.message);
      }
    }

    public static async checkCoupon(doc) {
      const { code, ownerId, ownerType } = doc || {};

      if (!ownerId || !ownerType) {
        throw new Error('Owner not defined');
      }

      const coupon = await models.Coupon.getCoupon(code);

      if (coupon.status !== (LOYALTY_STATUSES.NEW || LOYALTY_STATUSES.ACTIVE)) {
        throw new Error('Coupon is already redeemed');
      }

      if (!coupon.campaignId) {
        throw new Error('This voucher is not associated with a campaign.');
      }

      const campaign = await models.Campaign.getCampaign(coupon.campaignId);

      if (campaign.status === CAMPAIGN_STATUS.INACTIVE) {
        throw new Error('Campaign is not active');
      }

      if (campaign.status === CAMPAIGN_STATUS.EXPIRED) {
        throw new Error('Campaign is expired');
      }

      const NOW = new Date();

      if (NOW < campaign.startDate) {
        throw new Error('Campaign is not active yet');
      }

      if (NOW > campaign.endDate) {
        throw new Error('Campaign is expired');
      }

      return campaign;
    }

    public static async redeemCoupon({
      code,
      usageInfo,
    }: {
      code: string;
      usageInfo?: any;
    }) {
      const { ownerId, ownerType } = usageInfo || {};

      await this.checkCoupon({
        code,
        ownerId,
        ownerType,
      });

      const coupon = await models.Coupon.getCoupon(code);

      if (!coupon) {
        throw new Error('Voucher not found');
      }

      const { conditions, status } = coupon || {};

      const doc: { status: STATUSES; conditions: any } = {
        status,
        conditions: { ...conditions },
      };

      if (conditions) {
        const { usageCount = 0, usageLimit = 1 } = conditions || {};

        doc.conditions.usageCount = usageCount + 1;

        const remainingUsage = usageLimit - doc.conditions.usageCount > 0;

        doc.status = remainingUsage
          ? LOYALTY_STATUSES.ACTIVE
          : LOYALTY_STATUSES.REDEEMED;
      }

      try {
        return await models.Coupon.findOneAndUpdate(
          { code },
          { $set: doc },
          { new: true },
        );
      } catch (error) {
        throw new Error(`Error occurred while redeeming coupon code ${error}`);
      }
    }
  }

  couponSchema.loadClass(Coupon);

  return couponSchema;
};
