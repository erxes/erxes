import * as _ from 'underscore';
import { CAMPAIGN_STATUS } from './definitions/constants';
import {
  donateCampaignSchema,
  IDonateCampaign,
  IDonateCampaignDocument
} from './definitions/donateCampaigns';
import { Model, model } from 'mongoose';
import { validCampaign } from './utils';
import { IModels } from '../connectionResolver';

export interface IDonateCampaignModel extends Model<IDonateCampaignDocument> {
  getDonateCampaign(_id: string): Promise<IDonateCampaignDocument>;
  createDonateCampaign(doc: IDonateCampaign): Promise<IDonateCampaignDocument>;
  updateDonateCampaign(
    _id: string,
    doc: IDonateCampaign
  ): Promise<IDonateCampaignDocument>;
  removeDonateCampaigns(_ids: string[]): void;
}

const getSortAwards = awards => {
  return awards.sort((a, b) => a.minScore - b.minScore);
};

export const loadDonateCampaignClass = (
  models: IModels,
  _subdomain: string
) => {
  class DonateCampaign {
    public static async getDonateCampaign(_id: string) {
      const donateCampaign = await models.DonateCampaigns.findOne({ _id });

      if (!donateCampaign) {
        throw new Error('not found donate campaign');
      }

      return donateCampaign;
    }

    static async validDonateCampaign(doc: IDonateCampaign) {
      validCampaign(doc);

      const awards = doc.awards || [];
      if (
        doc.maxScore &&
        awards.length &&
        (awards[awards.length - 1].minScore || 0) > doc.maxScore
      ) {
        throw new Error('Max score must be greather than level scores');
      }

      const levels = awards.map(a => a.minScore);
      if (levels.length > [...new Set(levels)].length) {
        throw new Error('Levels scores must be unique');
      }
    }

    public static async createDonateCampaign(doc: IDonateCampaign) {
      const modifier = {
        ...doc,
        awards: getSortAwards(doc.awards),
        createdAt: new Date(),
        modifiedAt: new Date()
      };

      try {
        await this.validDonateCampaign(modifier);
      } catch (e) {
        throw new Error(e.message);
      }

      return models.DonateCampaigns.create(modifier);
    }

    public static async updateDonateCampaign(
      _id: string,
      doc: IDonateCampaign
    ) {
      const modifier = {
        ...doc,
        awards: getSortAwards(doc.awards),
        modifiedAt: new Date()
      };

      try {
        await this.validDonateCampaign(modifier);
      } catch (e) {
        throw new Error(e.message);
      }

      return models.DonateCampaigns.updateOne({ _id }, { $set: modifier });
    }

    public static async removeDonateCampaigns(ids: string[]) {
      const atDonateIds = await models.Donates.find({
        campaignId: { $in: ids }
      }).distinct('campaignId');

      const campaignIds = [...atDonateIds];

      const usedCampaignIds = ids.filter(id => campaignIds.includes(id));
      const deleteCampaignIds = ids.map(id => !usedCampaignIds.includes(id));
      const now = new Date();

      await models.DonateCampaigns.updateMany(
        { _id: { $in: usedCampaignIds } },
        { $set: { status: CAMPAIGN_STATUS.TRASH, modifiedAt: now } }
      );

      return models.DonateCampaigns.deleteMany({
        _id: { $in: deleteCampaignIds }
      });
    }
  }

  donateCampaignSchema.loadClass(DonateCampaign);

  return donateCampaignSchema;
};
