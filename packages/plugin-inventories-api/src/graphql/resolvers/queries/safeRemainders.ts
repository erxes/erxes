import { paginate } from '@erxes/api-utils/src';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const safeRemainderQueries = {
  /**
   * Get one tag
   */
  safeRemainderDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.SafeRemainders.findOne({ _id });
  },

  safeRemainders: async (_root, params, { models, subdomain }: IContext) => {
    const query: any = {};

    if (params.departmentId) {
      query.departmentId = params.departmentId;
    }

    if (params.branchId) {
      query.branchId = params.branchId;
    }

    if (params.searchValue) {
      query.description = params.searchValue;
    }

    const dateQry: any = {};
    if (params.beginDate) {
      dateQry.$gte = new Date(params.beginDate);
    }
    if (params.endDate) {
      dateQry.$lte = new Date(params.endDate);
    }
    if (Object.keys(dateQry).length) {
      query.date = dateQry;
    }

    if (params.productId) {
      let allRemainders = await models.SafeRemainders.find(query).lean();
      const remIds = allRemainders.map(r => r._id);

      const items = await models.SafeRemItems.find({
        remainderId: { $in: remIds },
        productId: params.productId
      }).lean();

      const lastRemIds = new Set(items.map(i => i.remainderId) || []);
      query._id = { $in: lastRemIds };
    }

    return {
      totalCount: await models.SafeRemainders.find(query).count(),
      remainders: await paginate(models.SafeRemainders.find(query), {
        ...params
      })
    };
  }
};

requireLogin(safeRemainderQueries, 'tagDetail');
checkPermission(safeRemainderQueries, 'remainders', 'showTags', []);

export default safeRemainderQueries;
