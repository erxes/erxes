import { IVoucher, IVoucherDocument } from '@/voucher/@types/voucher';
import { voucherSchema } from '@/voucher/db/definitions/voucher';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { OWNER_TYPES } from '~/@types';
import { IModels } from '~/connectionResolvers';
import { LOYALTY_STATUSES } from '~/constants';
import { CAMPAIGN_STATUS } from '~/modules/campaign/constants';
import { IVoucherCampaignDocument } from '~/modules/voucher/@types/campaign';

export interface IVoucherModel extends Model<IVoucherDocument> {
  getVoucher(_id: string): Promise<IVoucherDocument>;
  getVouchers(): Promise<IVoucherDocument[]>;
  createVoucher(doc: IVoucher, user: IUserDocument): Promise<IVoucherDocument>;
  updateVoucher(
    _id: string,
    doc: IVoucher,
    user: IUserDocument,
  ): Promise<IVoucherDocument>;
  removeVoucher(voucherId: string): Promise<{ ok: number }>;

  checkVoucher(doc: {
    voucherId: string;
    ownerId: string;
    ownerType: OWNER_TYPES;
  }): Promise<IVoucherCampaignDocument>;

  redeemVoucher(doc: {
    voucherId: string;
    ownerId: string;
    ownerType: OWNER_TYPES;
  }): Promise<{ ok: number }>;
}

export const loadVoucherClass = (models: IModels) => {
  class Voucher {
    public static async getVoucher(_id: string) {
      const voucher = await models.Voucher.findOne({ _id }).lean();

      if (!voucher) {
        throw new Error('Voucher not found');
      }

      return voucher;
    }

    public static async getVouchers() {
      return models.Voucher.find().lean();
    }

    public static async createVoucher(doc: IVoucher, user: IUserDocument) {
      await this.validateVoucher(doc);

      return models.Voucher.create({ ...doc, createdBy: user._id });
    }

    public static async updateVoucher(
      _id: string,
      doc: IVoucher,
      user: IUserDocument,
    ) {
      await this.validateVoucher(doc);

      return await models.Voucher.findOneAndUpdate(
        { _id },
        { $set: { ...doc, updatedBy: user._id } },
        { new: true },
      );
    }

    public static async removeVoucher(voucherId: string) {
      return models.Voucher.findOneAndDelete({ _id: voucherId });
    }

    public static async validateVoucher(doc: IVoucher) {
      const { campaignId, ownerId, ownerType, status } = doc;

      if (status && status === LOYALTY_STATUSES.REDEEMED) {
        throw new Error('Voucher is already redeemed');
      }

      if (!ownerId || !ownerType) {
        throw new Error('Owner not defined');
      }

      if (!campaignId) {
        throw new Error('This voucher is not associated with a campaign.');
      }

      const campaign = await models.VoucherCampaign.getCampaign(campaignId);

      if (campaign.status === CAMPAIGN_STATUS.INACTIVE) {
        throw new Error('Campaign is not active');
      }

      if (campaign.status === CAMPAIGN_STATUS.EXPIRED) {
        throw new Error('Campaign is expired');
      }

      return campaign;
    }

    public static async checkVoucher(doc: {
      voucherId: string;
      ownerId: string;
      ownerType: OWNER_TYPES;
    }) {
      const { voucherId, ownerId, ownerType } = doc;

      const voucher = await models.Voucher.getVoucher(voucherId);

      const campaign = await this.validateVoucher({
        ...voucher,
        ownerId,
        ownerType,
      });

      if (voucher.ownerId !== ownerId || voucher.ownerType !== ownerType) {
        throw new Error('You are not authorized to use this voucher.');
      }

      return campaign;
    }

    public static async redeemVoucher(doc: {
      voucherId: string;
      ownerId: string;
      ownerType: OWNER_TYPES;
    }) {
      const { voucherId, ownerId, ownerType } = doc;

      try {
        await models.Voucher.checkVoucher({
          voucherId,
          ownerId,
          ownerType,
        });

        return await models.Voucher.updateOne(
          { _id: voucherId },
          {
            $set: {
              status: LOYALTY_STATUSES.REDEEMED,
            },
          },
        );
      } catch (error) {
        throw new Error(`Error occurred while redeeming voucher ${error}`);
      }
    }
  }

  voucherSchema.loadClass(Voucher);

  return voucherSchema;
};
