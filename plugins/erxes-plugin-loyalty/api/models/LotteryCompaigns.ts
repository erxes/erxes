import { commonCompaignSchema, validCompaign } from "./CompaignUtils";
import { COMPAIGN_STATUS, LOTTERY_STATUS } from './Constants';
import { randomBetween } from "./utils";

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

  public static async doLottery(models, { compaignId, awardId }) {
    const compaign = await models.getLotteryCompaign(models, compaignId);
    const award = compaign.awards.find(a => a.awardId === awardId)
    if (!award) {
      throw new Error('not found award');
    }

    if ((award.wonLotteryIds || []).length >= award.count) {
      throw new Error('this award is fully');
    }

    const filter = { compaignId, status: LOTTERY_STATUS.NEW }
    const lotteriesCount = await models.Lotteries.find(filter).countDocuments();

    const random = Math.floor(randomBetween(0, lotteriesCount))

    const luckyLottery = await models.Lotteries.findOne(filter).skip(random).limit();

    if (!luckyLottery) {
      throw new Error('not found lucky lottery');
    }

    const awards = compaign.awards.map(a => (a._id === award._id ? { ...a, wonLotteryIds: [...a.wonLotteryIds, luckyLottery._id] } : a));

    await models.LotteryCompaigns.updateOne({ _id: compaignId }, { $set: { awards } });

    const voucher = await models.Vouchers.createVoucher(models, { compaignId: award.voucherCompaignId, ownerType: luckyLottery.ownerType, ownerId: luckyLottery.ownerId })
    await models.Lotteries.updateOne({ _id: luckyLottery._id }, { $set: { usedAt: new Date(), status: LOTTERY_STATUS.WON, voucherCompaignId: award.voucherCompaignId, voucherId: voucher._id } })

    return models.getLottery(models, luckyLottery._id);
  }
}
