import { ISpinDocument, ISpinParams } from '@/spin/@types/spin';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { ICommonParams } from '~/utils';

export interface ISpinMainParams extends ICommonParams {
  voucherCampaignId?: string;
}

const generateFilter = (params: ISpinParams | ISpinMainParams) => {
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

  async spinsMain(
    _root: undefined,
    params: ISpinMainParams,
    { models }: IContext,
  ) {
    const {
      page = 1,
      perPage = 20,
      sortField = 'createdAt',
      sortDirection = -1,
    } = params;

    const filter = generateFilter(params);

    const totalCount = await models.Spins.countDocuments(filter);
    const list = await models.Spins.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    return { list, totalCount };
  },
};
