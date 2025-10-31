import { checkPermission } from 'erxes-api-shared/core-modules';
import { paginate } from 'erxes-api-shared/utils';
import { SortOrder } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { ICommonParams } from '~/modules/loyalty/@types/common';
import { CAMPAIGN_STATUS } from '~/modules/loyalty/@types/constants';

const generateFilter = (
  params: ICommonParams & { fromDate: string; toDate?: string },
) => {
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

  if (params.fromDate) {
    filter.createdAt = { $gte: new Date(params.fromDate) };
  }

  if (params.toDate) {
    filter.createdAt = {
      ...(filter.createdAt || {}),
      $lt: new Date(params.toDate),
    };
  }

  return filter;
};

const voucherQueries = {
  async vouchers(
    _root,
    params: ICommonParams & { fromDate: string; toDate?: string },
    { models }: IContext,
  ) {
    const filter: any = generateFilter(params);
    return paginate(models.Vouchers.find(filter), params);
  },

  async ownerVouchers(
    _root,
    { ownerId }: { ownerId: string },
    { models }: IContext,
  ) {
    const NOW = new Date();

    const vouchers = await models.Vouchers.find({ ownerId });

    const campaignVoucherMap = new Map<string, { voucherIds: string[] }>();

    for (const voucher of vouchers) {
      const campaignId = voucher.campaignId?.toString();
      if (!campaignId) continue;

      if (!campaignVoucherMap.has(campaignId)) {
        campaignVoucherMap.set(campaignId, { voucherIds: [] });
      }

      campaignVoucherMap
        .get(campaignId)!
        .voucherIds.push(voucher._id.toString());
    }

    const campaignIds = Array.from(campaignVoucherMap.keys());

    const campaigns = await models.VoucherCampaigns.find({
      _id: { $in: campaignIds },
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: NOW },
      endDate: { $gte: NOW },
    });

    const results: any = [];

    for (const campaign of campaigns) {
      const campaignId = campaign._id.toString();
      const voucherData = campaignVoucherMap.get(campaignId);

      if (voucherData) {
        results.push({
          campaign,
          count: voucherData.voucherIds.length,
          voucherIds: voucherData.voucherIds,
        });
      }
    }

    return results;
  },

  async vouchersMain(
    _root,
    params: ICommonParams & { fromDate: string; toDate?: string },
    { models }: IContext,
  ) {
    const { sortField = 'createdAt', sortDirection = -1 } = params;
    const filter: any = generateFilter(params);

    const list = await paginate(
      models.Vouchers.find(filter).sort({
        [sortField]: sortDirection as SortOrder,
      }),
      params,
    );

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
