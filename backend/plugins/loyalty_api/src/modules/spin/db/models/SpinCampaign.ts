import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/modules/campaign/constants';

import {
  ISpinCampaign,
  ISpinCampaignDocument,
} from '@/spin/@types/spinCampaign';

import { spinCampaignSchema } from '../definitions/spinCampaign';
import { validCampaign } from '~/utils/validCampaign';

/* -------------------- model interface -------------------- */

export interface ISpinCampaignModel
  extends Model<ISpinCampaignDocument> {
  getSpinCampaign(_id: string): Promise<ISpinCampaignDocument>;

  createSpinCampaign(
    doc: ISpinCampaign,
  ): Promise<ISpinCampaignDocument>;

  updateSpinCampaign(
    _id: string,
    doc: ISpinCampaign,
  ): Promise<ISpinCampaignDocument | null>;

  removeSpinCampaigns(_ids: string[]): Promise<any>;
}

/* -------------------- model loader -------------------- */

export const loadSpinCampaignClass = (models: IModels) => {
  class SpinCampaign {
    /* ---------- queries ---------- */

    public static async getSpinCampaign(_id: string) {
      const campaign = await models.SpinCampaign.findOne({ _id }).lean();

      if (!campaign) {
        throw new Error('Spin campaign not found');
      }

      return campaign;
    }

    /* ---------- validation ---------- */

    private static validateSpinCampaign(doc: ISpinCampaign) {
      validCampaign(doc);

      const awards = doc.awards || [];
      const totalProbability = awards.reduce(
        (sum, award) => sum + Number(award.probability || 0),
        0,
      );

      if (totalProbability !== 100) {
        throw new Error('Awards probability must sum to exactly 100');
      }
    }

    /* ---------- mutations ---------- */

    public static async createSpinCampaign(doc: ISpinCampaign) {
      this.validateSpinCampaign(doc);

      return models.SpinCampaign.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });
    }

    public static async updateSpinCampaign(
      _id: string,
      doc: ISpinCampaign,
    ) {
      this.validateSpinCampaign(doc);

      return models.SpinCampaign.findOneAndUpdate(
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

    public static async removeSpinCampaigns(_ids: string[]) {
      /**
       * A spin campaign is considered "used" if:
       *  - there are Spins created from it
       */
      const usedCampaignIds = await models.Spin.distinct('campaignId', {
        campaignId: { $in: _ids },
      });

      const deletableIds = _ids.filter(
        (id) => !usedCampaignIds.includes(id),
      );

      const now = new Date();

      // Soft-delete used campaigns
      if (usedCampaignIds.length) {
        await models.SpinCampaign.updateMany(
          { _id: { $in: usedCampaignIds } },
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
        return models.SpinCampaign.deleteMany({
          _id: { $in: deletableIds },
        });
      }

      return { ok: 1 };
    }
  }

  spinCampaignSchema.loadClass(SpinCampaign);
  return spinCampaignSchema;
};
