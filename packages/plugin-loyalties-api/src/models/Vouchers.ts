import { Model } from "mongoose";
import { IModels } from "../connectionResolver";
import { IBuyParams } from "./definitions/common";
import { VOUCHER_STATUS } from "./definitions/constants";
import {
  IVoucher,
  IVoucherDocument,
  voucherSchema,
} from "./definitions/vouchers";

export interface IVoucherModel extends Model<IVoucherDocument> {
  getVoucher(_id: string): Promise<IVoucherDocument>;
  createVoucher(doc: IVoucher): Promise<IVoucherDocument>;
  updateVoucher(_id: string, doc: IVoucher): Promise<IVoucherDocument>;
  buyVoucher(params: IBuyParams): Promise<IVoucherDocument>;
  removeVouchers(_ids: string[]): void;

  checkVoucher({
    voucherId,
    ownerType,
    ownerId,
  }: {
    voucherId: string;
    ownerType: string;
    ownerId: string;
  });
  redeemVoucher({
    voucherId,
    usageInfo,
  }: {
    voucherId: string;
    usageInfo?: any;
  });
}

export const loadVoucherClass = (models: IModels, subdomain: string) => {
  class Voucher {
    public static async getVoucher(_id: string) {
      const voucherRule = await models.Vouchers.findOne({ _id });

      if (!voucherRule) {
        throw new Error("not found voucher rule");
      }

      return voucherRule;
    }

    public static async createVoucher(doc: IVoucher) {
      const { campaignId, ownerType, ownerId, userId = "", config } = doc;

      if (!ownerId || !ownerType) {
        throw new Error("Not create voucher, owner is undefined");
      }

      const now = new Date();

      if (campaignId) {
        const voucherCampaign =
          await models.VoucherCampaigns.getVoucherCampaign(campaignId);

        if (voucherCampaign.startDate > now || voucherCampaign.endDate < now) {
          throw new Error("Not create voucher, expired");
        }

        switch (voucherCampaign.voucherType) {
          case "spin":
            return models.Spins.createSpin({
              campaignId: voucherCampaign.spinCampaignId,
              ownerType,
              ownerId,
              voucherCampaignId: campaignId,
              userId,
            });

          case "lottery":
            return models.Lotteries.createLottery({
              campaignId: voucherCampaign.lotteryCampaignId,
              ownerType,
              ownerId,
              voucherCampaignId: campaignId,
              userId,
            });

          case "score":
            return models.ScoreLogs.changeScore({
              ownerType,
              ownerId,
              changeScore: voucherCampaign.score,
              description: "score voucher",
            });
          default:
            break;
        }
      }

      return models.Vouchers.create({
        ownerType,
        ownerId,
        createdAt: now,
        status: VOUCHER_STATUS.NEW,
        userId,
        config,
      });
    }

    public static async updateVoucher(_id: string, doc: IVoucher) {
      const { ownerType, ownerId, status = "new", userId = "" } = doc;

      if (!ownerId || !ownerType) {
        throw new Error("Not create voucher, owner is undefined");
      }

      const voucher = await models.Vouchers.findOne({ _id }).lean();
      if (!voucher) {
        throw new Error(`Voucher ${_id} not found`);
      }
      const campaignId = voucher.campaignId;

      await models.VoucherCampaigns.getVoucherCampaign(campaignId);

      const now = new Date();

      return models.Vouchers.updateOne(
        { _id },
        {
          $set: {
            campaignId,
            ownerType,
            ownerId,
            modifiedAt: now,
            status,
            userId,
          },
        }
      );
    }

    public static async buyVoucher(doc: IBuyParams) {
      const { campaignId, ownerType, ownerId, count = 1 } = doc;
      if (!ownerId || !ownerType) {
        throw new Error("can not buy voucher, owner is undefined");
      }

      const voucherCampaign =
        await models.VoucherCampaigns.getVoucherCampaign(campaignId);

      if (!voucherCampaign.buyScore) {
        throw new Error("can not buy this voucher");
      }

      await models.ScoreLogs.changeScore({
        ownerType,
        ownerId,
        changeScore: -1 * voucherCampaign.buyScore * count,
        description: "buy voucher",
      });

      return models.Vouchers.createVoucher({ campaignId, ownerType, ownerId });
    }

    public static async removeVouchers(_ids: string[]) {
      return models.Vouchers.deleteMany({ _id: { $in: _ids } });
    }

    public static async checkVoucher({ ownerType, ownerId, voucherId }) {
      const voucher = await models.Vouchers.findOne({
        _id: voucherId,
        ownerId,
        ownerType,
        status: "new",
      });

      if (!voucher) {
        throw new Error("Voucher not found");
      }

      if (!voucher.campaignId) {
        throw new Error("Voucher is not associated with any campaign");
      }

      const voucherCampaign = await models.VoucherCampaigns.findOne({
        _id: voucher.campaignId,
      });

      if (!voucherCampaign) {
        throw new Error("Campaign not found");
      }

      if (voucherCampaign.status !== "active") {
        throw new Error("Campaign is not active");
      }

      const currentDate = new Date();

      if (voucher.config) {
      }

      if (
        (voucherCampaign.finishDateOfUse || voucherCampaign.endDate) <
        currentDate
      ) {
        throw new Error("The campaign has ended and the voucher is expired");
      }

      return voucherCampaign;
    }

    public static async redeemVoucher({ ownerType, usageInfo }) {
      const { ownerId, voucherId } = usageInfo || {};

      const isValid = await this.checkVoucher({
        ownerType,
        ownerId,
        voucherId,
      });

      if (!isValid) {
        throw new Error("Invalid voucher code");
      }

      try {
        return await models.Coupons.updateOne(
          { _id: voucherId },
          {
            $set: {
              status: VOUCHER_STATUS.LOSS,
            },
          }
        );
      } catch (error) {
        throw new Error(`Error occurred while redeeming voucher ${error}`);
      }
    }
  }

  voucherSchema.loadClass(Voucher);

  return voucherSchema;
};
