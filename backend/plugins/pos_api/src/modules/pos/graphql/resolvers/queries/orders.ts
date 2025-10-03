import { SUBSCRIPTION_INFO_STATUS } from "@/pos/db/definitions/constants";
import { escapeRegExp, getPureDate, getToday, getTomorrow, sendTRPCMessage, shortStrToDate } from "erxes-api-shared/utils";
import { IContext, IModels } from "~/connectionResolvers";

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

const generateFilterPosQuery = async (
  models,
  params,
  currentUserId
) => {
  const query: any = {};
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
    types,
    statuses,
    excludeStatuses,
    hasPaidDate,
    brandId
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
      customerType === "customer"
        ? { $in: [customerType, "", undefined, null] }
        : customerType;
  }

  if (
    (statuses && statuses.length) ||
    (excludeStatuses && excludeStatuses.length)
  ) {
    const _in = statuses && statuses.length ? { $in: statuses || [] } : {};
    query.status = { ..._in, $nin: excludeStatuses || [] };
  }

  if (posId) {
    const pos = await models.Pos.findOne({ _id: posId }).lean();
    query.posToken = pos.token;
  }

  if (brandId) {
    const pos = await models.Pos.findOne({
      scopeBrandIds: { $in: [brandId] }
    }).lean();
    query.posToken = pos?.token || '';
  }

  if (posToken) {
    const pos = await models.Pos.findOne({ token: posToken }).lean();
    query.posToken = pos.token;
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

  if (hasPaidDate) {
    query.paidDate = { $exists: true };
  }

  if (paidDate === "today" || !Object.keys(query).length) {
    const now = new Date();

    const startDate = getToday(now);
    const endDate = getTomorrow(now);

    query.paidDate = { $gte: startDate, $lte: endDate };
  }

  return query;
};

const generateFilterSubsQuery = async (params: any) => {
  const filter: any = {};

  if (params?.customerId) {
    filter.customerId = params.customerId;
  }
  if (params?.userId) {
    filter.customerId = params.userId;
  }
  if (params?.companyId) {
    filter.customerId = params.companyId;
  }

  if (params?.status) {
    filter.subscriptionInfo.subscriptionId = params.status;
  }

  if (params?.closeFrom) {
    filter.items.closeDate = { $gte: new Date(params.closeFrom) };
  }

  if (params?.closeTo) {
    filter.items.closeDate = {
      ...(filter?.items?.closeDate || {}),
      $lte: new Date(params.closeTo)
    };
  }

  return filter;
};

export const posOrderRecordsQuery = async (
  models,
  params,
  user?
) => {
  const query = await generateFilterPosQuery(
    models,
    params,
    user?._id
  );

  const { perPage = 20, page = 1 } = params;

  const orders = await models.PosOrders.aggregate([
    { $match: query },
    { $unwind: "$items" },
    { $sort: { createdAt: -1 } },
    { $skip: perPage * (page - 1) },
    { $limit: perPage }
  ]);

  const branchIds = orders.map(item => item.branchId);
  const branches = await sendTRPCMessage({
    method: 'query',
    pluginName: 'core',
    module: 'branches',
    action: "find",
    input: { query: { _id: { $in: branchIds } } },
  });

  const branchById = {};
  for (const branch of branches) {
    branchById[branch._id] = branch;
  }

  const departmentIds = orders.map(item => item.departmentId);
  const departments = await sendTRPCMessage({
    method: 'query',
    pluginName: 'core',
    module: 'departments',
    action: "find",
    input: { _id: { $in: departmentIds } },
  });

  const departmentById = {};
  for (const department of departments) {
    departmentById[department._id] = department;
  }

  const productsIds = orders.map(order => order.items.productId);
  const products = await sendTRPCMessage({
    method: 'query',
    pluginName: 'core',
    module: 'products',
    action: "find",
    input: { query: { _id: { $in: productsIds } }, limit: productsIds.length },
  });

  const productById = {};
  for (const product of products) {
    productById[product._id] = product;
  }

  const productCategoryIds = products.map(p => p.categoryId);
  const productCategories = await sendTRPCMessage({
    method: 'query',
    pluginName: 'core',
    module: 'productCategories',
    action: "find",
    input: { query: { _id: { $in: productCategoryIds } } },
  });

  const productCategoryById = {};
  for (const productCat of productCategories) {
    productCategoryById[productCat._id] = productCat;
  }

  const customerIds = orders
    .filter(o => (o.customerType || "customer") === "customer" && o.customerId)
    .map(o => o.customerId);
  const companyIds = orders
    .filter(o => o.customerType === "company" && o.customerId)
    .map(o => o.customerId);
  const userIds = orders
    .map(o => o.userId)
    .concat(
      orders
        .filter(o => o.customerType === "user" && o.customerId)
        .map(o => o.customerId)
    );

  const customerById = {};
  const companyById = {};
  const userById = {};

  if (customerIds.length) {
    const customers = await sendTRPCMessage({
      method: 'query',
      pluginName: 'core',
      module: 'customers',
      action: "find",
      input: { _id: { $in: customerIds } },
      defaultValue: []
    });

    for (const customer of customers) {
      customerById[customer._id] = customer;
    }
  }

  if (companyIds.length) {
    const companies = await sendTRPCMessage({
      method: 'query',
      pluginName: 'core',
      module: 'companies',
      action: "find",
      input: { _id: { $in: companyIds } },
      defaultValue: []
    });

    for (const company of companies) {
      companyById[company._id] = company;
    }
  }

  const users = await sendTRPCMessage({
    method: 'query',
    pluginName: 'core',
    module: 'users',
    action: "find",
    input: { query: { _id: { $in: userIds } } },
    defaultValue: []
  });

  for (const user of users) {
    userById[user._id] = user;
  }

  const posByToken = {};
  const poss = await models.Pos.find({
    token: { $in: orders.map(o => o.posToken) }
  });
  for (const pos of poss) {
    posByToken[pos.token] = pos;
  }

  for (const order of orders) {
    order._id = `${order._id}_${order.items._id}`;
    order.branch = branchById[order.branchId || ""];
    order.department = departmentById[order.departmentId || ""];
    const perProduct = productById[order.items.productId || ""] || {};
    order.items.product = perProduct;
    order.items.productCategory =
      productCategoryById[perProduct.categoryId || ""];
    order.items.manufactured = order.items.manufacturedDate
      ? new Date(
        Number(shortStrToDate(order.items.manufacturedDate, 92, "h", "n"))
      )
      : "";
    order.user = userById[order.userId];
    order.posName = posByToken[order.posToken].name;

    if (order.customerType === "company") {
      const company = companyById[order.customerId || ""];
      if (company) {
        order.customer = {
          _id: company._id,
          code: company.code,
          primaryPhone: company.primaryPhone,
          firstName: company.primaryName,
          primaryEmail: company.primaryEmail,
          lastName: ""
        };
      }
    }

    if (order.customerType === "user") {
      const user = userById[order.customerId];
      if (user) {
        order.customer = {
          _id: user._id,
          code: user.code,
          primaryPhone: (user.details && user.details.operatorPhone) || "",
          firstName: `${user.firstName || ""} ${user.lastName || ""}`,
          primaryEmail: user.email,
          lastName: user.username
        };
      }
    }

    if (!order.customerType || order.customerType === "customer") {
      const customer = customerById[order.customerId || ""];

      if (customer) {
        order.customer = {
          _id: customer._id,
          code: customer.code,
          primaryPhone: customer.primaryPhone,
          firstName: customer.firstName,
          primaryEmail: customer.primaryEmail,
          lastName: customer.lastName
        };
      }
    }
  }

  return orders;
};

export const posOrderRecordsCountQuery = async (
  models: IModels,
  params: any,
  user?
) => {
  const query = await generateFilterPosQuery(
    models,
    params,
    user?._id
  );

  const orders = await models.PosOrders.aggregate([
    { $match: query },
    { $unwind: "$items" },
    { $project: { "items._id": 1 } }
  ]);

  return orders.length;
};

const queries = {
  posOrders: async (
    _root,
    params,
    { models, user }: IContext
  ) => {
    const query = await generateFilterPosQuery(
      models,
      params,
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
    { models, user }: IContext
  ) => {
    const query = await generateFilterPosQuery(
      models,
      params,
      user._id
    );
    return models.PosOrders.find(query).countDocuments();
  },

  posOrderDetail: async (_root, { _id }, { models }: IContext) => {
    const order = await models.PosOrders.findOne({ _id }).lean();
    if (!order) {
      throw new Error(`PosOrder ${_id} not found`);
    }
    const productIds = (order.items || []).map(i => i.productId);

    const products = await sendTRPCMessage({
      method: 'query',
      pluginName: 'core',
      module: 'products',
      action: "find",
      input: {
        query: {
          _id: { $in: productIds }
        },
        sort: {}
      },
      defaultValue: []
    });

    const productById = {};
    for (const product of products) {
      productById[product._id] = product;
    }

    const orderDetail = order as any;

    for (const item of orderDetail.items || []) {
      item.productName = (productById[item.productId] || {}).name || "unknown";
    }

    return orderDetail;
  },

  posOrdersSummary: async (
    _root,
    params,
    { models, user }: IContext
  ) => {
    const query = await generateFilterPosQuery(
      models,
      params,
      user._id
    );

    const res = await models.PosOrders.aggregate([
      { $match: { ...query } },
      {
        $project: {
          cashAmount: "$cashAmount",
          mobileAmount: "$mobileAmount",
          totalAmount: "$totalAmount",
          finalAmount: "$finalAmount "
        }
      },
      {
        $group: {
          _id: "",
          cashAmount: { $sum: "$cashAmount" },
          mobileAmount: { $sum: "$mobileAmount" },
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const ordersAmount = res.length ? res[0] : {};

    const otherAmounts = await models.PosOrders.aggregate([
      { $match: { ...query } },
      { $unwind: "$paidAmounts" },
      {
        $project: {
          type: "$paidAmounts.type",
          amount: "$paidAmounts.amount",
          token: "$posToken"
        }
      },
      {
        $lookup: {
          from: "pos",
          let: { letToken: "$token", letType: "$type" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$token", "$$letToken"] } }
            },
            {
              $unwind: "$paymentTypes"
            },
            {
              $project: {
                type: "$paymentTypes.type",
                title: "$paymentTypes.title"
              }
            },
            {
              $match: { $expr: { $eq: ["$type", "$$letType"] } }
            }
          ],
          as: "paymentInfo"
        }
      },
      {
        $unwind: { path: "$paymentInfo", preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: { type: "$type", title: "$paymentInfo.title" },
          amount: { $sum: "$amount" }
        }
      }
    ]);

    for (const amount of otherAmounts) {
      const key = amount._id.title || amount._id.type;
      ordersAmount[key] = (ordersAmount[key] || 0) + amount.amount;
    }

    return ordersAmount;
  },

  posOrdersGroupSummary: async (
    _root,
    params,
    { models, user }: IContext
  ) => {
    const query = await generateFilterPosQuery(
      models,
      params,

      user._id
    );

    const idGroup: any = {};
    const { groupField } = params;

    if (groupField) {
      if (groupField === "date") {
        idGroup.paidDate = {
          $dateToString: { format: "%Y-%m-%d", date: "$paidDate" }
        };
      }

      if (groupField === "time") {
        idGroup.paidDate = {
          $dateToString: { format: "%Y-%m-%d %H", date: "$paidDate" }
        };
      }
    }

    const mainAmounts = await models.PosOrders.aggregate([
      { $match: { ...query } },
      {
        $project: {
          paidDate: "$paidDate",
          cashAmount: "$cashAmount",
          mobileAmount: "$mobileAmount",
          totalAmount: "$totalAmount",
          finalAmount: "$finalAmount "
        }
      },
      {
        $group: {
          _id: idGroup,
          cashAmount: { $sum: "$cashAmount" },
          mobileAmount: { $sum: "$mobileAmount" },
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const otherAmounts = await models.PosOrders.aggregate([
      { $match: { ...query } },
      { $unwind: "$paidAmounts" },
      {
        $project: {
          paidDate: "$paidDate",
          type: "$paidAmounts.type",
          amount: "$paidAmounts.amount",
          token: "$posToken"
        }
      },
      {
        $lookup: {
          from: "pos",
          let: { letToken: "$token", letType: "$type" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$token", "$$letToken"] } }
            },
            {
              $unwind: "$paymentTypes"
            },
            {
              $project: {
                type: "$paymentTypes.type",
                title: "$paymentTypes.title"
              }
            },
            {
              $match: { $expr: { $eq: ["$type", "$$letType"] } }
            }
          ],
          as: "paymentInfo"
        }
      },
      {
        $unwind: { path: "$paymentInfo", preserveNullAndEmptyArrays: true }
      },
      {
        $group: {
          _id: { ...idGroup, type: "$type", title: "$paymentInfo.title" },
          amount: { $sum: "$amount" }
        }
      }
    ]);

    const summary = {};
    const columns = {
      cashAmount: "cash amount",
      mobileAmount: "mobile amount",
      totalAmount: "total amount",
      count: "count"
    };

    for (const mainAmount of mainAmounts) {
      summary[mainAmount._id.paidDate] = {
        cashAmount: mainAmount.cashAmount || 0,
        mobileAmount: mainAmount.mobileAmount || 0,
        totalAmount: mainAmount.totalAmount || 0,
        count: mainAmount.count || 0
      };
    }

    for (const otherAmount of otherAmounts) {
      summary[otherAmount._id.paidDate][otherAmount._id.type] =
        (summary[otherAmount._id.paidDate][otherAmount._id.type] || 0) +
        otherAmount.amount;

      columns[otherAmount._id.type] = otherAmount._id.title;
    }

    const keys = Object.keys(summary).sort();

    const amounts: any[] = [];
    for (const key of keys) {
      amounts.push({ ...summary[key], paidDate: key });
    }

    return { amounts, columns };
  },

  posProducts: async (
    _root,
    params,
    { models, user, subdomain }: IContext
  ) => {
    const orderQuery = await generateFilterPosQuery(
      models,
      params,
      user._id
    );
    const query: any = {};

    if (params.categoryId) {
      const category = await sendTRPCMessage({
        method: 'query',
        pluginName: 'core',
        module: 'productCategories',
        action: "findOne",
        input: {
          _id: params.categoryId,
          status: { $in: [null, "active"] }
        },
        defaultValue: {}
      });

      const productCategories = await sendTRPCMessage({
        method: 'query',
        pluginName: 'core',
        module: 'productCategories',
        action: "find",
        input: {
          regData: category.order
        },
        defaultValue: []
      });

      const product_category_ids = productCategories.map(p => p._id);

      query.categoryId = { $in: product_category_ids };
    }

    if (params.searchValue) {
      const fields = [
        {
          name: {
            $in: [new RegExp(`.*${escapeRegExp(params.searchValue)}.*`, "i")]
          }
        },
        {
          code: {
            $in: [new RegExp(`.*${escapeRegExp(params.searchValue)}.*`, "i")]
          }
        }
      ];

      query.$or = fields;
    }
    const limit = params.perPage || 20;
    const skip = params.page ? (params.page - 1) * limit : 0;

    const products = await sendTRPCMessage({
      method: 'query',
      pluginName: 'core',
      module: 'products',
      action: "find",
      input: {
        query,
        sort: {},
        skip,
        limit
      },
    });

    const totalCount = await sendTRPCMessage({
      method: 'query',
      pluginName: 'core',
      module: 'products',
      action: "count",
      input: {
        query
      },
    });

    const productIds = products.map(p => p._id);

    query["items.productId"] = { $in: productIds };

    const items = await models.PosOrders.aggregate([
      { $match: orderQuery },
      { $unwind: "$items" },
      { $match: { "items.productId": { $in: productIds } } },
      {
        $project: {
          productId: "$items.productId",
          count: "$items.count",
          date: "$paidDate",
          amount: { $multiply: ["$items.unitPrice", "$items.count"] }
        }
      },
      {
        $group: {
          _id: { productId: "$productId", hour: { $hour: "$date" } },
          count: { $sum: "$count" },
          amount: { $sum: "$amount" }
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
        p => !(p.status === "deleted" && !p.count && !p.amount)
      )
    };
  },

  posOrderRecords: async (
    _root,
    params,
    { models, user }: IContext
  ) => {
    return posOrderRecordsQuery(
      models,
      params,
      user
    );
  },

  posOrderRecordsCount: async (
    _root,
    params,
    { models, user }: IContext
  ) => {
    return posOrderRecordsCountQuery(models, params, user);
  },

  posOrderCustomers: async (_root, params, { models }: IContext) => {
    return paginate(
      models.PosOrders.aggregate([
        {
          $match: {
            customerId: { $nin: [null, "", undefined] }
          }
        },
        {
          $group: {
            _id: "$customerId",
            customerType: { $first: "$customerType" },
            orders: { $push: "$$ROOT" }
          }
        },
        {
          $project: {
            _id: 1,
            customerType: 1,
            orders: 1,
            totalOrders: { $size: "$orders" },
            totalAmount: { $sum: "$orders.totalAmount" }
          }
        },
        { $sort: { _id: -1 } }
      ]),
      params
    );
  },
  posOrderCustomersTotalCount: async (
    _root,
    params,
    { subdomain, models }: IContext
  ) => {
    const [{ totalDocuments }] = await models.PosOrders.aggregate([
      {
        $group: {
          _id: "$customerId",
          customerType: { $first: "$customerType" },
          orders: { $push: "$$ROOT" }
        }
      },
      {
        $count: "totalDocuments"
      }
    ]);

    return totalDocuments;
  },

  async checkSubscription(
    _root,
    { customerId, productId, productIds },
    { models }: IContext
  ) {
    const filter: any = {
      customerId,
      "items.productId": productId,
      "subscriptionInfo.status": SUBSCRIPTION_INFO_STATUS.ACTIVE,
      "items.closeDate": { $gte: new Date() }
    };

    if (productIds) {
      filter["items.productId"] = productIds;
    }

    const subscription = await models.PosOrders.findOne(filter).sort({
      createdAt: -1
    });

    if (!subscription) {
      throw new Error(`Cannot find subscription`);
    }

    return subscription;
  },

  async posOrderBySubscriptions(
    _root,
    { page, perPage, ...params },
    { models }: IContext
  ) {
    const filter = await generateFilterSubsQuery(params);

    const _page = Number(page || "1");
    const _limit = Number(perPage || "20");

    return await models.PosOrders.aggregate([
      {
        $match: {
          "subscriptionInfo.subscriptionId": { $nin: [null, "", undefined] },
          customerId: { $nin: [null, "", undefined] },
          ...filter
        }
      },
      { $unwind: "$items" },
      { $sort: { createdAt: -1, "items.closeDate": -1 } },
      {
        $group: {
          _id: "$subscriptionInfo.subscriptionId",
          customerId: { $first: "$customerId" },
          customerType: { $first: "$customerType" },
          status: { $first: "$subscriptionInfo.status" },
          closeDate: { $first: "$items.closeDate" },
          createdAt: { $first: "$items.createdAt" },
          orders: {
            $push: {
              $cond: {
                if: { $ne: ["$items.closeDate", null] },
                then: "$$ROOT",
                else: "$$REMOVE"
              }
            }
          }
        }
      }
    ])
      .skip((_page - 1) * _limit)
      .limit(_limit);
  },

  async posOrderBySubscriptionsTotalCount(_root, params, { models }: IContext) {
    const filter = await generateFilterSubsQuery(params);

    const [result] = await models.PosOrders.aggregate([
      {
        $match: {
          ...filter,
          "subscriptionInfo.subscriptionId": { $nin: [null, "", undefined] },
          customerId: { $nin: [null, "", undefined] }
        }
      },
      { $group: { _id: "$subscriptionInfo.subscriptionId" } },
      {
        $count: "totalCount" // Count the unique groups
      }
    ]);

    return result?.totalCount || 0;
  }
};

// checkPermission(queries, "posOrders", "showOrders");
// checkPermission(queries, "posOrdersTotalCount", "showOrders");
// checkPermission(queries, "posOrderDetail", "showOrders");
// checkPermission(queries, "posOrdersSummary", "showOrders");
// checkPermission(queries, "posOrdersGroupSummary", "showOrders");
// checkPermission(queries, "posProducts", "showOrders");
// checkPermission(queries, "posOrderRecords", "showOrders");
// checkPermission(queries, "posOrderRecordsCount", "showOrders");
// checkPermission(queries, 'posOrderCustomers', 'showOrders');

export default queries;
