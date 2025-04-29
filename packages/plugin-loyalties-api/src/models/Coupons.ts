import { Model } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { IModels } from '../connectionResolver';
import { CHAR_SET, CODE_STATUS } from './definitions/constants';
import {
  couponSchema,
  ICouponDocument,
  ICouponInput,
} from './definitions/coupons';

export interface ICouponModel extends Model<ICouponDocument> {
  createCoupon(doc: ICouponInput): Promise<ICouponDocument>;
  updateCoupon(_id: string, doc: ICouponInput): Promise<ICouponDocument>;
  removeCoupons(_ids: string[]): void;
  checkCoupon({
    code,
    ownerId,
    totaAmount,
  }: {
    code: string;
    ownerId?: string;
    totaAmount?: number;
  }): Promise<string>;
  redeemCoupon({
    code,
    usageInfo,
  }: {
    code: string;
    usageInfo?: any;
  }): Promise<ICouponDocument>;
}

export const loadCouponClass = (models: IModels, _subdomain: string) => {
  class Coupon {
    public static async checkCoupon({
      code,
      ownerId,
      totaAmount,
    }: {
      code: string;
      ownerId?: string;
      totaAmount?: number;
    }) {
      const coupon = await models.Coupons.findOne({ code });

      if (!coupon) {
        throw new Error('Invalid coupon code');
      }

      if (!coupon.campaignId) {
        throw new Error('Coupon code is not associated with any campaign');
      }

      if (coupon.usageCount >= coupon.usageLimit) {
        throw new Error('Coupon code usage limit reached');
      }

      if (coupon.status === 'done') {
        throw new Error('Coupon code has already been used and is expired');
      }

      if (ownerId && coupon.redemptionLimitPerUser) {
        const redeemedUser =
          coupon.usageLogs?.filter(
            (log) => log.ownerId === ownerId && coupon.code === code,
          ) || [];

        if (redeemedUser.length >= coupon.redemptionLimitPerUser) {
          throw new Error(
            'Coupon code has already been used and cannot be reused',
          );
        }
      }

      const couponCampaign = await models.CouponCampaigns.findOne({
        _id: coupon.campaignId,
      });

      if (!couponCampaign) {
        throw new Error('Campaign not found');
      }

      if (totaAmount && couponCampaign.restrictions.minimumSpend > totaAmount) {
        throw new Error(`This coupon requires a minimum spend of ${couponCampaign.restrictions.minimumSpend}`);
      }

      if (couponCampaign.status !== 'active') {
        throw new Error('Campaign is not active');
      }

      const currentDate = new Date();

      if (
        (couponCampaign.finishDateOfUse || couponCampaign.endDate) < currentDate
      ) {
        throw new Error(
          'The campaign has ended and the coupon code is expired',
        );
      }

      return couponCampaign._id;
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

      const codes = new Set<string>();

      if (staticCode) {
        const code = staticCode.trim().toUpperCase().replace(/\s+/g, '');

        codes.add(code);
      } else {
        let alphabet = '';

        for (const range of charSet) {
          alphabet += CHAR_SET[range];
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
    }

    public static async createCoupon(doc: ICouponInput) {
      const { campaignId, customConfig } = doc;

      if (!campaignId) {
        throw new Error('Campaign id is required');
      }

      const campaign = await models.CouponCampaigns.findOne({
        _id: campaignId,
      });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      const { codeRule } = campaign || {};

      const codes = await this.generateCodes(codeRule);

      const couponDocs: any = [];

      for (const [index, value] of codes.entries()) {
        const { usageLimit, redemptionLimitPerUser } =
          customConfig?.[index] || {};

        couponDocs.push({
          campaignId,
          code: value,
          usageLimit: usageLimit || campaign.codeRule.usageLimit,
          redemptionLimitPerUser:
            redemptionLimitPerUser || campaign.codeRule.redemptionLimitPerUser,
          codeType: codeRule.staticCode ? 'static' : 'generated',
        });
      }

      const coupons = await models.Coupons.insertMany(couponDocs);

      return coupons;
    }

    public static async updateCoupon(_id: string, doc: ICouponInput) {
      return models.Coupons.updateOne({ _id }, { $set: doc });
    }

    public static async removeCoupon(_id: string, doc: ICouponInput) {
      return models.Coupons.deleteOne({ _id });
    }

    public static async redeemCoupon({
      code,
      usageInfo,
    }: {
      code: string;
      usageInfo?: any;
    }) {
      const { ownerId } = usageInfo || {};

      const isValid = await this.checkCoupon({
        code,
        ownerId,
      });

      if (!isValid) {
        throw new Error('Invalid voucher code');
      }

      const coupon = await models.Coupons.findOne({ code });

      if (!coupon) {
        throw new Error('Voucher not found');
      }

      const usageCount = coupon.usageCount + 1;
      const status =
        usageCount >= coupon.usageLimit ? CODE_STATUS.DONE : CODE_STATUS.IN_USE;
      const usageLogs = [...coupon.usageLogs, usageInfo || {}];

      try {
        return await models.Coupons.updateOne(
          { code },
          {
            $set: {
              usageCount,
              status,
              usageLogs,
            },
          },
        );
      } catch (error) {
        throw new Error(`Error occurred while redeeming coupon code ${error}`);
      }
    }
  }

  couponSchema.loadClass(Coupon);

  return couponSchema;
};
