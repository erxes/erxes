import {
  IVoucherCampaign,
  IVoucherCampaignDocument,
} from '@/voucher/@types/voucherCampaign';
import { voucherCampaignSchema } from '@/voucher/db/definitions/voucherCampaign';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/constants';
import { validCampaign } from '~/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

export interface IVoucherCampaignModel extends Model<IVoucherCampaignDocument> {
  getVoucherCampaign(_id: string): Promise<IVoucherCampaignDocument>;
  createVoucherCampaign(
    doc: IVoucherCampaign,
  ): Promise<IVoucherCampaignDocument>;
  updateVoucherCampaign(
    _id: string,
    doc: IVoucherCampaign,
  ): Promise<IVoucherCampaignDocument>;
  removeVoucherCampaigns(_ids: string[]): void;
}

const validVoucherCampaign = async (doc) => {
  validCampaign(doc);

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
  dispatcher: EventDispatcherReturn,
) => {
  const { sendDbEventLog } = dispatcher;

  class VoucherCampaign {
    public static async getVoucherCampaign(_id: string) {
      const voucherCampaign = await models.VoucherCampaigns.findOne({
        _id,
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
        modifiedAt: new Date(),
      };

      const created = await models.VoucherCampaigns.create(doc);

      sendDbEventLog?.({
        action: 'create',
        docId: created._id,
        currentDocument: created.toObject(),
      });

      return created;
    }

    public static async updateVoucherCampaign(_id, doc) {
      try {
        await validVoucherCampaign(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      const voucherCampaignDB =
        await models.VoucherCampaigns.getVoucherCampaign(_id);

      if (voucherCampaignDB.voucherType !== doc.voucherType) {
        let usedVoucherCount = 0;
        switch (voucherCampaignDB.voucherType) {
          case 'spin':
            usedVoucherCount = Number(
              await models.Spins.find({
                campaignId: voucherCampaignDB.spinCampaignId,
              }).countDocuments(),
            );
            break;
          case 'lottery':
            usedVoucherCount = Number(
              await models.Lotteries.find({
                campaignId: voucherCampaignDB.lotteryCampaignId,
              }).countDocuments(),
            );
            break;
          default:
            usedVoucherCount = Number(
              await models.Vouchers.find({
                campaignId: voucherCampaignDB._id,
              }).countDocuments(),
            );
        }

        if (usedVoucherCount) {
          throw new Error(
            `Cant change voucher type because: this voucher Campaign in used. Set voucher type: ${voucherCampaignDB.voucherType}`,
          );
        }
      }

      const oldDoc = await models.VoucherCampaigns.findOne({ _id }).lean();
      doc = {
        ...doc,
        modifiedAt: new Date(),
      };

      const result = await models.VoucherCampaigns.updateOne({ _id }, { $set: doc });

      sendDbEventLog?.({
        action: 'update',
        docId: _id,
        currentDocument: doc,
        prevDocument: oldDoc,
      });

      return result;
    }

    public static async removeVoucherCampaigns(ids: string[]) {
      const atVoucherIds = await models.Vouchers.find({
        voucherCampaignId: { $in: ids },
      }).distinct('voucherCampaignId');

      const atDonateCampaignIds = await models.DonateCampaigns.find({
        'awards.voucherCampaignId': { $in: ids },
      }).distinct('awards.voucherCampaignId');

      const atLotteryCampaignIds = await models.LotteryCampaigns.find({
        'awards.voucherCampaignId': { $in: ids },
      }).distinct('awards.voucherCampaignId');

      const atSpinCampaignIds = await models.SpinCampaigns.find({
        'awards.voucherCampaignId': { $in: ids },
      }).distinct('awards.voucherCampaignId');

      const campaignIds = [
        ...atVoucherIds,
        ...atDonateCampaignIds,
        ...atLotteryCampaignIds,
        ...atSpinCampaignIds,
      ];
      const usedCampaignIds = ids.filter((id) => campaignIds.includes(id));
      const deleteCampaignIds = ids.filter(
        (id) => !usedCampaignIds.includes(id),
      );

      const now = new Date();

      // For used ones, soft delete (status = TRASH)
      if (usedCampaignIds.length) {
        await models.VoucherCampaigns.updateMany(
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

      // Hard delete unused ones
      if (deleteCampaignIds.length) {
        const result = await models.VoucherCampaigns.deleteMany({
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

  voucherCampaignSchema.loadClass(VoucherCampaign);

  return voucherCampaignSchema;
};