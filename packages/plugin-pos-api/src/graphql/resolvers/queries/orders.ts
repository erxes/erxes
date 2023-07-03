import { sendProductsMessage } from '../../../messageBroker';
import { IContext } from '../../../connectionResolver';
import { getPureDate, getToday, getTomorrow } from '@erxes/api-utils/src/core';

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

const generateFilterPosQuery = async (
  models,
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
    customerId,
    customerType,
    posId,
    posToken,
    types
  } = params;

  if (search) {
    query.$or = [
      { number: { $regex: new RegExp(search) } },
      { origin: { $regex: new RegExp(search) } }
    ];
  }

  if (customerId) {
    query.customerId = customerId;
  }

  if (customerType) {
    query.customerType =
      customerType === 'customer'
        ? { $in: [customerType, '', undefined, null] }
        : customerType;
  }

  if (posId) {
    const pos = await models.Pos.findOne({ _id: posId }).lean();
    query.posToken = pos.token;
  }

  if (posToken) {
    const pos = await models.Pos.findOne({ token: posToken }).lean();
    query.posToken = pos.token;
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

  if (types && types.length) {
    query.type = { $in: types };
  }

  if (paidDate === 'today' || !Object.keys(query).length) {
    const now = new Date();

    const startDate = getToday(now);
    const endDate = getTomorrow(now);

    query.paidDate = { $gte: startDate, $lte: endDate };
  }

  return query;
};

const queries = {
  posOrders: async (
    _root,
    params,
    { models, commonQuerySelector, user }: IContext
  ) => {
    const query = await generateFilterPosQuery(
      models,
      params,
      commonQuerySelector,
      user._id
    );

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
      models,
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
      models,
      params,
      commonQuerySelector,
      user._id
    );

    const res = await models.PosOrders.aggregate([
      { $match: { ...query } },
      {
        $project: {
          cashAmount: '$cashAmount',
          mobileAmount: '$mobileAmount',
          totalAmount: '$totalAmount',
          finalAmount: '$finalAmount '
        }
      },
      {
        $group: {
          _id: '',
          cashAmount: { $sum: '$cashAmount' },
          mobileAmount: { $sum: '$mobileAmount' },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const ordersAmount = res.length ? res[0] : {};

    const otherAmounts = await models.PosOrders.aggregate([
      { $match: { ...query } },
      { $unwind: '$paidAmounts' },
      {
        $project: {
          type: '$paidAmounts.type',
          amount: '$paidAmounts.amount',
          token: '$posToken'
        }
      },
      {
        $lookup: {
          from: 'pos',
          let: { letToken: '$token', letType: '$type' },
          pipeline: [
            {
              $match: { $expr: { $eq: ['$token', '$$letToken'] } }
            },
            {
              $unwind: '$paymentTypes'
            },
            {
              $project: {
                type: '$paymentTypes.type',
                title: '$paymentTypes.title'
              }
            },
            {
              $match: { $expr: { $eq: ['$type', '$$letType'] } }
            }
          ],
          as: 'paymentInfo'
        }
      },
      {
        $unwind: { path: '$paymentInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: { type: '$type', title: '$paymentInfo.title' },
          amount: { $sum: '$amount' }
        }
      }
    ]);

    for (const amount of otherAmounts) {
      const key = amount._id.title || amount._id.type;
      ordersAmount[key] = (ordersAmount[key] || 0) + amount.amount;
    }

    return {
      ...ordersAmount,
      count: await models.PosOrders.find(query).countDocuments()
    };
  },

  posProducts: async (
    _root,
    params,
    { models, commonQuerySelector, user, subdomain }: IContext
  ) => {
    const orderQuery = await generateFilterPosQuery(
      models,
      params,
      commonQuerySelector,
      user._id
    );
    const query: any = {};

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

    return {
      totalCount,
      products: products.filter(
        p => !(p.status === 'deleted' && !p.count && !p.amount)
      )
    };
  }
};

export default queries;
