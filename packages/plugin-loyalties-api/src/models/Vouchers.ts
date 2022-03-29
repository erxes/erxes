import * as _ from 'underscore';
import { changeScoreOwner } from './utils';
import { voucherSchema, IVoucher, IVoucherDocument } from './definitions/vouchers';
import { Model, model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IBuyParams } from './definitions/common';
import { VOUCHER_STATUS } from './definitions/constants';
import { checkVouchersSale, confirmVoucherSale } from '../utils';

export interface IVoucherModel extends Model<IVoucherDocument> {
  getVoucher(_id: string): Promise<IVoucherDocument>;
  createVoucher(doc: IVoucher): Promise<IVoucherDocument>;
  updateVoucher(_id: string, doc: IVoucher): Promise<IVoucherDocument>;
  buyVoucher(params: IBuyParams): Promise<IVoucherDocument>;
  removeVouchers(_ids: string[]): void;
  checkVouchersSale({ ownerType, ownerId, products }: { ownerType: string, ownerId: string, products: string }): Promise<any>
}

export const loadVoucherClass = (models: IModels, subdomain: string) => {
  class Voucher {
    public static async getVoucher(_id: string) {
      const voucherRule = await models.Vouchers.findOne({ _id });

      if (!voucherRule) {
        throw new Error('not found voucher rule')
      }

      return voucherRule;
    }

    public static async getVouchers({ ownerType, ownerId, statuses }: { ownerType: string, ownerId: string, statuses: string[] }) {
      return await models.Vouchers.find({ ownerType, ownerId, status: { $in: statuses || [] } }).lean()
    }

    public static async createVoucher(doc: IVoucher) {
      const { campaignId, ownerType, ownerId, userId = '' } = doc;
      if (!ownerId || !ownerType) {
        throw new Error('Not create voucher, owner is undefined');
      }

      const voucherCampaign = await models.VoucherCampaigns.getVoucherCampaign(campaignId);

      const now = new Date();

      if (voucherCampaign.startDate > now || voucherCampaign.endDate < now) {
        throw new Error('Not create spin, expired');
      }

      switch (voucherCampaign.voucherType) {
        case 'spin':
          return models.Spins.createSpin({ campaignId: voucherCampaign.spinCampaignId, ownerType, ownerId, voucherCampaignId: campaignId, userId });
        case 'lottery':
          return models.Lotteries.createLottery({ campaignId: voucherCampaign.lotteryCampaignId, ownerType, ownerId, voucherCampaignId: campaignId, userId });
        case 'score':
          return changeScoreOwner(subdomain, { ownerType, ownerId, changeScore: voucherCampaign.score });
        case 'discount':
        case 'bonus':
        case 'coupon':
        default:
          return models.Vouchers.create({ campaignId, ownerType, ownerId, createdAt: now, status: VOUCHER_STATUS.NEW, userId });
      }
    }

    public static async updateVoucher(_id: string, doc: IVoucher) {
      console.log(_id, doc)
      const { ownerType, ownerId, status = 'new', userId = '' } = doc;
      if (!ownerId || !ownerType) {
        throw new Error('Not create voucher, owner is undefined');
      }

      const voucher = await models.Vouchers.findOne({ _id }).lean();
      const campaignId = voucher.campaignId;

      await models.VoucherCampaigns.getVoucherCampaign(campaignId);

      const now = new Date();

      return models.Vouchers.updateOne({ _id }, { $set: { campaignId, ownerType, ownerId, modifiedAt: now, status, userId } });

    }

    public static async buyVoucher({ campaignId, ownerType, ownerId, count = 1 }) {
      if (!ownerId || !ownerType) {
        throw new Error('can not buy voucher, owner is undefined');
      }

      const voucherCampaign = await models.VoucherCampaigns.getVoucherCampaign(campaignId);

      if (!voucherCampaign.buyScore) {
        throw new Error('can not buy this voucher');
      }

      await changeScoreOwner(subdomain, { ownerType, ownerId, changeScore: -1 * voucherCampaign.buyScore * count });

      return models.Vouchers.createVoucher({ campaignId, ownerType, ownerId });
    }

    public static async removeVouchers(_ids: string[]) {
      return models.Vouchers.deleteMany({ _id: { $in: _ids } })
    }

    public static async checkVouchersSale({ ownerType, ownerId, products }) {
      return checkVouchersSale(models, ownerType, ownerId, products);
    }

    public static async confirmVoucherSale({ checkInfo }) {
      return confirmVoucherSale(models, checkInfo);
    }
  }

  voucherSchema.loadClass(Voucher);

  return voucherSchema;
};
