import { defaultPaginate } from 'erxes-api-shared/utils';
import { SortOrder } from 'mongoose';
import { IContext } from '~/connectionResolvers';

interface IAdjustFixedAssetQueryParams {
  startDate?: Date;
  endDate?: Date;
  description?: string;
  status?: string;
  error?: string;
  warning?: string;
  startBeginDate?: Date;
  endBeginDate?: Date;
  startSuccessDate?: Date;
  endSuccessDate?: Date;
  startCheckedAt?: Date;
  endCheckedAt?: Date;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

interface IAdjustFxaDetailQueryParams {
  _id: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

const dateRangeFilter = (
  filter: Record<string, unknown>,
  field: string,
  start?: Date,
  end?: Date,
) => {
  if (start || end) {
    filter[field] = {
      ...(start ? { $gte: start } : {}),
      ...(end ? { $lte: end } : {}),
    };
  }
};

const generateFilter = (params: IAdjustFixedAssetQueryParams) => {
  const filter: Record<string, unknown> = {};

  if (params.description) {
    filter.description = { $regex: new RegExp(params.description, 'i') };
  }

  if (params.status) {
    filter.status = params.status;
  }

  if (params.error) {
    filter.error = { $regex: new RegExp(params.error, 'i') };
  }

  if (params.warning) {
    filter.warning = { $regex: new RegExp(params.warning, 'i') };
  }

  dateRangeFilter(filter, 'date', params.startDate, params.endDate);
  dateRangeFilter(
    filter,
    'beginDate',
    params.startBeginDate,
    params.endBeginDate,
  );
  dateRangeFilter(
    filter,
    'successDate',
    params.startSuccessDate,
    params.endSuccessDate,
  );
  dateRangeFilter(
    filter,
    'checkedAt',
    params.startCheckedAt,
    params.endCheckedAt,
  );

  return filter;
};

export const AdjustFixedAssets = {
  async adjustFixedAssets(
    _root: undefined,
    params: IAdjustFixedAssetQueryParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readAdjustInventories');

    const { sortField, sortDirection, page, perPage } = params;
    const sort: Record<string, SortOrder> = sortField
      ? { [sortField]: (sortDirection ?? 1) as SortOrder }
      : { date: -1 };

    return defaultPaginate(
      models.AdjustFixedAssets.find(generateFilter(params)).sort(sort).lean(),
      { page, perPage },
    );
  },

  async adjustFixedAssetsCount(
    _root: undefined,
    params: IAdjustFixedAssetQueryParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readAdjustInventories');

    return models.AdjustFixedAssets.find(
      generateFilter(params),
    ).countDocuments();
  },

  async adjustFixedAssetDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readAdjustInventories');

    return models.AdjustFixedAssets.findOne({ _id }).lean();
  },

  async adjustFxaDetails(
    _root: undefined,
    params: IAdjustFxaDetailQueryParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readAdjustInventories');

    const { _id, sortField, sortDirection, page, perPage } = params;
    const sort: Record<string, SortOrder> = sortField
      ? { [sortField]: (sortDirection ?? 1) as SortOrder }
      : { createdAt: 1 };

    return defaultPaginate(
      models.AdjustFxaDetails.find({ adjustId: _id }).sort(sort).lean(),
      { page, perPage },
    );
  },

  async adjustFxaDetailsCount(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readAdjustInventories');

    return models.AdjustFxaDetails.find({ adjustId: _id }).countDocuments();
  },
};
