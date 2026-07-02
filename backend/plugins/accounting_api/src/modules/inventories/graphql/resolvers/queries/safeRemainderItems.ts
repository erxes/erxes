import {
  escapeRegExp,
  paginate,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const generateFilterItems = async (subdomain: string, params: any) => {
  const { remainderId, productCategoryIds, status, diffType, searchValue } =
    params;
  const query: any = { remainderId };

  if (productCategoryIds?.length) {
    const categories = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'productCategories',
      action: 'withChilds',
      input: { ids: productCategoryIds },
    });

    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: {
        query: { categoryId: { $in: categories.map((c) => c._id) } },
      },
      defaultValue: [],
    });

    const productIds = products.map((p) => p._id);
    query.productId = { $in: productIds };
  }

  if (searchValue) {
    const regex = { $regex: `.*${escapeRegExp(searchValue)}.*`, $options: 'i' };
    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: {
        query: {
          $or: [{ code: regex }, { name: regex }, { barcodes: regex }],
        },
        fields: { _id: 1 },
      },
      defaultValue: [],
    });

    const searchIds = products.map((p) => p._id);

    if (query.productId?.$in) {
      const searchIdSet = new Set(searchIds);
      query.productId = {
        $in: query.productId.$in.filter((id: string) => searchIdSet.has(id)),
      };
    } else {
      query.productId = { $in: searchIds };
    }
  }

  if (status) {
    query.status = status;
  }

  if (diffType) {
    const diffTypes = diffType.split(',');
    const hasGt = diffTypes.includes('gt');
    const hasLt = diffTypes.includes('lt');
    const hasEq = diffTypes.includes('eq');

    let exprOp: string | undefined;
    if (hasGt) {
      exprOp = hasEq ? '$gte' : '$gt';
    } else if (hasLt) {
      exprOp = hasEq ? '$lte' : '$lt';
    } else if (hasEq) {
      exprOp = '$eq';
    }

    if (exprOp) {
      query.$expr = { [exprOp]: ['$preCount', '$count'] };
    }
  }

  return query;
};

const safeRemainderItemsQueries = {
  safeRemainderItems: async (
    _root: any,
    params: any,
    { models, subdomain }: IContext,
  ) => {
    const query: any = await generateFilterItems(subdomain, params);
    return paginate(
      models.SafeRemainderItems.find(query).sort({ order: 1 }).lean(),
      params,
    );
  },

  safeRemainderItemsCount: async (
    _root: any,
    params: any,
    { models, subdomain }: IContext,
  ) => {
    const query: any = await generateFilterItems(subdomain, params);
    return models.SafeRemainderItems.find(query).countDocuments();
  },
};

export default safeRemainderItemsQueries;
