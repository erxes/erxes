import { paginate } from '@erxes/api-utils/src/core';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

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
        $options: 'i'
      };

      query.$or = [
        {
          name: regexOption
        },
        {
          code: regexOption
        }
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
      const remIds = allRemainders.map(r => r._id);

      const items = await models.SafeRemainderItems.find({
        remainderId: { $in: remIds },
        productId: params.productId
      }).lean();

      const lastRemIds = new Set(items.map(i => i.remainderId) || []);
      query._id = { $in: lastRemIds };
    }

    return {
      totalCount: await models.SafeRemainders.find(query).count(),
      remainders: await paginate(
        models.SafeRemainders.find(query).sort({ modifiedAt: -1 }),
        {
          ...params
        }
      )
    };
  },

  safeRemainderDetail: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return await models.SafeRemainders.getRemainder(_id);
  }
};

requireLogin(safeRemainderQueries, 'tagDetail');
checkPermission(safeRemainderQueries, 'remainders', 'showTags', []);

export default safeRemainderQueries;
