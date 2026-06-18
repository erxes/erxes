import { paginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const buildDateRange = (from?: string, to?: string) => {
  const range: any = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  return Object.keys(range).length ? range : null;
};

const safeRemainderQueries = {
  safeRemainders: async (_root: any, params: any, { models }: IContext) => {
    const query: any = {};

    if (params.departmentId) {
      query.departmentId = params.departmentId;
    }

    if (params.branchId) {
      query.branchId = params.branchId;
    }

    if (params.searchValue) {
      const regexOption = {
        $regex: `.*${params.searchValue}.*`,
        $options: 'i',
      };

      query.$or = [{ name: regexOption }, { code: regexOption }];
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

    let sort: any = { date: -1 };
    if (params.sortField) {
      sort = { [params.sortField]: params.sortDirection ?? '1' };
    }

    return {
      totalCount: await models.SafeRemainders.find(query).countDocuments(),
      remainders: await paginate(models.SafeRemainders.find(query).sort(sort), {
        ...params,
      }),
    };
  },

  safeRemainderDetail: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.SafeRemainders.getRemainder(_id);
  },
};

export default safeRemainderQueries;
