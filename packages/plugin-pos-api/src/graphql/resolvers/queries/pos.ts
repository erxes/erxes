import { checkPermission } from '@erxes/api-utils/src/permissions';
import { getFullDate, getTomorrow } from "../../../utils";

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

  const _page = Number(page || "1");
  const _limit = Number(perPage || "100");

  if (ids && ids.length > 0) {
    return excludeIds ? collection.limit(_limit) : collection;
  }

  return collection.limit(_limit).skip((_page - 1) * _limit);
};

export const escapeRegExp = (str: string) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const generateFilterQuery = async (
  models,
  { brandId, tag, status, isOnline },
  commonQuerySelector
) => {
  const query: any = commonQuerySelector;
  if (isOnline) {
    query.isOnline = isOnline === "online";
  }

  return query;
};

const generateFilterPosQuery = async (
  _models,
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
  } = params;

  if (search) {
    query.number = { $regex: new RegExp(search) };
  }

  if (customerId) {
    query.customerId = customerId;
  }

  if (userId) {
    let lastUserId = userId;
    if (userId === "me") {
      lastUserId = currentUserId;
    }
    if (userId === "nothing") {
      lastUserId = "";
    }
    query.userId = lastUserId;
  }

  const paidQry: any = {};
  if (paidStartDate) {
    paidQry.$gte = new Date(paidStartDate);
  }
  if (paidEndDate) {
    paidQry.$lte = new Date(paidEndDate);
  }
  if (Object.keys(paidQry).length) {
    query.paidDate = paidQry;
  }

  if (paidDate === "today") {
    const now = new Date();

    const startDate = getFullDate(now);
    const endDate = getTomorrow(now);
    query.paidDate = { $gte: startDate, $lte: endDate };
  }

  const createdQry: any = {};
  if (createdStartDate) {
    createdQry.$gte = new Date(createdStartDate);
  }
  if (createdEndDate) {
    createdQry.$lte = new Date(createdEndDate);
  }
  if (Object.keys(createdQry).length) {
    query.createdAt = createdQry;
  }

  return query;
};

const queries = {
  posList: async (
    _root,
    params,
    { commonQuerySelector, models }
  ) => {
    const query = await generateFilterQuery(
      models,
      params,
      commonQuerySelector
    );

    const posList = paginate(models.Pos.find(query), params);

    return posList;
  },

  posDetail: async (_root, { _id }, { models }) => {
    return await models.Pos.getPos(models, { _id });
  },

  ecommerceGetBranches: async (
    _root,
    { posToken },
    { models, messageBroker }
  ) => {
    const pos = await models.Pos.findOne({ token: posToken }).lean();

    if (!pos) {
      return { error: "not found pos" };
    }

    const allowsPos = await models.Pos.find({
      isOnline: { $ne: true },
      branchId: { $in: pos.allowBranchIds },
    }).lean();

    const healthyBranchIds = [] as any;

    for (const allowPos of allowsPos) {
      const syncIds = Object.keys(allowPos.syncInfos || {}) || [];

      if (!syncIds.length) {
        continue;
      }

      for (const syncId of syncIds) {
        const syncDate = allowPos.syncInfos[syncId];

        // expired sync 72 hour
        if (
          (new Date().getTime() - syncDate.getTime()) / (60 * 60 * 1000) >
          72
        ) {
          continue;
        }

        const longTask = async () =>
          await messageBroker().sendRPCMessage(
            `rpc_queue:health_check_${syncId}`,
            {}
          );

        const timeout = (cb, interval) => () =>
          new Promise((resolve) => setTimeout(() => cb(resolve), interval));

        const onTimeout = timeout((resolve) => resolve({}), 3000);

        let response = { healthy: "down" };
        await Promise.race([longTask, onTimeout].map((f) => f())).then(
          (result) => (response = result)
        );

        if (response.healthy === "ok") {
          healthyBranchIds.push(allowPos.branchId);
          break;
        }
      }
    }

    return await models.Branches.find({
      _id: { $in: healthyBranchIds },
    }).lean();
  },

  productGroups: async (
    _root,
    { posId }: { posId: string },
    { models }
  ) => {
    return await models.ProductGroups.groups(models, posId);
  },

  posOrders: async (_root, params, { models, commonQuerySelector, user }) => {
    const query = await generateFilterPosQuery(
      models,
      params,
      commonQuerySelector,
      user._id
    );

    return paginate(models.PosOrders.find(query), {
      page: params.page,
      perPage: params.perPage,
    });
  },

  posOrderDetail: async (_root, { _id }, { models }) => {
    const order = await models.PosOrders.findOne({ _id }).lean();
    const productIds = order.items.map((i) => i.productId);
    const products = await models.Products.find(
      { _id: { $in: productIds } },
      { name: 1 }
    ).lean();

    const productById = {};
    for (const product of products) {
      productById[product._id] = product;
    }

    for (const item of order.items) {
      item.productName = (productById[item.productId] || {}).name || "unknown";
    }

    order.putResponses = await models.PutResponses.find({
      contentType: "pos",
      contentId: order._id,
    }).lean();

    return order;
  },

  posOrdersSummary: async (
    _root,
    params,
    { models, commonQuerySelector, user }
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
          cardAmount: "$cardAmount",
          cashAmount: "$cashAmount",
          mobileAmount: "$mobileAmount",
          totalAmount: "$totalAmount",
          finalAmount: "$finalAmount ",
        },
      },
      {
        $group: {
          _id: "",
          cardAmount: { $sum: "$cardAmount" },
          cashAmount: { $sum: "$cashAmount" },
          mobileAmount: { $sum: "$mobileAmount" },
          totalAmount: { $sum: "$totalAmount" },
          finalAmount: { $sum: "$finalAmount " },
        },
      },
    ]);

    if (!res.length) {
      return {};
    }

    return {
      ...res[0],
      count: await models.PosOrders.find(query).countDocuments(),
    };
  },

  posProducts: async (_root, params, { models, commonQuerySelector, user }) => {
    const orderQuery = await generateFilterPosQuery(
      models,
      params,
      commonQuerySelector,
      user._id
    );
    const query: any = { status: { $ne: "deleted" } };

    if (params.categoryId) {
      const category = await models.ProductCategories.getProductCatogery({
        _id: params.categoryId,
        status: { $in: [null, "active"] },
      });

      const product_category_ids = await models.ProductCategories.find(
        { order: { $regex: new RegExp(category.order) } },
        { _id: 1 }
      ).lean();

      query.categoryId = { $in: product_category_ids };
    }

    if (params.searchValue) {
      const fields = [
        {
          name: {
            $in: [new RegExp(`.*${escapeRegExp(params.searchValue)}.*`, "i")],
          },
        },
        {
          code: {
            $in: [new RegExp(`.*${escapeRegExp(params.searchValue)}.*`, "i")],
          },
        },
      ];

      query.$or = fields;
    }
    const limit = params.perPage || 20;
    const skip = params.page ? (params.page - 1) * limit : 0;

    const products = await models.Products.find(query)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await models.Products.find(query).countDocuments();

    const productIds = products.map((p) => p._id);

    query["items.productId"] = { $in: productIds };

    const items = await models.PosOrders.aggregate([
      { $match: orderQuery },
      { $unwind: "$items" },
      { $match: { "items.productId": { $in: productIds } } },
      {
        $project: {
          productId: "$items.productId",
          count: "$items.count",
        },
      },
      {
        $group: {
          _id: "$productId",
          count: { $sum: "$count" },
        },
      },
    ]);

    for (const product of products) {
      product.count =
        (items.find((i) => i._id === product._id) || {}).count || 0;
    }

    return { totalCount, products };
  },
};

checkPermission(queries, 'posList', 'showPos');
checkPermission(queries, 'posDetail', "showPos");
checkPermission(queries, 'productGroups', "managePos");

export default queries;
