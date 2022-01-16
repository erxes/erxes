import { changeScoreOwner, commonSchema } from './CompaignUtils';
import { randomBetween } from './utils';
import { SPIN_STATUS } from './Constants';

export const spinSchema = {
  ...commonSchema,
  status: { type: String, enum: SPIN_STATUS.ALL, default: 'new' },
  voucherCompaignId: { type: String, label: 'Won Voucher Compaign', optional: true },
  voucherId: { type: String, label: 'Won Voucher', optional: true }
};

export class Spin {
  public static async getSpin(models, _id: string) {
    const spin = await models.Spins.findOne({ _id }).lean();

    if (!spin) {
      throw new Error('not found spin rule')
    }

    return spin;
  }

  public static async getSpins(models, { ownerType, ownerId, statuses }: { ownerType: string, ownerId: string, statuses: string[] }) {
    return await models.Spins.find({ ownerType, ownerId, status: { $in: statuses || [] } }).lean()
  }

  public static async createSpin(models, { compaignId, ownerType, ownerId }) {
    const spinCompaign = await models.SpinCompaigns.getSpinCompaign(models, compaignId);

    const now = new Date();

    if (spinCompaign.startDate > now || spinCompaign.endDate < now) {
      throw new Error('Not create spin, expired');
    }

    return await models.Spins.create({ compaignId, ownerType, ownerId, createdAt: new Date(), status: SPIN_STATUS.NEW })
  }

  public static async buySpin(models, { compaignId, ownerType, ownerId, count = 1 }) {
    const spinCompaign = await models.SpinCompaigns.getSpinCompaign(models, compaignId);

    if (!spinCompaign.buyScore) {
      throw new Error('can not buy this spin')
    }

    await changeScoreOwner(models, { ownerType, ownerId, changeScore: -1 * spinCompaign.buyScore * count });

    return models.Spins.createSpin(models, { compaignId, ownerType, ownerId });
  }

  public static async doSpin(models, { spinId, ownerType, ownerId }) {
    const spin = await models.Spins.getSpin(models, spinId);
    const spinCompaign = await models.SpinCompaigns.getSpinCompaign(models, spin.spinCompaignId);

    const now = new Date();

    if (spinCompaign.startDate > now || spinCompaign.endDate < now) {
      throw new Error('This spin is expired');
    }

    const awards = spinCompaign.awards;

    const intervals = [];
    let intervalBegin = 0;
    for (const award of awards) {
      const min = intervalBegin;
      const max = intervalBegin + award.probability;
      intervals.push({
        awardId: award._id,
        min, max
      })
      intervalBegin = intervalBegin + award.probability;
    }

    const random = randomBetween(0, 100);

    const interval = intervals.find(i => (i.min <= random && random < i.max));

    if (!interval) {
      await models.updateOne({ _id: spinId }, { status: SPIN_STATUS.LOSS });
      return {}
    }

    const award = awards.find(a => a._id === interval.awardId);
    const voucher = await models.Vouchers.createVoucher(models, { compaignId: award.voucherCompaignId, ownerType, ownerId });
    await models.updateOne({ _id: spinId }, { status: SPIN_STATUS.WON, voucherCompaignId: award.voucherCompaignId, voucherId: voucher._id });

    return models.Spins.getSpin(models, spinId);
  }
}