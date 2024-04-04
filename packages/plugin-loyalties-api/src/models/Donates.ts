import * as _ from 'underscore';
import { donateSchema, IDonate, IDonateDocument } from './definitions/donates';
import { Model, model } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IDonateModel extends Model<IDonateDocument> {
  getDonate(_id: string): Promise<IDonateDocument>;
  createDonate(doc: IDonate): Promise<IDonateDocument>;
  removeDonates(_ids: string[]): void;
}

export const loadDonateClass = (models: IModels, subdomain: string) => {
  class Donate {
    public static async getDonate(_id: string) {
      const donate = await models.Donates.findOne({ _id });

      if (!donate) {
        throw new Error('not found donate rule');
      }

      return donate;
    }

    public static async createDonate(doc: IDonate) {
      const { donateScore, ownerId, ownerType, campaignId } = doc;
      if (!donateScore) {
        throw new Error('Not create donate, score is NaN');
      }

      if (!ownerId || !ownerType) {
        throw new Error('Not create donate, owner is undefined');
      }

      const donateCampaign = await models.DonateCampaigns.getDonateCampaign(
        campaignId
      );

      const now = new Date();

      if (donateCampaign.startDate > now || donateCampaign.endDate < now) {
        throw new Error('Not create donate, expired');
      }

      if ((donateCampaign.maxScore || 0) < donateScore) {
        throw new Error('Your donation is in excess');
      }

      let voucher: any = {};
      let fitAward: any = {};

      if ((donateCampaign.awards || []).length) {
        const awards = (donateCampaign.awards || []).sort(
          (a, b) => a.minScore - b.minScore
        );

        for (const award of awards) {
          if (donateScore >= award.minScore) {
            fitAward = award;
          }
        }

        if (fitAward.voucherCampaignId) {
          voucher = await models.Vouchers.createVoucher({
            campaignId: fitAward.voucherCampaignId,
            ownerType,
            ownerId
          });
        }
      }

      await models.ScoreLogs.changeScore({
        ownerType,
        ownerId,
        changeScore: -1 * donateScore,
        description: 'give donate'
      });

      return await models.Donates.create({
        campaignId,
        ownerType,
        ownerId,
        createdAt: new Date(),
        donateScore,
        awardId: fitAward._id,
        voucherId: voucher._id
      });
    }

    public static async removeDonates(_ids: string[]) {
      return models.Donates.deleteMany({ _id: { $in: _ids } });
    }
  }

  donateSchema.loadClass(Donate);

  return donateSchema;
};
