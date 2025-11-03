import { ISpin, ISpinDocument } from '@/spin/@types/spin';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { LOYALTY_STATUSES } from '~/constants';
import { randomBetween } from '~/utils';
import { spinSchema } from '../definitions/spin';

export interface ISpinModel extends Model<ISpinDocument> {
  getSpin(_id: string): Promise<ISpinDocument>;
  createSpin(doc: ISpin, user: IUserDocument): Promise<ISpinDocument>;
  updateSpin(
    _id: string,
    doc: ISpin,
    user: IUserDocument,
  ): Promise<ISpinDocument>;
  removeSpin(SpinId: string): Promise<{ ok: number }>;

  buySpin(
    params: {
      campaignId: string;
      ownerType: string;
      ownerId: string;
      count?: number;
    },
    user: IUserDocument,
  ): Promise<ISpinDocument>;
  doSpin(spinId: string, user: IUserDocument): Promise<ISpinDocument>;
}

export const loadSpinClass = (models: IModels) => {
  class Spin {
    public static async getSpin(_id: string) {
      const spin = await models.Spin.findOne({ _id }).lean();

      if (!spin) {
        throw new Error('not found spin rule');
      }

      return spin;
    }

    public static async createSpin(doc: ISpin, user: IUserDocument) {
      return models.Spin.create({
        ...doc,
        createdBy: user._id,
      });
    }

    public static async updateSpin(
      _id: string,
      doc: ISpin,
      user: IUserDocument,
    ) {
      const { ownerId, ownerType, status } = doc;
      if (!ownerId || !ownerType) {
        throw new Error('Not create spin, owner is undefined');
      }

      const spin = await models.Spin.findOne({ _id }).lean();
      if (!spin) {
        throw new Error(`Spin ${_id} not found`);
      }
      const campaignId = spin.campaignId;

      await models.Campaign.getCampaign(campaignId);

      const now = new Date();

      return await models.Spin.updateOne(
        { _id },
        {
          $set: {
            campaignId,
            ownerType,
            ownerId,
            modifiedAt: now,
            status: status || LOYALTY_STATUSES.NEW,
            updatedBy: user._id,
          },
        },
      );
    }

    public static async buySpin(
      params: {
        campaignId: string;
        ownerType: string;
        ownerId: string;
        count?: number;
      },
      user: IUserDocument,
    ) {
      const { campaignId, ownerType, ownerId, count = 1 } = params;

      if (!ownerId || !ownerType) {
        throw new Error('can not buy spin, owner is undefined');
      }

      const spinCampaign = await models.Campaign.getCampaign(campaignId);

      if (!spinCampaign.conditions?.buyScore) {
        throw new Error('can not buy this spin');
      }

      await models.Score.changeScore({
        ownerType,
        ownerId,
        change: -1 * spinCampaign.conditions?.buyScore * count,
        description: 'buy spin',
        campaignId,
        action: 'buy',
        contentId: campaignId,
        contentType: 'campaign',
        createdBy: user._id,
      });

      return models.Spin.createSpin({ campaignId, ownerType, ownerId }, user);
    }

    public static async removeSpins(_ids: string[]) {
      return models.Spin.deleteMany({ _id: { $in: _ids } });
    }

    public static async doSpin(spinId: string, user: IUserDocument) {
      const spin = await models.Spin.getSpin(spinId);
      const { ownerType, ownerId } = spin;
      const spinCampaign = await models.Campaign.getCampaign(spin.campaignId);

      const now = new Date();

      if (spinCampaign.startDate > now || spinCampaign.endDate < now) {
        throw new Error('This spin is expired');
      }

      const awards = spinCampaign.conditions?.awards || [];

      interface IInterval {
        awardId: string;
        min: number;
        max: number;
      }
      const intervals: IInterval[] = [];
      let intervalBegin = 0;

      for (const awrd of awards) {
        const min = intervalBegin;
        const max = intervalBegin + awrd.probability;
        intervals.push({
          awardId: awrd._id,
          min,
          max,
        });
        intervalBegin = intervalBegin + awrd.probability;
      }

      const random = randomBetween(0, 100);

      const interval = intervals.find((i) => i.min <= random && random < i.max);

      if (!interval) {
        await models.Spin.updateOne(
          { _id: spinId },
          { status: LOYALTY_STATUSES.LOSS, usedAt: new Date() },
        );
        return models.Spin.getSpin(spinId);
      }

      const award =
        awards.find((a) => a._id === interval.awardId) || ({} as any);
      const voucher = await models.Voucher.createVoucher(
        {
          campaignId: award.voucherCampaignId,
          ownerType,
          ownerId,
        },
        user,
      );
      await models.Spin.updateOne(
        { _id: spinId },
        {
          status: LOYALTY_STATUSES.WON,
          voucherCampaignId: award.voucherCampaignId,
          voucherId: voucher._id,
          awardId: award._id,
          usedAt: new Date(),
        },
      );

      return models.Spin.getSpin(spinId);
    }
  }

  spinSchema.loadClass(Spin);

  return spinSchema;
};
