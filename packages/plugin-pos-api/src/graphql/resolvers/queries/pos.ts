import { checkPermission } from '@erxes/api-utils/src/permissions';
import messageBroker, {
  sendCoreMessage,
  sendProductsMessage
} from '../../../messageBroker';
import {
  getBranchesUtil,
  getFullDate,
  getPureDate,
  getTomorrow
} from '../../../utils';
import { IContext } from '../../../connectionResolver';

export const paginate = (
  collection,
  params: {
    ids?: string[];
    page?: number;
    perPage?: number;
    excludeIds?: boolean;
  }
) => {
  const { page = 0, perPage = 0, ids, excludeIds } = params || { ids: null };

  const _page = Number(page || '1');
  const _limit = Number(perPage || '100');

  if (ids && ids.length > 0) {
    return excludeIds ? collection.limit(_limit) : collection;
  }

  return collection.limit(_limit).skip((_page - 1) * _limit);
};

export const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const generateFilterQuery = async ({ isOnline }, commonQuerySelector) => {
  const query: any = commonQuerySelector;
  if (isOnline) {
    query.isOnline = isOnline === 'online';
  }

  return query;
};

const generateFilterPosQuery = async (
  params,
  commonQuerySelector,
  currentUserId
) => {
  const query: any = commonQuerySelector;
  const {
    search,
    paidStartDate,
    paidEndDate,
    createdStartDate,
    createdEndDate,
    paidDate,
    userId,
    customerId
  } = params;

  if (search) {
    query.number = { $regex: new RegExp(search) };
  }

  if (customerId) {
    query.customerId = customerId;
  }

  if (userId) {
    let lastUserId = userId;
    if (userId === 'me') {
      lastUserId = currentUserId;
    }
    if (userId === 'nothing') {
      lastUserId = '';
    }
    query.userId = lastUserId;
  }

  const paidQry: any = {};
  if (paidStartDate) {
    paidQry.$gte = getPureDate(paidStartDate);
  }
  if (paidEndDate) {
    paidQry.$lte = getPureDate(paidEndDate);
  }
  if (Object.keys(paidQry).length) {
    query.paidDate = paidQry;
  }

  if (paidDate === 'today') {
    const now = new Date();

    const startDate = getFullDate(now);
    const endDate = getTomorrow(now);

    query.paidDate = { $gte: startDate, $lte: endDate };
  }

  const createdQry: any = {};
  if (createdStartDate) {
    createdQry.$gte = getPureDate(createdStartDate);
  }
  if (createdEndDate) {
    createdQry.$lte = getPureDate(createdEndDate);
  }
  if (Object.keys(createdQry).length) {
    query.createdAt = createdQry;
  }

  return query;
};

const queries = {
  posEnv: async (_root, _args, {}: IContext) => {
    const { ALL_AUTO_INIT } = process.env;
    return {
      ALL_AUTO_INIT: [true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '')
    };
  },

  posList: async (_root, params, { commonQuerySelector, models }) => {
    const query = await generateFilterQuery(params, commonQuerySelector);

    const posList = paginate(models.Pos.find(query), params);

    return posList;
  },

  posDetail: async (_root, { _id }, { models }) => {
    return await models.Pos.getPos({ _id });
  },

  ecommerceGetBranches: async (
    _root,
    { posToken },
    { models, subdomain }: IContext
  ) => {
    return await getBranchesUtil(subdomain, models, posToken);
  },

  productGroups: async (
    _root,
    { posId }: { posId: string },
    { models }: IContext
  ) => {
    return await models.ProductGroups.groups(posId);
  },

  posSlots: async (
    _root,
    { posId }: { posId: string },
    { models }: IContext
  ) => {
    return await models.PosSlots.find({ posId }).lean();
  },

  posOrders: async (
    _root,
    params,
    { models, commonQuerySelector, user }: IContext
  ) => {
    const query = await generateFilterPosQuery(
      params,
      commonQuerySelector,
      user._id
    );

    const { posId } = params;
    if (posId) {
      const pos = await models.Pos.findOne({ _id: posId }).lean();
      query.posToken = pos.token;
    }

    let sort: any = { number: 1 };
    if (params.sortField && params.sortDirection) {
      sort = {
        [params.sortField]: params.sortDirection
      };
    }

    return paginate(models.PosOrders.find(query).sort({ ...sort }), {
      page: params.page,
      perPage: params.perPage
    });
  },

  posOrdersTotalCount: async (
    _root,
    params,
    { models, commonQuerySelector, user }: IContext
  ) => {
    const query = await generateFilterPosQuery(
      params,
      commonQuerySelector,
      user._id
    );
    return models.PosOrders.find(query).count();
  },
  posOrderDetail: async (_root, { _id }, { models, subdomain }: IContext) => {
    const order = await models.PosOrders.findOne({ _id }).lean();
    const productIds = order.items.map(i => i.productId);

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: {
          _id: { $in: productIds }
        },
        sort: {}
      },
      isRPC: true
    });

    const productById = {};
    for (const product of products) {
      productById[product._id] = product;
    }

    for (const item of order.items) {
      item.productName = (productById[item.productId] || {}).name || 'unknown';
    }

    return order;
  },

  posOrdersSummary: async (
    _root,
    params,
    { models, commonQuerySelector, user }: IContext
  ) => {
    const query = await generateFilterPosQuery(
      params,
      commonQuerySelector,
      user._id
    );

    const res = await models.PosOrders.aggregate([
      { $match: { ...query } },
      {
        $project: {
          cardAmount: '$cardAmount',
          cashAmount: '$cashAmount',
          mobileAmount: '$mobileAmount',
          totalAmount: '$totalAmount',
          finalAmount: '$finalAmount '
        }
      },
      {
        $group: {
          _id: '',
          cardAmount: { $sum: '$cardAmount' },
          cashAmount: { $sum: '$cashAmount' },
          mobileAmount: { $sum: '$mobileAmount' },
          totalAmount: { $sum: '$totalAmount' },
          finalAmount: { $sum: '$finalAmount ' }
        }
      }
    ]);

    if (!res.length) {
      return {};
    }

    return {
      ...res[0],
      count: await models.PosOrders.find(query).countDocuments()
    };
  },

  posProducts: async (
    _root,
    params,
    { models, commonQuerySelector, user, subdomain }: IContext
  ) => {
    const orderQuery = await generateFilterPosQuery(
      params,
      commonQuerySelector,
      user._id
    );
    const query: any = { status: { $ne: 'deleted' } };

    if (params.categoryId) {
      const category = await sendProductsMessage({
        subdomain,
        action: 'categories.findOne',
        data: {
          _id: params.categoryId,
          status: { $in: [null, 'active'] }
        },
        isRPC: true,
        defaultValue: {}
      });

      const productCategories = await sendProductsMessage({
        subdomain,
        action: 'categories.find',
        data: {
          regData: category.order
        },
        isRPC: true,
        defaultValue: []
      });

      const product_category_ids = productCategories.map(p => p._id);

      query.categoryId = { $in: product_category_ids };
    }

    if (params.searchValue) {
      const fields = [
        {
          name: {
            $in: [new RegExp(`.*${escapeRegExp(params.searchValue)}.*`, 'i')]
          }
        },
        {
          code: {
            $in: [new RegExp(`.*${escapeRegExp(params.searchValue)}.*`, 'i')]
          }
        }
      ];

      query.$or = fields;
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

    const productIds = products.map(p => p._id);

    query['items.productId'] = { $in: productIds };

    const items = await models.PosOrders.aggregate([
      { $match: orderQuery },
      { $unwind: '$items' },
      { $match: { 'items.productId': { $in: productIds } } },
      {
        $project: {
          productId: '$items.productId',
          count: '$items.count',
          date: '$paidDate',
          amount: { $multiply: ['$items.unitPrice', '$items.count'] }
        }
      },
      {
        $group: {
          _id: { productId: '$productId', hour: { $hour: '$date' } },
          count: { $sum: '$count' },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    const diffZone = process.env.TIMEZONE;

    for (const product of products) {
      product.counts = {};
      product.count = 0;
      product.amount = 0;

      const itemsByProduct =
        items.filter(i => i._id.productId === product._id) || [];

      for (const item of itemsByProduct) {
        const { _id, count, amount } = item;
        const { hour } = _id;

        const pureHour = Number(hour) + Number(diffZone || 0);

        product.counts[pureHour] = count;
        product.count += count;
        product.amount += amount;
      }
    }

    return { totalCount, products };
  }
};

checkPermission(queries, 'posList', 'showPos');
checkPermission(queries, 'posDetail', 'showPos');
checkPermission(queries, 'productGroups', 'managePos');

export default queries;
