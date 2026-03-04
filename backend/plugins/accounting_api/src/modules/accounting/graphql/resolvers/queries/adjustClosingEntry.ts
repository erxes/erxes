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
  const { page, perPage, sortField, sortDirection } = params;
  const filter: any = {};

  filter.status = { $ne: ACCOUNT_STATUSES.DELETED };

  return filter;
};

const adjustClosingEntryQueries = {
  async adjustClosingEntries(
    _root: undefined,
    params: IQueryParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(models, params);

    const { sortField, sortDirection, page, perPage } = params;
    const paginationArgs = { page, perPage };

    let sort: any = { code: 1 };
    if (sortField) {
      sort = { [sortField]: sortDirection ?? 1 };
    }

    return defaultPaginate(
      models.AdjustClosingEntries.find(filter).sort(sort).lean(),
      paginationArgs,
    );
  },

  async adjustClosingEntriesCount(
    _root: undefined,
    params: IQueryParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(models, params);
    return models.AdjustClosingEntries.countDocuments(filter);
  },

  async adjustClosingDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.AdjustClosingEntries.findById(_id).lean();
  },
};

export default adjustClosingEntryQueries;
