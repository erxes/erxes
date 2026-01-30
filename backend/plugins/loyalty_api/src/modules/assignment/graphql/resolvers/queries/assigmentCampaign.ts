import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export interface IAssignmentCampaignParams {
  status?: string;
  searchValue?: string;
  limit?: number;
  cursor?: string;
}

const generateFilter = (params: IAssignmentCampaignParams) => {
  const filter: any = {};

  if (params.searchValue) {
    filter.name = new RegExp(params.searchValue, 'i');
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

export const assignmentCampaignQueries = {
  getAssignmentCampaigns: async (
    _parent: undefined,
    params: IAssignmentCampaignParams,
    { models }: IContext,
  ) => {
    const filter = generateFilter(params);

    return cursorPaginate({
      model: models.AssignmentCampaign,
      params,
      query: filter,
    });
  },

  getAssignmentCampaignDetail: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.AssignmentCampaign.getAssignmentCampaign(_id);
  },
};
