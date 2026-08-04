import {
  IAssignmentCampaignDocument,
  IAssignmentCampaignParams,
} from '@/assignment/@types/assignmentCampaign';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/constants';

const generateFilter = (params: IAssignmentCampaignParams) => {
  const filter: FilterQuery<IAssignmentCampaignDocument> = {};

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

export const assignmentCampaignQueries = {
  async assignmentCampaigns(
    _root: undefined,
    params: IAssignmentCampaignParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignView');
    const filter: FilterQuery<IAssignmentCampaignDocument> =
      generateFilter(params);

    return cursorPaginate({
      model: models.AssignmentCampaigns,
      params,
      query: filter,
    });
  },

  async cpAssignmentCampaigns(
    _root: undefined,
    _args: undefined,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignView');
    const now = new Date();

    return models.AssignmentCampaigns.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ modifiedAt: -1 });
  },

  async assignmentCampaignDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignView');
    return models.AssignmentCampaigns.getAssignmentCampaign(_id);
  },
};