import { commonSchema } from "./CompaignUtils";

export const donateSchema = {
  ...commonSchema,

  donateScore: { type: Number },
  voucherCompaignId: { type: String, label: 'Won Voucher Compaign', optional: true },
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
    return await models.Spins.find({ ownerType, ownerId }).lean()
  }

  public static async createDonate(models, { compaignId, ownerType, ownerId, score }) {
    const donateCompaign = await models.DonatesCompaign.getSpinCompaign(models, compaignId);

    const now = new Date();

    if (donateCompaign.startDate > now || donateCompaign.endDate < now) {
      throw new Error('Not create donate, expired');
    }

    if (donateCompaign.maxScore < score) {
      throw new Error('Your donation is in excess');
    }

    let voucher: any = {};
    let fitAward: any = {};

    if ((donateCompaign.awards || []).length) {
      const awards = donateCompaign.awards.sort((a, b) => a.minScore - b.minSocre);

      for (const award of awards) {
        if (score >= award.minScore) {
          fitAward = award;
        }
      }

      if (fitAward.voucherCompaignId) {
        voucher = await models.Vouchers.createVoucher(models, { compaignId: fitAward.voucherCompaignId, ownerType, ownerId });
      }
    }

    return await models.Donates.create({ compaignId, ownerType, ownerId, createdAt: new Date(), donateScore: score, voucherCompaignId: fitAward.voucherCompaignId, voucherId: voucher._id });
  }
}
