import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ISpinCampaign,
  ISpinCampaignDocument,
} from '@/spin/@types/spinCampaign';
import { spinCampaignSchema } from '@/spin/db/definitions/spinCampaign';
import { CAMPAIGN_STATUS } from '~/constants';
import { validCampaign } from '~/utils/validCampaign';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

export interface ISpinCampaignModel extends Model<ISpinCampaignDocument> {
  getSpinCampaign(_id: string): Promise<ISpinCampaignDocument>;
  createSpinCampaign(doc: ISpinCampaign): Promise<ISpinCampaignDocument>;
  updateSpinCampaign(
    _id: string,
    doc: ISpinCampaign,
  ): Promise<ISpinCampaignDocument>;
  removeSpinCampaigns(_ids: string[]): void;
}

export const loadSpinCampaignClass = (
  models: IModels,
  dispatcher: EventDispatcherReturn,
) => {
  const { sendDbEventLog } = dispatcher;

  class SpinCampaign {
    public static async getSpinCampaign(_id: string) {
      const spinCampaign = await models.SpinCampaigns.findOne({ _id }).lean();

      if (!spinCampaign) {
        throw new Error('not found spin campaign');
      }

      return spinCampaign;
    }

    static async validSpinCampaign(doc) {
      validCampaign(doc);
      let sumProbability = 0;
      for (const award of doc.awards) {
        sumProbability += award.probability;
      }

      if (sumProbability < 0 || sumProbability > 100) {
        throw new Error('must sum probability has between 0 to 100');
      }
    }

    public static async createSpinCampaign(doc: ISpinCampaign) {
      try {
        await this.validSpinCampaign(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      const modifier = {
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      };

      const created = await models.SpinCampaigns.create(modifier);

      sendDbEventLog?.({
        action: 'create',
        docId: created._id,
        currentDocument: created.toObject(),
      });

      return created;
    }

    public static async updateSpinCampaign(_id: string, doc: ISpinCampaign) {
      try {
        await this.validSpinCampaign(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      const prevDoc = await models.SpinCampaigns.findOne({ _id }).lean();
      const modifier = {
        ...doc,
        modifiedAt: new Date(),
      };

      const result = await models.SpinCampaigns.updateOne({ _id }, { $set: modifier });

      sendDbEventLog?.({
        action: 'update',
        docId: _id,
        currentDocument: modifier,
        prevDocument: prevDoc,
      });

      return result;
    }

    public static async removeSpinCampaigns(ids: string[]) {
      const atSpinIds = await models.Spins.find({
        campaignId: { $in: ids },
      }).distinct('campaignId');

      const atVoucherIds = await models.VoucherCampaigns.find({
        spinCampaignId: { $in: ids },
      }).distinct('spinCampaignId');

      const campaignIds = [...atSpinIds, ...atVoucherIds];
      const usedCampaignIds = ids.filter((id) => campaignIds.includes(id));
      const deleteCampaignIds = ids.filter((id) => !usedCampaignIds.includes(id));
      const now = new Date();

      if (usedCampaignIds.length) {
        await models.SpinCampaigns.updateMany(
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
        const result = await models.SpinCampaigns.deleteMany({
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

  spinCampaignSchema.loadClass(SpinCampaign);
  return spinCampaignSchema;
};