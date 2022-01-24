import { changeScoreOwner, commonSchema } from "./CompaignUtils";

export const donateSchema = {
  ...commonSchema,

  donateScore: { type: Number },
  awardId: { type: String, label: 'Won Award', optional: true },
  voucherId: { type: String, label: 'Won Voucher', optional: true }
};

export class Donate {
  public static async getDonate(models, _id: string) {
    const donate = await models.Donates.findOne({ _id });

    if (!donate) {
      throw new Error('not found donate rule')
    }

    return donate;
  }

  public static async getDonates(models, { ownerType, ownerId }: { ownerType: string, ownerId: string }) {
    return await models.Donates.find({ ownerType, ownerId }).lean()
  }

  public static async createDonate(models, { compaignId, ownerType, ownerId, donateScore }) {
    if (!donateScore) {
      throw new Error('Not create donate, score is NaN');
    }

    if (!ownerId || !ownerType) {
      throw new Error('Not create donate, owner is undefined');
    }

    const donateCompaign = await models.DonateCompaigns.getDonateCompaign(models, compaignId);

    const now = new Date();

    if (donateCompaign.startDate > now || donateCompaign.endDate < now) {
      throw new Error('Not create donate, expired');
    }

    if (donateCompaign.maxScore < donateScore) {
      throw new Error('Your donation is in excess');
    }

    let voucher: any = {};
    let fitAward: any = {};

    if ((donateCompaign.awards || []).length) {
      const awards = donateCompaign.awards.sort((a, b) => a.minScore - b.minSocre);

      for (const award of awards) {
        if (donateScore >= award.minScore) {
          fitAward = award;
        }
      }

      if (fitAward.voucherCompaignId) {
        voucher = await models.Vouchers.createVoucher(models, { compaignId: fitAward.voucherCompaignId, ownerType, ownerId });
      }
    }

    await changeScoreOwner(models, { ownerType, ownerId, changeScore: -1 * donateScore });

    return await models.Donates.create({ compaignId, ownerType, ownerId, createdAt: new Date(), donateScore, awardId: fitAward._id, voucherId: voucher._id });
  }

  public static async removeDonates(models, _ids: string[]) {
    return models.Donates.deleteMany({ _id: { $in: _ids } })
  }
}
