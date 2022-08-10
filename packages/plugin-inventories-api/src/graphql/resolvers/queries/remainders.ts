import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import {
  IRemainderParams,
  IRemaindersParams
} from '../../../models/definitions/remainders';

const remainderQueries = {
  remainders: async (
    _root: any,
    params: IRemaindersParams,
    { models, subdomain }: IContext
  ) => {
    return await models.Remainders.getRemainders(subdomain, params);
  },

  /**
   * Get one tag
   */
  remainderDetail: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return await models.Remainders.getRemainder(_id);
  },

  remainderCount: async (
    _root: any,
    params: IRemainderParams,
    { models, subdomain }: IContext
  ) => {
    return await models.Remainders.getRemainderCount(subdomain, params);
  },

  remainderProducts: async (
    _root: any,
    params: any,
    { models, subdomain }: IContext
  ) => {
    const query: any = { status: { $ne: 'deleted' } };

    if (params.categoryId) {
      const productCategories = await sendProductsMessage({
        subdomain,
        action: 'categories.withChilds',
        data: {
          _id: params.categoryId
        },
        isRPC: true,
        defaultValue: []
      });

      const productCategoryIds = productCategories.map((item: any) => item._id);

      query.categoryId = { $in: productCategoryIds };
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

    const limit = params.perPage || 20;
    const skip = params.page ? (params.page - 1) * limit : 0;

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query,
        sort: {},
        skip,
        limit
      },
      isRPC: true
    });

    const totalCount = await sendProductsMessage({
      subdomain,
      action: 'count',
      data: {
        query
      },
      isRPC: true
    });

    const productIds = products.map((product: any) => product._id);

    const remainderQuery: any = {
      productId: { $in: productIds }
    };

    if (params.departmentId) remainderQuery.departmentId = params.departmentId;
    if (params.branchId) remainderQuery.branchId = params.branchId;

    const remainders = await models.Remainders.find(remainderQuery).lean();

    for (const product of products) {
      const { count = 0, uomId = '' } =
        remainders.find((item: any) => item.productId === product._id) || {};

      product.remainder = count;
    }

    return { totalCount, products };
  }
};

requireLogin(remainderQueries, 'tagDetail');
checkPermission(remainderQueries, 'remainders', 'showTags', []);

export default remainderQueries;
