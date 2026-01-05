import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IDonate, IDonateDocument } from '../../@types/donate';
import { donateSchema } from '../definitions/donate';

export interface IDonateModel extends Model<IDonateDocument> {
  getDonate(_id: string): Promise<IDonateDocument>;
  createDonate(doc: IDonate, user: IUserDocument): Promise<IDonateDocument>;
  removeDonate(DonateId: string): Promise<{ ok: number }>;
}

export const loadDonateClass = (models: IModels) => {
  class Donate {
    public static async getDonate(_id: string) {
      const donate = await models.Donate.findOne({ _id });

      if (!donate) {
        throw new Error('not found donate rule');
      }

      return donate;
    }

    public static async createDonate(doc: IDonate, user: IUserDocument) {
      const { donateScore, ownerId, ownerType, campaignId } = doc;
      if (!donateScore) {
        throw new Error('Not create donate, score is NaN');
      }

      if (!ownerId || !ownerType) {
        throw new Error('Not create donate, owner is undefined');
      }

      const donateCampaign = await models.Campaign.getCampaign(campaignId);

      const now = new Date();

      if (donateCampaign.startDate > now || donateCampaign.endDate < now) {
        throw new Error('Not create donate, expired');
      }

      if ((donateCampaign.conditions?.maxScore || 0) < donateScore) {
        throw new Error('Your donation is in excess');
      }

      let voucher: any = {};
      let fitAward: any = {};

      if ((donateCampaign.conditions?.awards || []).length) {
        const awards = (donateCampaign.conditions?.awards || []).sort(
          (a, b) => a.minScore - b.minScore,
        );

        for (const award of awards) {
          if (donateScore >= award.minScore) {
            fitAward = award;
          }
        }

        if (fitAward.voucherCampaignId) {
          voucher = await models.Voucher.createVoucher(
            {
              campaignId: fitAward.voucherCampaignId,
              ownerType,
              ownerId,
            },
            user,
          );
        }
      }

      await models.Score.changeScore({
        ownerType,
        ownerId,
        change: -1 * donateScore,
        action: 'subtract',
        description: 'give donate',
        campaignId,
        contentId: campaignId,
        contentType: 'campaign',
        createdBy: user._id,
      });

      return await models.Donate.create({
        campaignId,
        ownerType,
        ownerId,
        createdAt: new Date(),
        donateScore,
        awardId: fitAward._id,
        voucherId: voucher._id,
      });
    }

    public static async removeDonates(_ids: string[]) {
      return models.Donate.deleteMany({ _id: { $in: _ids } });
    }
  }

  donateSchema.loadClass(Donate);

  return donateSchema;
};
