import * as _ from 'underscore';
import { changeScoreOwner, getRandomNumber } from './utils';
import { lotterySchema, ILottery, ILotteryDocument } from './definitions/lotteries';
import { Model, model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IBuyParams } from './definitions/common';
import { LOTTERY_STATUS } from './definitions/constants';


export interface ILotteryModel extends Model<ILotteryDocument> {
  getLottery(_id: string): Promise<ILotteryDocument>;
  createLottery(doc: ILottery): Promise<ILotteryDocument>;
  updateLottery(_id: string, doc: ILottery): Promise<ILotteryDocument>;
  buyLottery(params: IBuyParams): Promise<ILotteryDocument>;
  removeLotteries(_ids: string[]): void;
  checkLotteriesSale({ ownerType, ownerId, products }: { ownerType: string, ownerId: string, products: string }): Promise<any>
}

export const loadLotteryClass = (models: IModels, subdomain: string) => {
  class Lottery {
    public static async getLottery(_id: string) {
      const lottery = await models.Lotteries.findOne({ _id });

      if (!lottery) {
        throw new Error('not found lottery rule')
      }

      return lottery;
    }

    public static async getLotteries({ ownerType, ownerId, statuses }: { ownerType: string, ownerId: string, statuses: string[] }) {
      return models.Lotteries.find({ ownerType, ownerId, status: { $in: statuses || [] } }).lean();
    }

    public static async createLottery({ campaignId, ownerType, ownerId, voucherCampaignId = '', userId = '' }) {
      if (!ownerId || !ownerType) {
        throw new Error('Not create lottery, owner is undefined');
      }

      const lotteryCampaign = await models.LotteryCampaigns.getLotteryCampaign(campaignId);

      const now = new Date();

      if (lotteryCampaign.startDate > now || lotteryCampaign.endDate < now) {
        throw new Error('Not create lottery, expired');
      }

      const number = getRandomNumber(lotteryCampaign.numberFormat);
      return await models.Lotteries.create({ campaignId, ownerType, ownerId, createdAt: now, number, status: LOTTERY_STATUS.NEW, voucherCampaignId, userId })
    }


    public static async updateLottery(_id, { ownerType, ownerId, status, userId = '' }) {
      if (!ownerId || !ownerType) {
        throw new Error('Not create spin, owner is undefined');
      }

      const spin = await models.Lotteries.findOne({ _id }).lean();
      const campaignId = spin.campaignId;

      await models.LotteryCampaigns.getLotteryCampaign(campaignId);

      const now = new Date();

      return await models.Lotteries.updateOne({ _id, }, {
        $set: {
          campaignId, ownerType, ownerId, modifiedAt: now, status, userId
        }
      })
    }

    public static async buyLottery({ campaignId, ownerType, ownerId, count = 1 }) {
      if (!ownerId || !ownerType) {
        throw new Error('can not buy lottery, owner is undefined');
      }

      const lotteryCampaign = await models.LotteryCampaigns.getLotteryCampaign(campaignId);

      if (!lotteryCampaign.buyScore) {
        throw new Error('can not buy this lottery')
      }
      await changeScoreOwner(subdomain, { ownerType, ownerId, changeScore: -1 * lotteryCampaign.buyScore * count });

      return models.Lotteries.createLottery({ campaignId, ownerType, ownerId });
    }

    public static async removeLotteries(_ids: string[]) {
      return models.Lotteries.deleteMany({ _id: { $in: _ids } })
    }
  }

  lotterySchema.loadClass(Lottery);

  return lotterySchema;
};
