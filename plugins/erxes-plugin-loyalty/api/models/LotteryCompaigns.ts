import { commonCompaignSchema, validCompaign } from "./CompaignUtils";
import { COMPAIGN_STATUS } from "./Constants";

const lotteryAward = {
  _id: { type: String },
  voucherCompaignId: { type: String },
  count: { type: Number, min: 0 }
}

export const lotteryCompaignSchema = {
  ...commonCompaignSchema,
  lotteryDate: { type: Date, label: 'Lottery Date' },

  numberFormat: { type: String },
  byScore: { type: Number },

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
    const atLotteryIds = await models.Lotterys.find({
      lotteryCompaignId: { $in: ids }
    }).distinct('lotteryCompaignId');

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
}
