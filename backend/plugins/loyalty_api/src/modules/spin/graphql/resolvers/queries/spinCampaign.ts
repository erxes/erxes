import {
  ISpinCampaignDocument,
  ISpinCampaignParams,
} from '@/spin/@types/spinCampaign';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/constants';

const generateFilter = (params: ISpinCampaignParams) => {
  const filter: FilterQuery<ISpinCampaignDocument> = {};

  if (params.searchValue) {
    filter.title = new RegExp(escapeRegExp(params.searchValue), 'i');
  }

  if (params.status) {
    filter.status = params.status;
  } else {
    filter.status = { $ne: CAMPAIGN_STATUS.TRASH };
  }

  return filter;
};

export const spinCampaignQueries = {
  async spinCampaigns(
    _root: undefined,
    params: ISpinCampaignParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignView');
    const filter = generateFilter(params);

    return cursorPaginate({
      model: models.SpinCampaigns,
      params,
      query: filter,
    });
  },

  async spinCampaignDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignView');
    return models.SpinCampaigns.getSpinCampaign(_id);
  },

  async cpSpinCampaigns(
    _root: undefined,
    _args: undefined,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignView');
    const now = new Date();

    return models.SpinCampaigns.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ modifiedAt: -1 });
  },
};