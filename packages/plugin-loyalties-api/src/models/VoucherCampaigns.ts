import * as _ from 'underscore';

import {
  IVoucherCampaign,
  IVoucherCampaignDocument,
  voucherCampaignSchema
} from './definitions/voucherCampaigns';
import { Model, model } from 'mongoose';

import { CAMPAIGN_STATUS } from './definitions/constants';
import { IModels } from '../connectionResolver';
import { validCampaign } from './utils';

export interface IVoucherCampaignModel extends Model<IVoucherCampaignDocument> {
  getVoucherCampaign(_id: string): Promise<IVoucherCampaignDocument>;
  createVoucherCampaign(
    doc: IVoucherCampaign
  ): Promise<IVoucherCampaignDocument>;
  updateVoucherCampaign(
    _id: string,
    doc: IVoucherCampaign
  ): Promise<IVoucherCampaignDocument>;
  removeVoucherCampaigns(_ids: string[]): void;
}

const validVoucherCampaign = doc => {
  validCampaign(doc);

  if (
    !doc.score &&
    !doc.productCategoryIds &&
    !doc.productIds &&
    !doc.bonusProductId &&
    !doc.spinCampaignId &&
    !doc.lotteryCampaignId &&
    !doc.coupon
  ) {
    throw new Error('Could not create null Voucher campaign');
  }

  if (doc.bonusProductId && !doc.bonusCount) {
    throw new Error('Must fill product count or product limit to false');
  }

  if (doc.spinCampaignId && !doc.spinCount) {
    throw new Error('Must fill spin count when choosed spin campaign');
  }

  if (doc.lotteryCampaignId && !doc.lotteryCount) {
    throw new Error('Must fill lottery count when choosed lottery campaign');
  }
};

export const loadVoucherCampaignClass = (
  models: IModels,
  _subdomain: string
) => {
  class VoucherCampaign {
    public static async getVoucherCampaign(_id: string) {
      const voucherCampaign = await models.VoucherCampaigns.findOne({
        _id
      }).lean();

      if (!voucherCampaign) {
        throw new Error('not found voucher rule');
      }

      return voucherCampaign;
    }

    public static async createVoucherCampaign(doc) {
      try {
        await validVoucherCampaign(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      doc = {
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date()
      };

      return models.VoucherCampaigns.create(doc);
    }

    public static async updateVoucherCampaign(_id, doc) {
      try {
        await validVoucherCampaign(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      const voucherCampaignDB = await models.VoucherCampaigns.getVoucherCampaign(
        _id
      );

      if (voucherCampaignDB.voucherType !== doc.voucherType) {
        let usedVoucherCount = 0;
        switch (voucherCampaignDB.voucherType) {
          case 'spin':
            usedVoucherCount = Number(
              models.Spins.find({
                campaignId: voucherCampaignDB.spinCampaignId
              }).countDocuments()
            );
            break;
          case 'lottery':
            usedVoucherCount = Number(
              models.Lotteries.find({
                campaignId: voucherCampaignDB.lotteryCampaignId
              }).countDocuments()
            );
            break;
          default:
            usedVoucherCount = Number(
              models.Vouchers.find({
                campaignId: voucherCampaignDB._id
              }).countDocuments()
            );
        }

        if (usedVoucherCount) {
          throw new Error(
            `Cant change voucher type because: this voucher Campaign in used. Set voucher type: ${voucherCampaignDB.voucherType}`
          );
        }
      }

      doc = {
        ...doc,
        modifiedAt: new Date()
      };

      return models.VoucherCampaigns.updateOne({ _id }, { $set: doc });
    }

    public static async removeVoucherCampaigns(ids: string[]) {
      const atVoucherIds = await models.Vouchers.find({
        voucherCampaignId: { $in: ids }
      }).distinct('voucherCampaignId');

      const atDonateCampaignIds = await models.DonateCampaigns.find({
        'awards.voucherCampaignId': { $in: ids }
      }).distinct('awards.voucherCampaignId');

      const atLotteryCampaignIds = await models.LotteryCampaigns.find({
        'awards.voucherCampaignId': { $in: ids }
      }).distinct('awards.voucherCampaignId');

      const atSpinCampaignIds = await models.SpinCampaigns.find({
        'awards.voucherCampaignId': { $in: ids }
      }).distinct('awards.voucherCampaignId');

      const campaignIds = [
        ...atVoucherIds,
        ...atDonateCampaignIds,
        ...atLotteryCampaignIds,
        ...atSpinCampaignIds
      ];
      const usedCampaignIds = ids.filter(id => campaignIds.includes(id));

      const deleteCampaignIds = ids.filter(id => !usedCampaignIds.includes(id));

      const now = new Date();

      await models.VoucherCampaigns.updateMany(
        { _id: { $in: usedCampaignIds } },
        { $set: { status: CAMPAIGN_STATUS.TRASH, modifiedAt: now } }
      );

      return models.VoucherCampaigns.deleteMany({
        _id: { $in: deleteCampaignIds }
      });
    }
  }

  voucherCampaignSchema.loadClass(VoucherCampaign);

  return voucherCampaignSchema;
};
