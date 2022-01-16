import { commonCompaignSchema, validCompaign } from './CompaignUtils';
import { COMPAIGN_STATUS } from './Constants';

const spinAward = {
  _id: { type: String },
  voucherCompaignId: { type: String },
  probability: { type: Number, max: 100, min: 0 }
}

export const spinCompaignSchema = {
  ...commonCompaignSchema,

  buyScore: { type: Number },

  awards: { type: [spinAward] }
};

export class SpinCompaign {
  public static async getSpinCompaign(models, _id: string) {
    const spinCompaign = await models.SpinCompaigns.findOne({ _id }).lean();

    if (!spinCompaign) {
      throw new Error('not found spin compaign');
    }

    return spinCompaign;
  }

  public static async validSpinCompaign(doc) {
    validCompaign(doc);
    let sumProbability = 0;
    for (const award of doc.awards) {
      sumProbability += award.probability;
    }

    if (sumProbability < 0 || sumProbability > 100) {
      throw new Error('must sum probability has between 0 to 100')
    }
  }

  public static async createSpinCompaign(models, doc) {
    try {
      await this.validSpinCompaign(doc);
    } catch (e) {
      throw new Error(e.message);
    }

    doc = {
      ...doc,
      createdAt: new Date(),
      modifiedAt: new Date(),
    }

    return models.SpinCompaigns.create(doc);
  }

  public static async updateSpinCompaign(models, _id, doc) {
    try {
      await this.validSpinCompaign(doc);
    } catch (e) {
      throw new Error(e.message);
    }

    doc = {
      ...doc,
      modifiedAt: new Date(),
    }

    return models.SpinCompaigns.updateOne({ _id }, { $set: doc });
  }

  public static async removeSpinCompaigns(models, ids: [String]) {
    const atSpinIds = await models.Spins.find({
      compaignId: { $in: ids }
    }).distinct('compaignId');

    const atVoucherIds = await models.VoucherCompaigns.find({
      spinCompaignId: { $in: ids }
    }).distinct('spinCompaignId');

    const usedCompaignIds = [...atSpinIds, ...atVoucherIds];
    const deleteCompaignIds = ids.map(id => !usedCompaignIds.includes(id));
    const now = new Date();

    await models.SpinCompaigns.updateMany(
      { _id: { $in: usedCompaignIds } },
      { $set: { status: COMPAIGN_STATUS.TRASH, modifiedAt: now } }
    );

    return models.SpinCompaigns.deleteMany({ _id: { $in: deleteCompaignIds } });
  }
}