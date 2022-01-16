import { changeScoreOwner, commonSchema } from './CompaignUtils';
import { LOTTERY_STATUS } from './Constants';
import { getRandomNumber } from './utils';

export const lotterySchema = {
  ...commonSchema,

  status: { type: String, enum: LOTTERY_STATUS.ALL, default: 'new' },
  number: { type: String, optional: true, label: 'Lottery number' },

  voucherCompaignId: { type: String, label: 'Won Voucher Compaign', optional: true },
  voucherId: { type: String, label: 'Won Voucher', optional: true }
};

export class Lottery {
  public static async getLottery(models, _id: string) {
    const lottery = await models.Lotteries.findOne({ _id });

    if (!lottery) {
      throw new Error('not found lottery rule')
    }

    return lottery;
  }

  public static async getLotteries(models, { ownerType, ownerId, statuses }: { ownerType: string, ownerId: string, statuses: string[] }) {
    return await models.Lotteries.find({ ownerType, ownerId, status: { $in: statuses || [] } }).lean()
  }

  public static async createLottery(models, { compaignId, ownerType, ownerId }) {
    const lotteryCompaign = await models.LotteryCompaigns.getLotteryCompaign(models, compaignId);

    const now = new Date();

    if (lotteryCompaign.startDate > now || lotteryCompaign.endDate < now) {
      throw new Error('Not create lottery, expired');
    }

    const number = getRandomNumber(lotteryCompaign.numberFormat);
    return await models.Lotteries.create({ compaignId, ownerType, ownerId, createdAt: new Date(), number, status: LOTTERY_STATUS.NEW })
  }

  public static async buyLottery(models, { compaignId, ownerType, ownerId, count = 1 }) {
    const lotteryCompaign = await models.LotteryCompaigns.getLotteryCompaign(models, compaignId);

    if (!lotteryCompaign.buyScore) {
      throw new Error('can not buy this lottery')
    }
    await changeScoreOwner(models, { ownerType, ownerId, changeScore: -1 * lotteryCompaign.buyScore * count });

    return models.createLottery(models, {compaignId, ownerType, ownerId});
  }
}
