import { defaultPaginate } from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';
import { ACCOUNT_STATUSES } from '~/modules/accounting/@types/constants';

interface IQueryParams {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

export const generateFilter = async (models: IModels, params: IQueryParams) => {
  const filter: any = {};

  filter.status = { $ne: ACCOUNT_STATUSES.DELETED };

  return filter;
};

const adjustClosingQueries = {
  async adjustClosings(
    _root: undefined,
    params: IQueryParams,
    { models }: IContext,
  ) {
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
    { models }: IContext,
  ) {
    const filter = await generateFilter(models, params);
    return models.AdjustClosings.countDocuments(filter);
  },

  async adjustClosingDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.AdjustClosings.findById(_id).lean();
  },

  async adjustClosingEntriesCount(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const detail = await models.AdjustClosings.findById(_id).lean();
    if (!detail || !detail.entries) {
      return 0;
    }
    return detail.entries.length;
  },
};

export default adjustClosingQueries;
