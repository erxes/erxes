import { IDonateDocument, IDonateListParams } from '@/donate/@types/donate';
import { Resolver } from 'erxes-api-shared/core-types';
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

  if (params.clientPortal) {
    filter.clientPortal = params.clientPortal;
  }

  return filter;
};

export const donateQueries: Record<string, Resolver> = {
  async donates(
    _root: undefined,
    params: IDonateListParams,
    { models, checkPermission, user }: IContext,
  ) {
    if (user) {
      await checkPermission('donateView');
    }
    
    const filter: FilterQuery<IDonateDocument> = generateFilter(params);

    return await cursorPaginate({
      model: models.Donates,
      params,
      query: filter,
    });
  },

  async donatesMain(
    _root: undefined,
    params: IDonateListParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('donateView');
    const {
      page = 1,
      perPage = 20,
      sortField = 'createdAt',
      sortDirection = -1,
    } = params;
    const filter = generateFilter(params);

    const totalCount = await models.Donates.countDocuments(filter);
    const list = await models.Donates.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    return { list, totalCount };
  },

  async cpDonatesMain(
    _root: undefined,
    params: IDonateListParams,
    context: IContext,
    info: any
  ) {
    return donateQueries.donatesMain(_root, params, context, info);
  },
};

donateQueries.cpDonatesMain.wrapperConfig = {
  forClientPortal: true,
};