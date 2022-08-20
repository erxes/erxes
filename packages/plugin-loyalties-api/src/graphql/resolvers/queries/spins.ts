import { checkPermission } from '@erxes/api-utils/src/permissions';
import { ICommonParams } from '../../../models/definitions/common';
import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src/core';

interface IParams extends ICommonParams {
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
  spins(_root, params: IParams, { models }: IContext) {
    const filter: any = generateFilter(params);
    return paginate(models.Spins.find(filter), params);
  },

  async spinsMain(_root, params: IParams, { models }: IContext) {
    const filter: any = generateFilter(params);

    const list = await paginate(models.Spins.find(filter), params);

    const totalCount = await models.Spins.find(filter).countDocuments();

    return {
      list,
      totalCount
    };
  }
};

checkPermission(spinQueries, 'spinsMain', 'showLoyalties', {
  list: [],
  totalCount: 0
});

export default spinQueries;
