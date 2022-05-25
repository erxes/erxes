import { checkPermission } from '@erxes/api-utils/src/permissions';
import { ICommonCampaignParams } from '../../../models/definitions/common';
import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src/core';
import { CAMPAIGN_STATUS } from '../../../models/definitions/constants';

const generateFilter = async params => {
  const filter: any = {};

  if (params.searchValue) {
    filter.title = new RegExp(params.searchValue);
  }

  if (params.filterStatus) {
    filter.status = params.filterStatus;
  }

  return filter;
};

const spinCampaignQueries = {
  async spinCampaigns(
    _root,
    params: ICommonCampaignParams,
    { models }: IContext
  ) {
    const filter = await generateFilter(params);

    return paginate(
      models.SpinCampaigns.find(filter).sort({ modifiedAt: -1 }),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },

  cpSpinCampaigns(_root, {}, { models }: IContext) {
    const now = new Date();

    return models.SpinCampaigns.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ modifiedAt: -1 });
  },

  async spinCampaignsCount(
    _root,
    params: ICommonCampaignParams,
    { models }: IContext
  ) {
    const filter = await generateFilter(params);

    return models.SpinCampaigns.find(filter).countDocuments();
  },

  spinCampaignDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.SpinCampaigns.getSpinCampaign(_id);
  }
};

checkPermission(spinCampaignQueries, 'spinCampaigns', 'showLoyalties');

export default spinCampaignQueries;
