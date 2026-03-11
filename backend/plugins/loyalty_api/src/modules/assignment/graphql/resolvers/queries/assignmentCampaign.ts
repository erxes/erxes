import {
  IAssignmentCampaignDocument,
  IAssignmentCampaignParams,
} from '@/assignment/@types/assignmentCampaign';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/constants';

const generateFilter = (params: IAssignmentCampaignParams) => {
  const filter: FilterQuery<IAssignmentCampaignDocument> = {};

  if (params.searchValue) {
    filter.name = new RegExp(params.searchValue, 'i');
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

export const assignmentCampaignQueries = {
  async assignmentCampaigns(
    _root: undefined,
    params: IAssignmentCampaignParams,
    { models }: IContext,
  ) {
    const filter: FilterQuery<IAssignmentCampaignDocument> = generateFilter(params);

    return cursorPaginate({
      model: models.AssignmentCampaigns,
      params,
      query: filter,
    });
  },

  async cpAssignmentCampaigns(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
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
    { models }: IContext,
  ) {
    return models.AssignmentCampaigns.getAssignmentCampaign(_id);
  },
};
