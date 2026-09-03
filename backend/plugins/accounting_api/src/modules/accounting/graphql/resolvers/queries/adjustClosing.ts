import { defaultPaginate } from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';

interface IQueryParams {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
  status?: string;
}

export const generateFilter = async (models: IModels, params: IQueryParams) => {
  const filter: any = {};

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

const adjustClosingQueries = {
  async adjustClosings(
    _root: undefined,
    params: IQueryParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readAdjustClosings');

    const filter = await generateFilter(models, params);

    const { sortField, sortDirection } = params;

    let sort: any = { createdAt: -1 };
    if (sortField) {
      sort = { [sortField]: sortDirection ?? 1 };
    }

    return defaultPaginate(
      models.AdjustClosings.find(filter).sort(sort).lean(),
      { page: params.page, perPage: params.perPage },
    );
  },

  async adjustClosingsCount(
    _root: undefined,
    params: IQueryParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readAdjustClosings');

    const filter = await generateFilter(models, params);
    return models.AdjustClosings.countDocuments(filter);
  },

  async adjustClosingDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readAdjustClosings');

    return models.AdjustClosings.findById(_id).lean();
  },

  async adjustClosingEntriesCount(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readAdjustClosings');

    const adjust = await models.AdjustClosings.findById(_id).lean();
    if (!adjust?.details) {
      return 0;
    }
    return adjust.details.reduce(
      (total, detail) => total + (detail.entries?.length || 0),
      0,
    );
  },
};

export default adjustClosingQueries;
