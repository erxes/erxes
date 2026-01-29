import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export interface IDonateCampaignParams {
  status?: string;
  searchValue?: string;
  limit?: number;
  cursor?: string;
}

const generateFilter = (params: IDonateCampaignParams) => {
  const filter: any = {};

  if (params.searchValue) {
    filter.name = new RegExp(params.searchValue, 'i');
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

export const donateCampaignQueries = {
  getDonateCampaigns: async (
    _parent: undefined,
    params: IDonateCampaignParams,
    { models }: IContext,
  ) => {
    const filter = generateFilter(params);

    return cursorPaginate({
      model: models.DonateCampaign,
      params,
      query: filter,
    });
  },

  getDonateCampaignDetail: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.DonateCampaign.getDonateCampaign(_id);
  },
};
