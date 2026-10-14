import { getOwnerBalance } from '@/score/services/scoreLedger';
import { IContext } from '~/connectionResolvers';
import { ICommonParams, IProductD } from '~/utils';
import { checkVouchersSale } from '~/utils/utils';
import { getOwnerSummary, getTargetSettled } from '~/utils/ownerSummary';
import { TLoyaltyAccountOwnerType } from '@/score/@types/account';

export const loyaltyQueries = {
  // What a selling screen outside POS (a deal) may pick for its customer;
  // `targetId` lets the voucher that record already holds read as its own,
  // and `settled` says loyalty already used its pick there.
  async loyaltyOwnerSaleVouchers(
    _root: undefined,
    args: {
      ownerType: TLoyaltyAccountOwnerType;
      ownerId: string;
      totalAmount?: number;
      targetId?: string;
    },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCheck');
    const { vouchers } = await getOwnerSummary(models, subdomain, args);

    if (!args.targetId) {
      return { vouchers, settled: false };
    }

    const settled = await getTargetSettled(models, {
      ...args,
      targetId: args.targetId,
    });

    return {
      vouchers: [...vouchers, ...settled.vouchers],
      settled: settled.settled,
    };
  },

  // Checked when typed in, so a bad code never sticks to the record.
  async loyaltyCouponCheck(
    _root: undefined,
    args: {
      code: string;
      ownerId?: string;
      totalAmount?: number;
      targetId?: string;
    },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCheck');
    await models.Coupons.checkCoupon(args);
    const coupon = await models.Coupons.findOne({ code: args.code }).lean();
    const campaign = coupon
      ? await models.CouponCampaigns.findOne({ _id: coupon.campaignId }).lean()
      : null;
    return campaign?.title || args.code;
  },

  async checkLoyalties(
    _root: undefined,
    {
      ownerType,
      ownerId,
      products,
    }: { ownerType: string; ownerId: string; products: IProductD[] },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCheck');
    return checkVouchersSale(models, subdomain, ownerType, ownerId, products);
  },

  async loyalties(
    _root: undefined,
    params: {
      voucherCampaignId: string;
      ownerId: string;
      ownerType: string;
    } & ICommonParams,
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyView');
    const score = await getOwnerBalance({
      models,
      subdomain,
      ownerType: params.ownerType,
      ownerId: params.ownerId,
    });

    const filter: any = {
      ownerType: params.ownerType,
      ownerId: params.ownerId,
    };

    filter.status = params.statuses?.length ? params.statuses : ['new'];

    return {
      ownerId: params.ownerId,
      ownerType: params.ownerType,
      score,
      vouchers: await models.Vouchers.find(filter),
      lotteries: await models.Lotteries.find(filter),
      spins: await models.Spins.find(filter),
      donates: await models.Donates.find(filter),
    };
  },
};
