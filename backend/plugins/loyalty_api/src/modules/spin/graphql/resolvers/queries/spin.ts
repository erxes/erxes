import { ISpinDocument, ISpinParams } from '@/spin/@types/spin';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

const generateFilter = (params: ISpinParams) => {
  const filter: FilterQuery<ISpinDocument> = {};

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

  if (params.voucherCampaignId) {
    filter.voucherCampaignId = params.voucherCampaignId;
  }

  return filter;
};

export const spinQueries = {
  async spins(_root: undefined, params: ISpinParams, { models }: IContext) {
    const filter: FilterQuery<ISpinDocument> = generateFilter(params);

    return await cursorPaginate({
      model: models.Spins,
      params,
      query: filter,
    });
  },
};
