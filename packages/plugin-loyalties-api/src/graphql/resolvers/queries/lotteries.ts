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
  lotteries(_root, params: IParams, { models }: IContext) {
    const filter: any = generateFilter(params);
    return paginate(models.Lotteries.find(filter), params);
  },

  async lotteriesMain(_root, params: IParams, { models }: IContext) {
    const filter: any = generateFilter(params);

    const list = await paginate(models.Lotteries.find(filter), params);

    const totalCount = await models.Lotteries.find(filter).countDocuments();

    return {
      list,
      totalCount
    };
  }
};

checkPermission(spinQueries, 'lotteriesMain', 'showLoyalties', {
  list: [],
  totalCount: 0
});

export default spinQueries;
