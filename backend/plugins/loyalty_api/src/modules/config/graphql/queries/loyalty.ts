import { IContext } from '~/connectionResolvers';
import {
  checkVouchersSale,
  getLoyaltyOwner,
  ICommonParams,
  IProductD,
} from '~/utils';

export const loyaltyQueries = {
  async checkLoyalties(
    _root: undefined,
    {
      ownerType,
      ownerId,
      products,
    }: { ownerType: string; ownerId: string; products: IProductD[] },
    { models, subdomain }: IContext,
  ) {
    return checkVouchersSale(models, subdomain, ownerType, ownerId, products);
  },

  async loyalties(
    _root: undefined,
    params: {
      voucherCampaignId: string;
      ownerId: string;
      ownerType: string;
    } & ICommonParams,
    { models, subdomain }: IContext,
  ) {
    const score =
      (
        (await getLoyaltyOwner(subdomain, {
          ownerType: params.ownerType,
          ownerId: params.ownerId,
        })) || {}
      ).score || 0;

    const filter: any = {
      ownerType: params.ownerType,
      ownerId: params.ownerId,
    };

    filter.status =
      params.statuses && params.statuses.length ? params.statuses : ['new'];

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
