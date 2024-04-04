import { checkPermission } from '@erxes/api-utils/src/permissions';
import { ICommonParams } from '../../../models/definitions/common';
import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src/core';

const generateFilter = (params: ICommonParams) => {
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
  return filter;
};

const voucherQueries = {
  vouchers(_root, params: ICommonParams, { models }: IContext) {
    const filter: any = generateFilter(params);
    return paginate(models.Vouchers.find(filter), params);
  },

  async vouchersMain(_root, params: ICommonParams, { models }: IContext) {
    const filter: any = generateFilter(params);

    const list = await paginate(models.Vouchers.find(filter), params);

    const totalCount = await models.Vouchers.find(filter).countDocuments();

    return {
      list,
      totalCount
    };
  }
};

checkPermission(voucherQueries, 'vouchersMain', 'showLoyalties', {
  list: [],
  totalCount: 0
});

export default voucherQueries;
