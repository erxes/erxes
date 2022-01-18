import { commonCompaignSchema, validCompaign } from "./CompaignUtils";
import { COMPAIGN_STATUS, LOTTERY_STATUS } from './Constants';
import { randomBetween, getRandomNumber } from './utils';

const lotteryAward = {
  _id: { type: String },
  voucherCompaignId: { type: String },
  count: { type: Number, min: 0 },
  wonLotteryIds: { type: [String], optional: true }
}

export const lotteryCompaignSchema = {
  ...commonCompaignSchema,
  lotteryDate: { type: Date, label: 'Lottery Date' },

  numberFormat: { type: String, label: 'Number format type' },
  buyScore: { type: Number },

  awards: { type: [lotteryAward] }
};

export class LotteryCompaign {
  public static async getLotteryCompaign(models, _id: string) {
    const lotteryCompaign = await models.LotteryCompaigns.findOne({ _id });

    if (!lotteryCompaign) {
      throw new Error('not found lottery compaign');
    }

    return lotteryCompaign;
  }

  public static async validLotteryCompaign(doc) {
    validCompaign(doc)
  }

  public static async createLotteryCompaign(models, doc) {
    try {
      await this.validLotteryCompaign(doc);
    } catch (e) {
      throw new Error(e.message);
    }

    doc = {
      ...doc,
      createdAt: new Date(),
      modifiedAt: new Date(),
    }

    return models.LotteryCompaigns.create(doc);
  }

  public static async updateLotteryCompaign(models, _id, doc) {
    try {
      await this.validLotteryCompaign(doc);
    } catch (e) {
      throw new Error(e.message);
    }

    doc = {
      ...doc,
      modifiedAt: new Date(),
    }

    return models.LotteryCompaigns.updateOne({ _id }, { $set: doc });
  }

  public static async removeLotteryCompaigns(models, ids: [String]) {
    const atLotteryIds = await models.Lotteries.find({
      compaignId: { $in: ids }
    }).distinct('compaignId');

    const atVoucherIds = await models.VoucherCompaigns.find({
      lotteryCompaignId: { $in: ids }
    }).distinct('lotteryCompaignId');

    const usedCompaignIds = [...atLotteryIds, ...atVoucherIds];
    const deleteCompaignIds = ids.map(id => !usedCompaignIds.includes(id));
    const now = new Date();

    await models.LotteryCompaigns.updateMany(
      { _id: { $in: usedCompaignIds } },
      { $set: { status: COMPAIGN_STATUS.TRASH, modifiedAt: now } }
    );

    return models.LotteryCompaigns.deleteMany({ _id: { $in: deleteCompaignIds } });
  }

  static async validDoLottery(models, compaignId, awardId) {
    const compaign = await models.getLotteryCompaign(models, compaignId);
    const award = compaign.awards.find(a => a.awardId === awardId)
    if (!award) {
      throw new Error('not found award');
    }

    if ((award.wonLotteryIds || []).length >= award.count) {
      throw new Error('this award is fully');
    }

    return { compaign, award }
  }

  static async setLuckyLottery(models, compaign, award, luckyLottery) {
    const awards = compaign.awards.map(a => (a._id === award._id ? { ...a, wonLotteryIds: [...a.wonLotteryIds, luckyLottery._id] } : a));

    await models.LotteryCompaigns.updateOne({ _id: compaign._id }, { $set: { awards } });

    const voucher = await models.Vouchers.createVoucher(models, { compaignId: award.voucherCompaignId, ownerType: luckyLottery.ownerType, ownerId: luckyLottery.ownerId })
    await models.Lotteries.updateOne({ _id: luckyLottery._id }, { $set: { usedAt: new Date(), status: LOTTERY_STATUS.WON, voucherId: voucher._id, awardId: award._id } });
  }

  public static async doLottery(models, { compaignId, awardId }) {
    const { compaign, award } = await this.validDoLottery(models, compaignId, awardId);

    const filter = { compaignId, status: LOTTERY_STATUS.NEW }
    const lotteriesCount = await models.Lotteries.find(filter).countDocuments();

    const random = Math.floor(randomBetween(0, lotteriesCount))

    const luckyLottery = await models.Lotteries.findOne(filter).skip(random).limit();

    if (!luckyLottery) {
      throw new Error('not found lucky lottery');
    }

    await this.setLuckyLottery(models, compaign, award, luckyLottery)

    return models.getLottery(models, luckyLottery._id);
  }

  public static async getNextChar(models, { compaignId, awardId, prevChars }) {
    const { compaign, award } = await this.validDoLottery(models, compaignId, awardId);

    const randomNumber = getRandomNumber(compaign.numberFormat);

    const nextChar = randomNumber.substring(prevChars.len, prevChars.len);
    const afterChars = `${prevChars}${nextChar}`;
    const filter = {
      compaignId,
      status: LOTTERY_STATUS.NEW,
      formatNumber: new RegExp(`^${afterChars}.*`, "g")
    }

    const fitLotteriesCount = await models.Lotteries.find(filter).countDocument();

    if (fitLotteriesCount === 1) {
      const luckyLottery = await models.Lotteries.findOne(filter);

      await this.setLuckyLottery(models, compaign, award, luckyLottery);

      return {
        nextChar,
        afterChars,
        fitLotteriesCount,
        luckyLottery: await models.getLottery(models, luckyLottery._id)
      }

    }

    const fitLotteries = await models.Lotteries.find(filter).limit(10).lean();

    return {
      nextChar,
      afterChars,
      fitLotteriesCount,
      fitLotteries
    }
  }
}
