import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IDonateListParams } from '~/modules/donate/@types/donate';

const generateFilter = (params: IDonateListParams) => {
  const filter: any = {};

  if (params.campaignId) {
    filter.campaignId = params.campaignId;
  }

  if (params.status) {
    filter.status = params.status;
  }

  if (params.ownerType) {
    filter.ownerType = params.ownerType;
  }

  if (params.ownerId) {
    filter.ownerId = params.ownerId;
  }
  return filter;
};

export const donateQueries = {
  getDonates: async (
    _parent: undefined,
    params: IDonateListParams,
    { models }: IContext,
  ) => {
    const filter = generateFilter(params);

    return await cursorPaginate({
      model: models.Donate,
      params,
      query: filter,
    });
  },
};
