import { commonCompaignSchema, validCompaign } from "./CompaignUtils";
import { COMPAIGN_STATUS } from './Constants';

export const voucherCompaignSchema = {
  ...commonCompaignSchema,

  buyScore: { type: Number },

  score: { type: Number },
  scoreAction: { type: String },

  voucherType: { type: String },

  productCategoryIds: { type: [String] },
  productIds: { type: [String] },
  discountPercent: { type: Number },

  bonusProductId: { type: String },
  bonusCount: { type: Number, optional: true },

  spinCompaignId: { type: String },
  spinCount: { type: Number },

  lotteryCompaignId: { type: String },
  lotteryCount: { type: Number },
};

const validVoucherCompaign = (doc) => {
  validCompaign(doc)

  if (!doc.score && !doc.productCategoryIds && !doc.productIds && !doc.bonusProductId && !doc.spinCompaignId && !doc.lotteryCompaignId) {
    throw new Error('Could not create null Voucher compaign');
  }

  if (doc.bonusProductId && !doc.bonusCount) {
    throw new Error('Must fill product count or product limit to false');
  }

  if (doc.spinCompaignId && !doc.spinCount) {
    throw new Error('Must fill spin count when choosed spin compaign');
  }

  if (doc.lotteryCompaignId && !doc.lotteryCount) {
    throw new Error('Must fill lottery count when choosed lottery compaign');
  }
}

export class VoucherCompaign {
  public static async getVoucherCompaign(models, _id: string) {
    const voucherCompaign = await models.VoucherCompaigns.findOne({ _id });

    if (!voucherCompaign) {
      throw new Error('not found voucher rule');
    }

    return voucherCompaign;
  }

  public static async createVoucherCompaign(models, doc) {
    try {
      await validVoucherCompaign(doc);
    } catch (e) {
      throw new Error(e.message);
    }

    doc = {
      ...doc,
      createdAt: new Date(),
      modifiedAt: new Date(),

    }

    return models.VoucherCompaigns.create(doc);
  }

  public static async updateVoucherCompaign(models, _id, doc) {
    try {
      await validVoucherCompaign(doc);
    } catch (e) {
      throw new Error(e.message);
    }

    const voucherCompaignDB = await models.VoucherCompaigns.getVoucherCompaign(models, _id);

    if (voucherCompaignDB.voucherType !== doc.voucherType) {
      let usedVoucherCount = 0
      switch (voucherCompaignDB.voucherType) {
        case 'spin':
          usedVoucherCount = models.Spins.find({ spinCompaingId: voucherCompaignDB.spinCompaignId }).countDocuments();
          break;
        case 'lottery':
          usedVoucherCount = models.Lotteries.find({ lotteryCompaingId: voucherCompaignDB.lotteryCompaignId }).countDocuments();
          break;
        default:
          usedVoucherCount = models.Vouchers.find({ voucherCompaignId: voucherCompaignDB._id }).countDocuments();
      }

      if (usedVoucherCount) {
        throw new Error(`Cant change voucher type because: this voucher Compaign in used. Set voucher type: ${voucherCompaignDB.voucherType}`)
      }
    }

    doc = {
      ...doc,
      modifiedAt: new Date(),
    }

    return models.VoucherCompaigns.updateOne({ _id }, { $set: doc });
  }

  public static async removeVoucherCompaigns(models, ids: [String]) {
    const atVoucherIds = await models.Vouchers.find({
      voucherCompaignId: { $in: ids }
    }).distinct('voucherCompaignId');

    const atDonateCompaignIds = await models.DonateCompaigns.find({
      'awards.voucherCompaignId': { $in: ids }
    }).distinct('awards.voucherCompaignId');

    const atLotteryCompaignIds = await models.LotteryCompaigns.find({
      'awards.voucherCompaignId': { $in: ids }
    }).distinct('awards.voucherCompaignId');

    const atSpinCompaignIds = await models.SpinCompaigns.find({
      'awards.voucherCompaignId': { $in: ids }
    }).distinct('awards.voucherCompaignId');

    const usedCompaignIds = [...atVoucherIds, ...atDonateCompaignIds, ...atLotteryCompaignIds, ...atSpinCompaignIds];

    const deleteCompaignIds = ids.filter(id => (!usedCompaignIds.includes(id)));
    const now = new Date();

    await models.VoucherCompaigns.updateMany(
      { _id: { $in: usedCompaignIds } },
      { $set: { status: COMPAIGN_STATUS.TRASH, modifiedAt: now } }
    );

    return models.VoucherCompaigns.deleteMany({ _id: { $in: deleteCompaignIds } });
  }
}