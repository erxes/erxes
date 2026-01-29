import { Model } from 'mongoose';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/modules/campaign/constants';
import {
  IDonateCampaign,
  IDonateCampaignDocument,
  IDonateAward,
} from '@/donate/@types/donateCampaign';
import { donateCampaignSchema } from '@/donate/db/definitions/donateCampaign';

export interface IDonateCampaignModel
  extends Model<IDonateCampaignDocument> {
  getDonateCampaign(_id: string): Promise<IDonateCampaignDocument>;

  createDonateCampaign(
    doc: IDonateCampaign,
    user: IUserDocument,
  ): Promise<IDonateCampaignDocument>;

  updateDonateCampaign(
    _id: string,
    doc: IDonateCampaign,
    user: IUserDocument,
  ): Promise<IDonateCampaignDocument>;

  removeDonateCampaigns(_ids: string[]): Promise<any>;
}

/* -------------------- helpers -------------------- */

const sortAwards = (awards: IDonateAward[] = []) =>
  [...awards].sort((a, b) => a.minScore - b.minScore);

/* -------------------- loader -------------------- */

export const loadDonateCampaignClass = (models: IModels) => {
  class DonateCampaign {
    /* ---------- queries ---------- */

    public static async getDonateCampaign(_id: string) {
      const campaign = await models.DonateCampaign.findOne({ _id }).lean();

      if (!campaign) {
        throw new Error('Donate campaign not found');
      }

      return campaign;
    }

    /* ---------- validation ---------- */

    private static validateCampaign(doc: IDonateCampaign) {
      const awards = sortAwards(doc.awards || []);

      if (
        typeof doc.maxScore === 'number' &&
        awards.length &&
        awards[awards.length - 1].minScore > doc.maxScore
      ) {
        throw new Error('Max score must be greater than award min scores');
      }

      const scores = awards.map((a) => a.minScore);
      if (scores.length !== new Set(scores).size) {
        throw new Error('Award minScore values must be unique');
      }
    }

    /* ---------- mutations ---------- */

    public static async createDonateCampaign(
      doc: IDonateCampaign,
      user: IUserDocument,
    ) {
      this.validateCampaign(doc);

      return models.DonateCampaign.create({
        ...doc,
        awards: sortAwards(doc.awards),
        createdBy: user._id,
        updatedBy: user._id,
      });
    }

    public static async updateDonateCampaign(
      _id: string,
      doc: IDonateCampaign,
      user: IUserDocument,
    ) {
      this.validateCampaign(doc);

      return models.DonateCampaign.findOneAndUpdate(
        { _id },
        {
          $set: {
            ...doc,
            awards: sortAwards(doc.awards),
            updatedBy: user._id,
          },
        },
        { new: true },
      );
    }

    public static async removeDonateCampaigns(_ids: string[]) {
      const usedIds = await models.Donate.find({
        campaignId: { $in: _ids },
      }).distinct('campaignId');

      const deletableIds = _ids.filter(
        (id) => !usedIds.includes(id),
      );

      await models.DonateCampaign.updateMany(
        { _id: { $in: usedIds } },
        {
          $set: {
            status: CAMPAIGN_STATUS,
            updatedAt: new Date(),
          },
        },
      );

      return models.DonateCampaign.deleteMany({
        _id: { $in: deletableIds },
      });
    }
  }

  donateCampaignSchema.loadClass(DonateCampaign);
  return donateCampaignSchema;
};
