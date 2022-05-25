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

const lotteryCampaignQueries = {
  async lotteryCampaigns(
    _root,
    params: ICommonCampaignParams,
    { models }: IContext
  ) {
    const filter = await generateFilter(params);

    return paginate(
      models.LotteryCampaigns.find(filter).sort({ modifiedAt: -1 }),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },

  cpLotteryCampaigns(_root, {}, { models }: IContext) {
    const now = new Date();

    return models.LotteryCampaigns.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).sort({ modifiedAt: -1 });
  },

  async lotteryCampaignsCount(
    _root,
    params: ICommonCampaignParams,
    { models }: IContext
  ) {
    const filter = await generateFilter(params);

    return models.LotteryCampaigns.find(filter).countDocuments();
  },

  lotteryCampaignDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.LotteryCampaigns.getLotteryCampaign(_id);
  }
};

checkPermission(lotteryCampaignQueries, 'lotteryCampaigns', 'showLoyalties');

export default lotteryCampaignQueries;
