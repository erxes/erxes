import { paginate } from '@erxes/api-utils/src/core';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { ICommonParams } from '../../../models/definitions/common';
import { CAMPAIGN_STATUS } from '../../../models/definitions/constants';

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
  async vouchers(_root, params: ICommonParams, { models }: IContext) {
    const filter: any = generateFilter(params);
    return paginate(models.Vouchers.find(filter), params);
  },

  async ownerVouchers(
    _root,
    { ownerId }: { ownerId: string },
    { models }: IContext,
  ) {

    const NOW = new Date();
    
    const campaignIds = await models.Vouchers.find({
      ownerId, 
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: NOW },
      endDate: { $gte: NOW }
    }).distinct('campaignId');

    const campaigns = await models.VoucherCampaigns.find({
      _id: {$in: campaignIds}
    })

    const voucherMap = new Map();

    for (const campaign of campaigns) {
      const key = campaign._id.toString();
  
      if (voucherMap.has(key)) {
        voucherMap.get(key).count += 1;
      } else {
        voucherMap.set(key, { campaign, count: 1 });
      }
    }
  
    return Array.from(voucherMap.values());
  },

  async vouchersMain(_root, params: ICommonParams, { models }: IContext) {
    const filter: any = generateFilter(params);

    const list = await paginate(models.Vouchers.find(filter), params);

    const totalCount = await models.Vouchers.find(filter).countDocuments();

    return {
      list,
      totalCount,
    };
  },
};

checkPermission(voucherQueries, 'vouchersMain', 'showLoyalties', {
  list: [],
  totalCount: 0,
});

export default voucherQueries;
