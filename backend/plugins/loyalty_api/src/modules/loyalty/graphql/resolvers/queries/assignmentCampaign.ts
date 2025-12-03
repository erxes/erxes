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

const assignmentCampaignQueries = {
  async assignmentCampaigns(
    _root,
    params: ICommonCampaignParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(params);

    return paginate(
      models.AssignmentCampaigns.find(filter).sort({ modifiedAt: -1 }),
      {
        page: params.page,
        perPage: params.perPage,
      },
    );
  },

  async cpAssignmentCampaigns(_root, {}, { models }: IContext) {
    const now = new Date();
    return models.AssignmentCampaigns.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ modifiedAt: -1 });
  },

  async assignmentCampaignsCount(
    _root,
    params: ICommonCampaignParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(params);

    return models.AssignmentCampaigns.find(filter).countDocuments();
  },

  async assignmentCampaignDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.AssignmentCampaigns.getAssignmentCampaign(_id);
  },
};

checkPermission(
  assignmentCampaignQueries,
  'assignmentCampaigns',
  'showLoyalties',
);

export default assignmentCampaignQueries;
