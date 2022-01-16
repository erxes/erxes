import { commonCompaignSchema, validCompaign } from './CompaignUtils';
import { COMPAIGN_STATUS } from './Constants';

const donateAward = {
  _id: { type: String },
  minScore: { type: Number },
  voucherCompaignId: { type: String },
}

export const donateCompaignSchema = {
  ...commonCompaignSchema,

  awards: { type: [donateAward] },
  maxScore: { type: Number },
};

const getSortAwards = (awards) => {
  return awards.sort((a, b) => a.minScore - b.minScore)
}

export class DonateCompaign {
  public static async getDonateCompaign(models, _id: string) {
    const donateCompaign = await models.DonateCompaigns.findOne({ _id });

    if (!donateCompaign) {
      throw new Error('not found donate compaign');
    }

    return donateCompaign;
  }

  static async validDonateCompaign(doc) {
    validCompaign(doc)

    const awards = doc.awards || [];
    if (doc.maxScore && awards.length && (awards[awards.length - 1].minScore || 0) > doc.maxScore) {
      throw new Error('Max score must be greather than level scores')
    }

    const levels = awards.map(a => a.minScore)
    if (levels.length > [...new Set(levels)].length) {
      throw new Error('Levels scores must be unique')
    }
  }

  public static async createDonateCompaign(models, doc) {
    doc = {
      ...doc,
      awards: getSortAwards(doc.awards),
      createdAt: new Date(),
      modifiedAt: new Date(),
    }

    try {
      await this.validDonateCompaign(doc);
    } catch (e) {
      throw new Error(e.message);
    }

    return models.DonateCompaigns.create(doc);
  }

  public static async updateDonateCompaign(models, _id, doc) {
    doc = {
      ...doc,
      awards: getSortAwards(doc.awards),
      modifiedAt: new Date(),
    }

    try {
      await this.validDonateCompaign(doc);
    } catch (e) {
      throw new Error(e.message);
    }

    return models.DonateCompaigns.updateOne({ _id }, { $set: doc });
  }

  public static async removeDonateCompaigns(models, ids: [String]) {
    const atDonateIds = await models.Donates.find({
      compaignId: { $in: ids }
    }).distinct('compaignId');

    const usedCompaignIds = [...atDonateIds];
    const deleteCompaignIds = ids.map(id => !usedCompaignIds.includes(id));
    const now = new Date();

    await models.DonateCompaigns.updateMany(
      { _id: { $in: usedCompaignIds } },
      { $set: { status: COMPAIGN_STATUS.TRASH, modifiedAt: now } }
    );

    return models.DonateCompaigns.deleteMany({ _id: { $in: deleteCompaignIds } });
  }
}