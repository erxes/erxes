import * as _ from 'underscore';
import { CAMPAIGN_STATUS } from './definitions/constants';
import {
  spinCampaignSchema,
  ISpinCampaign,
  ISpinCampaignDocument
} from './definitions/spinCampaigns';
import { Model, model } from 'mongoose';
import { validCampaign } from './utils';
import { IModels } from '../connectionResolver';

export interface ISpinCampaignModel extends Model<ISpinCampaignDocument> {
  getSpinCampaign(_id: string): Promise<ISpinCampaignDocument>;
  createSpinCampaign(doc: ISpinCampaign): Promise<ISpinCampaignDocument>;
  updateSpinCampaign(
    _id: string,
    doc: ISpinCampaign
  ): Promise<ISpinCampaignDocument>;
  removeSpinCampaigns(_ids: string[]): void;
}

const getSortAwards = awards => {
  return awards.sort((a, b) => a.minScore - b.minScore);
};

export const loadSpinCampaignClass = (models: IModels, _subdomain: string) => {
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
        modifiedAt: new Date()
      };

      return models.SpinCampaigns.create(modifier);
    }

    public static async updateSpinCampaign(_id: string, doc: ISpinCampaign) {
      try {
        await this.validSpinCampaign(doc);
      } catch (e) {
        throw new Error(e.message);
      }

      const modifier = {
        ...doc,
        modifiedAt: new Date()
      };

      return models.SpinCampaigns.updateOne({ _id }, { $set: modifier });
    }

    public static async removeSpinCampaigns(ids: string[]) {
      const atSpinIds = await models.Spins.find({
        campaignId: { $in: ids }
      }).distinct('campaignId');

      const atVoucherIds = await models.VoucherCampaigns.find({
        spinCampaignId: { $in: ids }
      }).distinct('spinCampaignId');

      const campaignIds = [...atSpinIds, ...atVoucherIds];
      const usedCampaignIds = ids.filter(id => campaignIds.includes(id));

      const deleteCampaignIds = ids.map(id => !usedCampaignIds.includes(id));
      const now = new Date();

      await models.SpinCampaigns.updateMany(
        { _id: { $in: usedCampaignIds } },
        { $set: { status: CAMPAIGN_STATUS.TRASH, modifiedAt: now } }
      );

      return models.SpinCampaigns.deleteMany({
        _id: { $in: deleteCampaignIds }
      });
    }
  }

  spinCampaignSchema.loadClass(SpinCampaign);

  return spinCampaignSchema;
};
