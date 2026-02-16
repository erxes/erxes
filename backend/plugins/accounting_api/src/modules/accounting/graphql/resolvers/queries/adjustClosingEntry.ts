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
  /**
   * Adjust closing list
   */
  async adjustClosingEntries(
    _root: undefined,
    params: IQueryParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(models, params);

    const { sortField, sortDirection, page, perPage } = params;

    const pagintationArgs = { page, perPage };

    let sort: any = { code: 1 };
    if (sortField) {
      sort = { [sortField]: sortDirection ?? 1 };
    }

    return await defaultPaginate(
      models.AdjustClosingEntries.find(filter).sort(sort).lean(),
      pagintationArgs,
    );
  },

  async adjustClosingEntriesCount(
    _root: undefined,
    params: IQueryParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(models, params);

    return models.AdjustClosingEntries.find(filter).countDocuments();
  },

  async adjustClosingEntryDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return await models.AdjustClosingEntries.findOne({ _id }).lean();
  },

  async previewAdjustClosingEntries(
    _root: undefined,
    {
      beginDate,
      date,
      accountIds,
    }: {
      beginDate: Date;
      date: Date;
      accountIds: string[];
    },
    { models }: IContext,
  ) {
    if (!models.AdjustClosingEntries?.getAdjustClosingEntries) {
      throw new Error(
        'previewAdjustClosing method not found on AdjustClosingEntries model',
      );
    }

    return models.AdjustClosingEntries.getAdjustClosingEntries({
      beginDate,
      date,
      accountIds,
    });
  },
};

export default adjustClosingEntryQueries;
