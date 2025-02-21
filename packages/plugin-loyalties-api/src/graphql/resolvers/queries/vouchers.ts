import { paginate } from '@erxes/api-utils/src/core';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { ICommonParams } from '../../../models/definitions/common';

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
    {
      ownerId,
      status,
    }: { ownerId: string; status?: 'new' | 'in_use' | 'used' | 'expired' },
    { models }: IContext,
  ) {
    const query = {
      ownerId,
    };

    if (status) {
      query['status'] = status;
    }

    const vouchers = await models.Vouchers.find(query);

    const voucherMap = new Map();

    for (const voucher of vouchers) {
      const { campaignId } = voucher;

      const key = campaignId.toString();

      if (voucherMap.has(key)) {
        const entry = voucherMap.get(key);
        entry.vouchers.push(voucher);
        entry.count += 1;
      } else {
        const campaign = await models.VoucherCampaigns.findOne({
          _id: campaignId,
        }).lean();

        voucherMap.set(key, { campaign, vouchers: [voucher], count: 1 });
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
