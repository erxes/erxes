import { Model } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { IModels } from '../connectionResolver';
import { ICodeConfig } from './definitions/common';
import {
  IVoucherCodeDocument,
  voucherCodeSchema,
} from './definitions/voucherCodes';

export interface IVoucherCodeModel extends Model<IVoucherCodeDocument> {
  checkVoucherCode({
    code,
    ownerId,
  }: {
    code: string;
    ownerId: string;
  }): boolean;
  generateVoucherCodes(config: ICodeConfig): void;
}

export const loadVoucherCodeClass = (models: IModels, subdomain: string) => {
  class VoucherCode {
    public static async checkVoucherCode({
      code,
      ownerId,
    }: {
      code: string;
      ownerId: string;
    }) {
      const voucherCode = await models.VoucherCodes.findOne({ code });

      if (!voucherCode) {
        throw new Error('Invalid code');
      }

      if (!voucherCode.campaignId) {
        throw new Error('Voucher code is not associated with any campaign');
      }

      if (voucherCode.usageCount >= voucherCode.usageLimit) {
        throw new Error('Usage limit reached');
      }

      if (!voucherCode.allowRepeatRedemption) {
        const redeemedUser = voucherCode.usedBy?.find(
          (redeemed) =>
            redeemed.ownerId === ownerId && voucherCode.code === code,
        );

        if (redeemedUser) {
          throw new Error(
            'Voucher code has already been used by this user and cannot be reused',
          );
        }
      }

      if (voucherCode.status === 'done') {
        throw new Error('Voucher code has already been used and is expired');
      }

      const voucherCampaign = await models.VoucherCampaigns.findOne({
        _id: voucherCode.campaignId,
      });

      if (!voucherCampaign) {
        throw new Error('Campaign not found');
      }

      if (voucherCampaign.status !== 'active') {
        throw new Error('Campaign is not active');
      }

      const currentDate = new Date();

      if (
        (voucherCampaign.finishDateOfUse || voucherCampaign.endDate) <
        currentDate
      ) {
        throw new Error(
          'The campaign has ended and the voucher code is expired',
        );
      }

      return voucherCampaign._id;
    }

    public static async generateVoucherCodes(config: ICodeConfig) {
      const {
        campaignId,
        codeLength = 6,
        quantity = 1,
        usageLimit,
        staticCode,
        allowRepeatRedemption = false,
      } = config;

      const codes = new Set<string>();

      if (staticCode) {
        const code = staticCode.trim().toUpperCase().replace(/\s+/g, '');

        codes.add(code);
      } else {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const nanoid = customAlphabet(alphabet, codeLength);

        while (codes.size < quantity) {
          const code = nanoid();
          codes.add(code);
        }
      }

      const docs = Array.from(codes).map((code) => ({
        campaignId,
        code,
        usageLimit,
        allowRepeatRedemption,
      }));

      await models.VoucherCodes.insertMany(docs);
    }
  }

  voucherCodeSchema.loadClass(VoucherCode);

  return voucherCodeSchema;
};
