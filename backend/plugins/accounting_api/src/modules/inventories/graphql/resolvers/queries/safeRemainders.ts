import { escapeRegExp, paginate } from 'erxes-api-shared/utils';
import { FilterQuery, SortOrder } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { ISafeRemainderDocument } from '../../../@types/safeRemainders';

interface ISafeRemainderQueryParams {
  branchId?: string;
  departmentId?: string;
  productId?: string;
  searchValue?: string;
  beginDate?: Date | string;
  endDate?: Date | string;
  createdUserId?: string;
  modifiedUserId?: string;
  createdStartDate?: Date | string;
  createdEndDate?: Date | string;
  updatedStartDate?: Date | string;
  updatedEndDate?: Date | string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

const buildDateRange = (from?: Date | string, to?: Date | string) => {
  const range: { $gte?: Date; $lte?: Date } = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  return Object.keys(range).length ? range : null;
};

const safeRemainderQueries = {
  safeRemainders: async (
    _root: undefined,
    params: ISafeRemainderQueryParams,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readSafeRemainders');

    const query: FilterQuery<ISafeRemainderDocument> = {};

    if (params.departmentId) {
      query.departmentId = params.departmentId;
    }

    if (params.branchId) {
      query.branchId = params.branchId;
    }

    if (params.searchValue) {
      query.description = {
        $regex: escapeRegExp(params.searchValue),
        $options: 'i',
      };
    }

    const dateRange = buildDateRange(params.beginDate, params.endDate);
    if (dateRange) query.date = dateRange;

    if (params.createdUserId) {
      query.createdBy = params.createdUserId;
    }

    if (params.modifiedUserId) {
      query.modifiedBy = params.modifiedUserId;
    }

    const createdAtRange = buildDateRange(
      params.createdStartDate,
      params.createdEndDate,
    );
    if (createdAtRange) query.createdAt = createdAtRange;

    const modifiedAtRange = buildDateRange(
      params.updatedStartDate,
      params.updatedEndDate,
    );
    if (modifiedAtRange) query.modifiedAt = modifiedAtRange;

    if (params.productId) {
      const allRemainders = await models.SafeRemainders.find(query).lean();
      const remIds = allRemainders.map((r) => r._id);

      const items = await models.SafeRemainderItems.find({
        remainderId: { $in: remIds },
        productId: params.productId,
      }).lean();

      const lastRemIds = new Set(items.map((i) => i.remainderId) || []);
      query._id = { $in: lastRemIds };
    }

    const sort: Record<string, SortOrder> = params.sortField
      ? { [params.sortField]: (params.sortDirection ?? 1) as SortOrder }
      : { date: -1 };

    return {
      totalCount: await models.SafeRemainders.find(query).countDocuments(),
      remainders: await paginate(models.SafeRemainders.find(query).sort(sort), {
        ...params,
      }),
    };
  },

  safeRemainderDetail: async (
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readSafeRemainders');

    return await models.SafeRemainders.getRemainder(_id);
  },
};

export default safeRemainderQueries;
