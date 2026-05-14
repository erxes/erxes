import { IDonate, IDonateDocument } from '@/donate/@types/donate';
import { donateSchema } from '@/donate/db/definitions/donate';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IDonateModel extends Model<IDonateDocument> {
  getDonate(_id: string): Promise<IDonateDocument>;
  createDonate(doc: IDonate, isAdmin?: boolean): Promise<IDonateDocument>;
  editDonate(_id: string, doc: Partial<IDonate>): Promise<IDonateDocument>;
  removeDonates(_ids: string[]): void;
}

const findFitAward = (donateScore: number, awards: any[]) => {
  const sorted = [...awards].sort((a, b) => a.minScore - b.minScore);
  let fitAward: any = {};
  for (const award of sorted) {
    if (donateScore >= award.minScore) {
      fitAward = award;
    }
  }
  return fitAward;
};

export const loadDonateClass = (models: IModels) => {
  class Donate {
    public static async getDonate(_id: string) {
      const donate = await models.Donates.findOne({ _id });

      if (!donate) {
        throw new Error('not found donate rule');
      }

      return donate;
    }

    public static async createDonate(doc: IDonate, isAdmin = false) {
      const {
        donateScore,
        ownerId,
        ownerType,
        campaignId,
        status,
        voucherCampaignId,
      } = doc;

      if (!ownerId || !ownerType) {
        throw new Error('Not create donate, owner is undefined');
      }

      if (!campaignId) {
        throw new Error('Not create donate, campaign is undefined');
      }

      // Admin path: skip campaign date/score validation, create record directly
      if (isAdmin) {
        return await models.Donates.create({
          campaignId,
          ownerType,
          ownerId,
          createdAt: new Date(),
          donateScore: donateScore || 0,
          status: status || 'new',
          voucherCampaignId,
        });
      }

      const donateCampaign =
        await models.DonateCampaigns.getDonateCampaign(campaignId);

      const now = new Date();

      if (donateCampaign.startDate > now || donateCampaign.endDate < now) {
        throw new Error('Not create donate, expired');
      }

      if (donateScore && (donateCampaign.maxScore || 0) < donateScore) {
        throw new Error('Your donation is in excess');
      }

      let voucher: any = {};
      let fitAward: any = {};

      if (donateScore && (donateCampaign.awards || []).length) {
        fitAward = findFitAward(donateScore, donateCampaign.awards || []);

        if (fitAward.voucherCampaignId) {
          voucher = await models.Vouchers.createVoucher({
            campaignId: fitAward.voucherCampaignId,
            ownerType,
            ownerId,
          });
        }
      }

      if (donateScore) {
        await models.ScoreLogs.changeScore({
          ownerType,
          ownerId,
          changeScore: -1 * donateScore,
          description: 'give donate',
        });
      }

      return await models.Donates.create({
        campaignId,
        ownerType,
        ownerId,
        createdAt: new Date(),
        donateScore: donateScore || 0,
        awardId: fitAward._id,
        voucherId: voucher._id,
        status: status || 'new',
        voucherCampaignId,
      });
    }

    public static async editDonate(_id: string, doc: Partial<IDonate>) {
      await models.Donates.updateOne({ _id }, { $set: doc });
      return models.Donates.findOne({ _id });
    }

    public static async removeDonates(_ids: string[]) {
      return models.Donates.deleteMany({ _id: { $in: _ids } });
    }
  }

  donateSchema.loadClass(Donate);

  return donateSchema;
};
