import { checkPermission } from 'erxes-api-shared/core-modules';
import { paginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

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

      query.$or = [
        {
          name: regexOption,
        },
        {
          code: regexOption,
        },
      ];
    }

    const dateQuery: any = {};
    if (params.beginDate) {
      dateQuery.$gte = new Date(params.beginDate);
    }
    if (params.endDate) {
      dateQuery.$lte = new Date(params.endDate);
    }

    if (Object.keys(dateQuery).length) {
      query.date = dateQuery;
    }

    if (params.productId) {
      let allRemainders = await models.SafeRemainders.find(query).lean();
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

checkPermission(safeRemainderQueries, 'safeRemainders', 'manageRemainders', []);
checkPermission(
  safeRemainderQueries,
  'safeRemainderDetail',
  'manageRemainders',
  [],
);

export default safeRemainderQueries;
