import { escapeRegExp } from '@erxes/api-utils/src/core';
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
  async remainders(
    _root,
    params: IRemaindersParams,
    { models, subdomain }: IContext
  ) {
    models.Remainders.getRemainders(subdomain, params);
  },

  /**
   * Get one tag
   */
  remainderDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Remainders.findOne({ _id });
  },

  getRemainder(
    _root,
    params: IRemainderParams,
    { models, subdomain }: IContext
  ) {
    return models.Remainders.getRemainder(subdomain, params);
  },

  remainderProducts: async (_root, params, { models, subdomain }: IContext) => {
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

      const product_category_ids = productCategories.map(p => p._id);

      query.categoryId = { $in: product_category_ids };
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
    console.log(JSON.stringify(query));
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

    const productIds = products.map(p => p._id);

    const remQuery: any = {
      productId: { $in: productIds }
    };

    if (params.departmentId) {
      remQuery.departmentId = params.departmentId;
    }
    if (params.branchId) {
      remQuery.branchId = params.branchId;
    }

    const remainders = await models.Remainders.find(remQuery).lean();

    for (const product of products) {
      const { count = 0, uomId = '' } =
        remainders.find(r => r._id === product._id) || {};

      product.count = count;
    }

    return { totalCount, products };
  }
};

requireLogin(remainderQueries, 'tagDetail');
checkPermission(remainderQueries, 'remainders', 'showTags', []);

export default remainderQueries;
