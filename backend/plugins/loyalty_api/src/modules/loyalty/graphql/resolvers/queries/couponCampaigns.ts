import { checkPermission } from 'erxes-api-shared/core-modules';
import { paginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ICommonCampaignParams } from '~/modules/loyalty/@types/common';

const couponCampaignQueries = {
  couponCampaigns: async (
    _root,
    params: ICommonCampaignParams,
    { models }: IContext,
  ) => {
    const filter: any = {};

    if (params.searchValue) {
      filter.title = new RegExp(params.searchValue);
    }

    if (params.filterStatus) {
      filter.status = params.filterStatus;
    }

    return paginate(
      models.CouponCampaigns.find(filter).sort({ modifiedAt: -1 }),
      params,
    );
  },

  couponCampaign: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.CouponCampaigns.getCouponCampaign(_id);
  },
};

checkPermission(couponCampaignQueries, 'couponCampaign', 'showLoyalties');
checkPermission(couponCampaignQueries, 'couponCampaigns', 'showLoyalties');

export default couponCampaignQueries;
