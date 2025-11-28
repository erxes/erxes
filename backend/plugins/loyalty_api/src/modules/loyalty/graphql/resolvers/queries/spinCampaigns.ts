import { checkPermission } from 'erxes-api-shared/core-modules';
import { paginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ICommonCampaignParams } from '~/modules/loyalty/@types/common';
import { CAMPAIGN_STATUS } from '~/modules/loyalty/@types/constants';

const generateFilter = async (params) => {
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
    { models }: IContext,
  ) {
    const filter = await generateFilter(params);

    return paginate(
      models.SpinCampaigns.find(filter).sort({ modifiedAt: -1 }),
      {
        page: params.page,
        perPage: params.perPage,
      },
    );
  },

  async cpSpinCampaigns(_root, {}, { models }: IContext) {
    const now = new Date();

    return models.SpinCampaigns.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ modifiedAt: -1 });
  },

  async spinCampaignsCount(
    _root,
    params: ICommonCampaignParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(params);

    return models.SpinCampaigns.find(filter).countDocuments();
  },

  async spinCampaignDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.SpinCampaigns.getSpinCampaign(_id);
  },
};

checkPermission(spinCampaignQueries, 'spinCampaigns', 'showLoyalties');

export default spinCampaignQueries;
