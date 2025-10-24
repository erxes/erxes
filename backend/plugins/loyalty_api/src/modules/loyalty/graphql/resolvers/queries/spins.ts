import { checkPermission } from 'erxes-api-shared/core-modules';
import { paginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ICommonParams } from '~/modules/loyalty/@types/common';

export interface IParams extends ICommonParams {
  voucherCampaignId: string;
}
const generateFilter = (params: IParams) => {
  const filter: any = {};

  if (params.campaignId) {
    filter.campaignId = params.campaignId;
  }

  if (params.status) {
    filter.status = params.status;
  }

  if (params.ownerType) {
    filter.ownerType = params.ownerType;
  }

  if (params.ownerId) {
    filter.ownerId = params.ownerId;
  }

  if (params.voucherCampaignId) {
    filter.voucherCampaignId = params.voucherCampaignId;
  }

  return filter;
};

const spinQueries = {
  async spins(_root, params: IParams, { models }: IContext) {
    const filter: any = generateFilter(params);
    return paginate(models.Spins.find(filter), params);
  },

  async spinsMain(_root, params: IParams, { models }: IContext) {
    const filter: any = generateFilter(params);

    const list = await paginate(models.Spins.find(filter), params);

    const totalCount = await models.Spins.find(filter).countDocuments();

    return {
      list,
      totalCount,
    };
  },
};

checkPermission(spinQueries, 'spinsMain', 'showLoyalties', {
  list: [],
  totalCount: 0,
});

export default spinQueries;
