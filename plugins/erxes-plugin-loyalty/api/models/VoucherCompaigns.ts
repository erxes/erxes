import { commonCompaignSchema, validCompaign } from "./CompaignUtils";
import { COMPAIGN_STATUS } from './Constants';

export const voucherCompaignSchema = {
  ...commonCompaignSchema,

  score: { type: Number },
  scoreAction: { type: String },

  productCategoryIds: { type: [String] },
  productIds: { type: [String] },
  productDiscountPercent: { type: Number },
  productLimit: { type: Boolean, default: false },
  productCount: { type: Number, optional: true },

  spinCompaignId: { type: String },
  spinCount: { type: Number },

  lotteryCompaignId: { type: String },
  lotteryCount: { type: Number },
};

export class VoucherCompaign {
  public static async getVoucherCompaign(models, _id: string) {
    const voucherCompaign = await models.VoucherCompaigns.findOne({ _id });

    if (!voucherCompaign) {
      throw new Error('not found voucher rule');
    }

    return voucherCompaign;
  }

  public static async validVoucherCompaign(doc) {
    validCompaign(doc)

    if (!doc.score && !doc.productCategoryIds && !doc.productIds && !doc.spinId && !doc.lotteryId) {
      throw new Error('Could not create null Voucher compaign');
    }

    if (doc.productLimit && !doc.productCount) {
      throw new Error('Must fill product count or product limit to false');
    }

    if (doc.spinCompaignId && !doc.spinCount) {
      throw new Error('Must fill spin count when choosed spin compaign');
    }

    if (doc.lotteryCompaignId && !doc.lotteryCount) {
      throw new Error('Must fill lottery count when choosed lottery compaign');
    }
  }

  public static async createVoucherCompaign(models, doc) {
    try {
      await this.validVoucherCompaign(doc);
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
      await this.validVoucherCompaign(doc);
    } catch (e) {
      throw new Error(e.message);
    }

    doc = {
      ...doc,
      modifiedAt: new Date(),
    }

    return models.VoucherCompaigns.updateOne({ _id }, { $set: doc });
  }

  public static async removeVoucherCompaigns(models, ids: [String], dataSources) {
    // const atVoucherIds = await models.Vouchers.find({
    //   voucherCompaignId: { $in: ids }
    // }).distinct('voucherCompaignId');
    const atVoucherIds = [];

    const atDonateIds = await models.DonateCompaigns.find({
      'awards.voucherCompaignId': { $in: ids }
    }).distinct('awards.voucherCompaignId');

    const atLotteryIds = await models.LotteryCompaigns.find({
      'awards.voucherCompaignId': { $in: ids }
    }).distinct('awards.voucherCompaignId');

    const atSpinIds = await models.SpinCompaigns.find({
      'awards.voucherCompaignId': { $in: ids }
    }).distinct('awards.voucherCompaignId');

    let atAssignmentAutomations = await dataSources.AutomationsAPI.getAutomations({
      'actions.config.voucherCompaignId': { $in: ids }
    }) || []

    if (atAssignmentAutomations.error) {
      atAssignmentAutomations = []
    }

    const usedCompaignIds = [...atVoucherIds, ...atDonateIds, ...atLotteryIds, ...atSpinIds];

    for (const automation of atAssignmentAutomations) {
      usedCompaignIds.concat(
        automation.actions.map(action => (
          action.config &&
          action.config.voucherCompaignId &&
          !usedCompaignIds.includes(action.config.voucherCompaignId) &&
          action.config.voucherCompaignId
        ))
      )
    }

    // const atAssignmentIds = await models.AssignmentCompaigns.find({
    //   voucherCompaignId: { $in: ids }
    // }).distinct('voucherCompaignId');

    // automation actions check


    const deleteCompaignIds = ids.filter(id => (!usedCompaignIds.includes(id)));
    const now = new Date();

    await models.VoucherCompaigns.updateMany(
      { _id: { $in: usedCompaignIds } },
      { $set: { status: COMPAIGN_STATUS.TRASH, modifiedAt: now } }
    );

    return models.VoucherCompaigns.deleteMany({ _id: { $in: deleteCompaignIds } });
  }
}