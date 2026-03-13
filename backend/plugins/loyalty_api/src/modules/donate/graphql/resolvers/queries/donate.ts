import { IDonateDocument, IDonateListParams } from '@/donate/@types/donate';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

const generateFilter = (params: IDonateListParams) => {
  const filter: FilterQuery<IDonateDocument> = {};

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
  async donates(
    _root: undefined,
    params: IDonateListParams,
    { models }: IContext,
  ) {
    const filter: FilterQuery<IDonateDocument> = generateFilter(params);

    return await cursorPaginate({
      model: models.Donates,
      params,
      query: filter,
    });
  },
};
