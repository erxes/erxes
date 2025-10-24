import { checkPermission } from 'erxes-api-shared/core-modules';
import { paginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ICommonCampaignParams } from '~/modules/loyalty/@types/common';
import { CAMPAIGN_STATUS } from '~/modules/loyalty/@types/constants';

const generateFilter = async (params: ICommonCampaignParams) => {
  const filter: any = {};

  if (params.searchValue) {
    filter.title = new RegExp(params.searchValue);
  }

  if (params.filterStatus) {
    filter.status = params.filterStatus;
  }

  return filter;
};

const donateCampaignQueries = {
  async donateCampaigns(
    _root,
    params: ICommonCampaignParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(params);

    return paginate(
      models.DonateCampaigns.find(filter).sort({ modifiedAt: -1 }),
      {
        page: params.page,
        perPage: params.perPage,
      },
    );
  },

  async cpDonateCampaigns(_root, {}, { models }: IContext) {
    const now = new Date();
    return models.DonateCampaigns.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ modifiedAt: -1 });
  },

  async donateCampaignsCount(
    _root,
    params: ICommonCampaignParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(params);

    return models.DonateCampaigns.find(filter).countDocuments();
  },

  async donateCampaignDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.DonateCampaigns.getDonateCampaign(_id);
  },
};

checkPermission(donateCampaignQueries, 'donateCampaigns', 'showLoyalties');

export default donateCampaignQueries;
