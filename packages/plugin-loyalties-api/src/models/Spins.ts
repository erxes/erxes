import * as _ from 'underscore';
import { randomBetween } from './utils';
import { spinSchema, ISpin, ISpinDocument } from './definitions/spins';
import { Model, model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { SPIN_STATUS } from './definitions/constants';
import { IBuyParams } from './definitions/common';

export interface ISpinModel extends Model<ISpinDocument> {
  getSpin(_id: string): Promise<ISpinDocument>;
  createSpin(doc: ISpin): Promise<ISpinDocument>;
  updateSpin(_id: string, doc: ISpin): Promise<ISpinDocument>;
  removeSpins(_ids: string[]): void;
  buySpin(params: IBuyParams): Promise<ISpinDocument>;
  doSpin(spinId: string): Promise<ISpinDocument>;
}

export const loadSpinClass = (models: IModels, subdomain: string) => {
  class Spin {
    public static async getSpin(_id: string) {
      const spin = await models.Spins.findOne({ _id }).lean();

      if (!spin) {
        throw new Error('not found spin rule');
      }

      return spin;
    }

    public static async createSpin(doc: ISpin) {
      const {
        campaignId,
        ownerType,
        ownerId,
        voucherCampaignId = '',
        userId = ''
      } = doc;
      if (!ownerId || !ownerType) {
        throw new Error('Not create spin, owner is undefined');
      }

      const spinCampaign = await models.SpinCampaigns.getSpinCampaign(
        campaignId
      );

      const now = new Date();

      if (spinCampaign.startDate > now || spinCampaign.endDate < now) {
        throw new Error('Not create spin, expired');
      }

      return await models.Spins.create({
        campaignId,
        ownerType,
        ownerId,
        createdAt: new Date(),
        status: SPIN_STATUS.NEW,
        voucherCampaignId,
        userId
      });
    }

    public static async updateSpin(_id: string, doc: ISpin) {
      const { ownerId, ownerType, status, userId } = doc;
      if (!ownerId || !ownerType) {
        throw new Error('Not create spin, owner is undefined');
      }

      const spin = await models.Spins.findOne({ _id }).lean();
      const campaignId = spin.campaignId;

      await models.SpinCampaigns.getSpinCampaign(campaignId);

      const now = new Date();

      return await models.Spins.updateOne(
        { _id },
        {
          $set: {
            campaignId,
            ownerType,
            ownerId,
            modifiedAt: now,
            status: status || SPIN_STATUS.NEW,
            userId
          }
        }
      );
    }

    public static async buySpin(params: IBuyParams) {
      const { campaignId, ownerType, ownerId, count = 1 } = params;

      if (!ownerId || !ownerType) {
        throw new Error('can not buy spin, owner is undefined');
      }

      const spinCampaign = await models.SpinCampaigns.getSpinCampaign(
        campaignId
      );

      if (!spinCampaign.buyScore) {
        throw new Error('can not buy this spin');
      }

      await models.ScoreLogs.changeScore({
        ownerType,
        ownerId,
        changeScore: -1 * spinCampaign.buyScore * count,
        description: 'buy spin'
      });

      return models.Spins.createSpin({ campaignId, ownerType, ownerId });
    }

    public static async removeSpins(_ids: string[]) {
      return models.Spins.deleteMany({ _id: { $in: _ids } });
    }

    public static async doSpin(spinId: string) {
      const spin = await models.Spins.getSpin(spinId);
      const { ownerType, ownerId } = spin;
      const spinCampaign = await models.SpinCampaigns.getSpinCampaign(
        spin.campaignId
      );

      const now = new Date();

      if (spinCampaign.startDate > now || spinCampaign.endDate < now) {
        throw new Error('This spin is expired');
      }

      const awards = spinCampaign.awards || [];

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
          max
        });
        intervalBegin = intervalBegin + awrd.probability;
      }

      const random = randomBetween(0, 100);

      const interval = intervals.find(i => i.min <= random && random < i.max);

      if (!interval) {
        await models.Spins.updateOne(
          { _id: spinId },
          { status: SPIN_STATUS.LOSS, usedAt: new Date() }
        );
        return models.Spins.getSpin(spinId);
      }

      const award = awards.find(a => a._id === interval.awardId) || ({} as any);
      const voucher = await models.Vouchers.createVoucher({
        campaignId: award.voucherCampaignId,
        ownerType,
        ownerId
      });
      await models.Spins.updateOne(
        { _id: spinId },
        {
          status: SPIN_STATUS.WON,
          voucherId: voucher._id,
          awardId: award._id,
          usedAt: new Date()
        }
      );

      return models.Spins.getSpin(spinId);
    }
  }

  spinSchema.loadClass(Spin);

  return spinSchema;
};
