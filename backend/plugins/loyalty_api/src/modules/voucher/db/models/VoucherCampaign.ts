import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/modules/campaign/constants';

import {
  IVoucherCampaign,
  IVoucherCampaignDocument,
} from '@/voucher/@types/voucherCampaign';

import { voucherCampaignSchema } from '../definitions/voucherCampaign';
import { validCampaign } from '~/utils/validCampaign';

/* -------------------- model interface -------------------- */

export interface IVoucherCampaignModel
  extends Model<IVoucherCampaignDocument> {
  getVoucherCampaign(_id: string): Promise<IVoucherCampaignDocument>;

  createVoucherCampaign(
    doc: IVoucherCampaign,
  ): Promise<IVoucherCampaignDocument>;

  updateVoucherCampaign(
    _id: string,
    doc: IVoucherCampaign,
  ): Promise<IVoucherCampaignDocument | null>;

  removeVoucherCampaigns(_ids: string[]): Promise<any>;
}

/* -------------------- validation -------------------- */

const validateVoucherCampaign = (doc: IVoucherCampaign) => {
  validCampaign(doc);

  if (doc.bonusProductId && !doc.bonusCount) {
    throw new Error('Bonus product requires bonus count');
  }

  if (doc.spinCampaignId && !doc.spinCount) {
    throw new Error('Spin campaign requires spin count');
  }

  if (doc.lotteryCampaignId && !doc.lotteryCount) {
    throw new Error('Lottery campaign requires lottery count');
  }
};

/* -------------------- model loader -------------------- */

export const loadVoucherCampaignClass = (models: IModels) => {
  class VoucherCampaign {
    /* ---------- queries ---------- */

    public static async getVoucherCampaign(_id: string) {
      const campaign = await models.VoucherCampaign.findOne({ _id }).lean();

      if (!campaign) {
        throw new Error('Voucher campaign not found');
      }

      return campaign;
    }

    /* ---------- mutations ---------- */

    public static async createVoucherCampaign(doc: IVoucherCampaign) {
      validateVoucherCampaign(doc);

      return models.VoucherCampaign.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });
    }

    public static async updateVoucherCampaign(
      _id: string,
      doc: IVoucherCampaign,
    ) {
      validateVoucherCampaign(doc);

      const existing = await this.getVoucherCampaign(_id);

      // Prevent changing voucherType if already used
      if (existing.voucherType !== doc.voucherType) {
        const usedCount = await models.Voucher.countDocuments({
          campaignId: _id,
        });

        if (usedCount > 0) {
          throw new Error(
            `Cannot change voucher type. Campaign already used (${existing.voucherType})`,
          );
        }
      }

      return models.VoucherCampaign.findOneAndUpdate(
        { _id },
        {
          $set: {
            ...doc,
            modifiedAt: new Date(),
          },
        },
        { new: true },
      );
    }

    public static async removeVoucherCampaigns(_ids: string[]) {
      /**
       * A voucher campaign is "used" if:
       *  - vouchers exist
       *  - referenced by donate / lottery / spin campaigns
       */

      const usedVoucherIds = await models.Voucher.distinct('campaignId', {
        campaignId: { $in: _ids },
      });

      const usedDonateIds = await models.DonateCampaign.distinct(
        'awards.voucherCampaignId',
        { 'awards.voucherCampaignId': { $in: _ids } },
      );

      const usedLotteryIds = await models.LotteryCampaign.distinct(
        'awards.voucherCampaignId',
        { 'awards.voucherCampaignId': { $in: _ids } },
      );

      const usedSpinIds = await models.SpinCampaign.distinct(
        'awards.voucherCampaignId',
        { 'awards.voucherCampaignId': { $in: _ids } },
      );

      const usedIds = Array.from(
        new Set([
          ...usedVoucherIds,
          ...usedDonateIds,
          ...usedLotteryIds,
          ...usedSpinIds,
        ]),
      );

      const deletableIds = _ids.filter((id) => !usedIds.includes(id));
      const now = new Date();

      // Soft-delete used campaigns
      if (usedIds.length) {
        await models.VoucherCampaign.updateMany(
          { _id: { $in: usedIds } },
          {
            $set: {
              status: CAMPAIGN_STATUS.INACTIVE,
              modifiedAt: now,
            },
          },
        );
      }

      // Hard-delete unused campaigns
      if (deletableIds.length) {
        return models.VoucherCampaign.deleteMany({
          _id: { $in: deletableIds },
        });
      }

      return { ok: 1 };
    }
  }

  voucherCampaignSchema.loadClass(VoucherCampaign);
  return voucherCampaignSchema;
};
