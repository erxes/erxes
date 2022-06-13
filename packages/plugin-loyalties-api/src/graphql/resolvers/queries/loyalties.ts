import { ICommonParams } from '../../../models/definitions/common';
import { IContext } from '../../../connectionResolver';
import { checkVouchersSale } from '../../../utils';
import { getOwner } from '../../../models/utils';

interface IParams extends ICommonParams {
  voucherCampaignId: string;
}

const loyaltyQueries = {
  async checkLoyalties(_root, params, { models }: IContext) {
    const { ownerType, ownerId, products } = params;
    return checkVouchersSale(models, ownerType, ownerId, products);
  },

  async loyalties(_root, params: IParams, { models }: IContext) {
    const score = (await getOwner(models, params.ownerType, params.ownerType) || {}).score || 0;
    const filter: any = { ownerType: params.ownerType, ownerId: params.ownerId }

    filter.status = (params.statuses && params.statuses.length) ? params.statuses : ['new']

    return {
      ownerId: params.ownerId,
      ownerType: params.ownerType,
      score,
      vouchers: await models.Vouchers.find(filter),
      lotteries: await models.Lotteries.find(filter),
      spins: await models.Spins.find(filter),
      donates: await models.Donates.find(filter)
    };
  }
};

export default loyaltyQueries;
