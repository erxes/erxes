import {
  IDonateCampaignDocument,
  IDonateCampaignParams,
} from '@/donate/@types/donateCampaign';
import { Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/constants';

const generateFilter = (params: IDonateCampaignParams) => {
  const filter: FilterQuery<IDonateCampaignDocument> = {};

  if (params.searchValue) {
    filter.name = new RegExp(escapeRegExp(params.searchValue), 'i');
  }

  if (params.status) {
    filter.status = params.status;
  } else {
    filter.status = { $ne: CAMPAIGN_STATUS.TRASH };
  }

  return filter;
};

export const donateCampaignQueries: Record<string, Resolver> = {
  async donateCampaigns(
    _root: undefined,
    params: IDonateCampaignParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignView');
    const filter: FilterQuery<IDonateCampaignDocument> = generateFilter(params);

    return cursorPaginate({
      model: models.DonateCampaigns,
      params,
      query: filter,
    });
  },

  async cpDonateCampaigns(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    const now = new Date();

    return models.DonateCampaigns.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ modifiedAt: -1 });
  },

  async donateCampaignDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignView');
    return models.DonateCampaigns.getDonateCampaign(_id);
  },
};

donateCampaignQueries.cpDonateCampaigns.wrapperConfig = {
  forClientPortal: true,
};
