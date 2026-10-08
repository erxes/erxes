import {
  escapeRegExp,
  getPureDate,
  markResolvers,
  paginate,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IConfig } from '~/modules/posclient/@types/configs';
import { IContext } from '~/modules/posclient/@types/types';
import { getCompanyInfo } from '~/modules/posclient/db/models/PutData';
import { Resolver } from 'erxes-api-shared/core-types';
import { assertPosUser } from '~/modules/posclient/utils/assertPosUser';
export interface ISearchParams {
  searchValue?: string;
  startDate?: Date;
  endDate?: Date;
  dateType: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
  customerId?: string;
  customerType?: string;
  isPaid?: boolean;
  statuses?: string[];
  types: string[];
  saleStatus: string;
  dueStartDate?: Date;
  dueEndDate?: Date;
  isPreExclude?: boolean;
  slotCode?: string;
}

const generateFilter = (config: IConfig, params: ISearchParams) => {
  const {
    searchValue,
    statuses,
    types,
    saleStatus,
    customerId,
    startDate,
    endDate,
    isPaid,
    dateType,
    customerType,
    dueStartDate,
    dueEndDate,
    isPreExclude,
    slotCode,
  } = params;

  const mustFilter: any = {
    $or: [{ posToken: config.token }, { subToken: config.token }],
  };

  const filter: any = {};
  if (searchValue) {
    filter.$or = [
      { number: { $regex: new RegExp(escapeRegExp(searchValue), 'i') } },
      { origin: { $regex: new RegExp(escapeRegExp(searchValue), 'i') } },
    ];
  }

  if (customerId) {
    filter.customerId = customerId;
  }

  if (slotCode) {
    filter.slotCode = slotCode;
  }

  if (saleStatus) {
    filter.saleStatus = saleStatus;
  }

  if (types?.length) {
    filter.type = { $in: types };
  }

  if (statuses?.length) {
    filter.status = { $in: statuses };
  }

  if (customerType) {
    filter.customerType =
      customerType === 'customer'
        ? { $in: [customerType, '', undefined, null] }
        : customerType;
  }

  if (isPaid !== undefined) {
    filter.paidDate = { $exists: isPaid };
  }

  if (isPreExclude) {
    filter.isPre = { $ne: true };
  }

  const dateQry: any = {};
  if (startDate) {
    dateQry.$gte = getPureDate(startDate);
  }

  if (endDate) {
    dateQry.$lte = getPureDate(endDate);
  }

  if (Object.keys(dateQry).length) {
    const dateTypes = {
      paid: 'paidDate',
      created: 'createdAt',
      default: 'modifiedAt',
    };
    filter[dateTypes[dateType || 'default']] = dateQry;
  }

  const dueDateQry: any = {};
  if (dueStartDate) {
    dueDateQry.$gte = getPureDate(dueStartDate);
  }
  if (dueEndDate) {
    dueDateQry.$lte = getPureDate(dueEndDate);
  }
  if (Object.keys(dueDateQry).length) {
    filter.dueDate = dueDateQry;
  }

  return { $and: [{ ...mustFilter }, { ...filter }] };
};

export const filterOrders = (params: ISearchParams, models, config) => {
  const filter = generateFilter(config, params);
  const { sortField, sortDirection, page, perPage } = params;
  const sort: { [key: string]: any } = {};

  if (sortField) {
    sort[sortField] = sortDirection;
  } else {
    sort.createdAt = sortDirection || 1;
  }

  return paginate(
    models.Orders.find({
      ...filter,
    })
      .sort(sort)
      .lean(),
    { page, perPage },
  );
};

const orderQueries: Record<string, Resolver<any, any, IContext>> = {
  async orders(
    _root,
    params: ISearchParams,
    { models, config, posUser }: IContext,
  ) {
    assertPosUser(posUser);
    return filterOrders(params, models, config);
  },

  async cpCurrentOrder(
    _root,
    params: ISearchParams,
    { models, config }: IContext,
  ) {
    return filterOrders(params, models, config);
  },

  async fullOrders(
    _root,
    params: ISearchParams,
    { models, config, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    return filterOrders(params, models, config);
  },

  async cpFullOrders(
    _root,
    params: ISearchParams,
    { models, config, posUser }: IContext,
  ) {
    return filterOrders(params, models, config);
  },

  async ordersTotalCount(
    _root,
    params: ISearchParams,
    { models, config, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    const filter = generateFilter(config, params);
    return await models.Orders.find({
      ...filter,
    }).countDocuments();
  },

  async fullOrderItems(
    _root,
    {
      searchValue,
      statuses,
      page,
      perPage,
      sortField,
      sortDirection,
    }: ISearchParams,
    { models, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    const filter: any = {};

    if (searchValue) {
      filter.number = { $regex: new RegExp(escapeRegExp(searchValue), 'i') };
    }
    const sort: { [key: string]: any } = {};

    if (sortField) {
      sort[sortField] = sortDirection;
    } else {
      sort.createdAt = 1;
    }

    return paginate(
      models.OrderItems.find({
        ...filter,
        status: { $in: statuses },
      })
        .sort(sort)
        .lean(),
      { page, perPage },
    );
  },

  async orderDetail(
    _root,
    { _id, customerId }: { _id: string; customerId?: string },
    { models, config, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    const tokenFilter = {
      $or: [{ posToken: config.token }, { subToken: config.token }],
    };
    if (posUser) {
      return models.Orders.findOne({ _id, ...tokenFilter });
    }

    const order = await models.Orders.findOne({ _id, ...tokenFilter }).lean();

    if (
      !order ||
      !(order.customerType === 'visitor' || order.customerId === customerId)
    ) {
      throw new Error('Not found');
    }

    return order;
  },

  async cpOrderDetail(
    _root,
    { _id, customerId }: { _id: string; customerId?: string },
    { posUser, models, config }: IContext,
  ) {
    const tokenFilter = {
      $or: [{ posToken: config.token }, { subToken: config.token }],
    };
    if (posUser) {
      return models.Orders.findOne({ _id, ...tokenFilter });
    }

    const order = await models.Orders.findOne({ _id, ...tokenFilter }).lean();

    if (
      !order ||
      !(order.customerType === 'visitor' || order.customerId === customerId)
    ) {
      throw new Error('Not found');
    }

    return order;
  },

  async cpOrderItemDetail(
    _root,
    {
      searchValue,
      statuses,
      page,
      perPage,
      sortField,
      sortDirection,
    }: ISearchParams,
    { models }: IContext,
  ) {
    const filter: any = {};

    if (searchValue) {
      filter.number = { $regex: new RegExp(escapeRegExp(searchValue), 'i') };
    }
    const sort: { [key: string]: any } = {};

    if (sortField) {
      sort[sortField] = sortDirection;
    } else {
      sort.createdAt = 1;
    }

    return paginate(
      models.OrderItems.find({
        ...filter,
        status: { $in: statuses },
      })
        .sort(sort)
        .lean(),
      { page, perPage },
    );
  },

  async ordersCheckCompany(
    _root,
    { registerNumber },
    { config, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    const checkTaxpayerUrl = config.ebarimtConfig?.checkTaxpayerUrl;

    if (!checkTaxpayerUrl) {
      throw new Error('Not found check taxpayer url');
    }
    const resp = await getCompanyInfo({ checkTaxpayerUrl, no: registerNumber });

    if (resp.status !== 'checked' || !resp.tin) {
      throw new Error('Company register number required for checking');
    }

    return resp.result?.data;
  },

  async cpOrdersCheckCompany(_root, { registerNumber }, { config }: IContext) {
    const checkTaxpayerUrl = config.ebarimtConfig?.checkTaxpayerUrl;

    if (!checkTaxpayerUrl) {
      throw new Error('Not found check taxpayer url');
    }
    const resp = await getCompanyInfo({ checkTaxpayerUrl, no: registerNumber });

    if (resp.status !== 'checked' || !resp.tin) {
      throw new Error('Company register number required for checking');
    }

    return resp.result?.data;
  },

  async cpGetLastProductView(
    _root,
    { customerId }: { customerId?: string },
    { models, config }: IContext,
  ) {
    const tokenFilter = {
      $or: [{ posToken: config.token }, { subToken: config.token }],
    };

    const order = await models.Orders.findOne({
      ...tokenFilter,
      ...(customerId ? { customerId } : {}),
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!order) {
      return null;
    }

    return await models.OrderItems.find({ orderId: order._id }).lean();
  },

  async cpAddresses(_root, { orderId }, { subdomain }: IContext) {
    const info = await sendTRPCMessage({
      subdomain,

      method: 'query',
      pluginName: 'sales',
      module: 'pos',
      action: 'ordersDeliveryInfo',
      input: { orderId: orderId },
      defaultValue: {},
    });
    if (info.error) {
      throw new Error(info.error);
    }

    return info;
  },

  async ordersDeliveryInfo(
    _root,
    { orderId },
    { subdomain, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    const info = await sendTRPCMessage({
      subdomain,

      method: 'query',
      pluginName: 'sales',
      module: 'pos',
      action: 'ordersDeliveryInfo',
      input: { orderId: orderId },
      defaultValue: {},
    });
    if (info.error) {
      throw new Error(info.error);
    }

    return info;
  },

  async orderChangeLogs(
    _root,
    {
      orderId,
      orderNumber,
      source,
      userId,
      startDate,
      endDate,
      page = 1,
      perPage = 50,
    }: {
      orderId?: string;
      orderNumber?: string;
      source?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      perPage?: number;
    },
    { models, config, posUser }: IContext,
  ) {
    assertPosUser(posUser);

    if (!(config.adminIds || []).includes(posUser?._id || '')) {
      throw new Error('Permission denied');
    }

    if (source && !['cart', 'order'].includes(source)) {
      throw new Error('Invalid log source');
    }

    const number = orderNumber?.trim();
    const matchingOrderIds = number
      ? await models.Orders.find({
          number: { $regex: new RegExp(escapeRegExp(number), 'i') },
          $or: [{ posToken: config.token }, { subToken: config.token }],
        }).distinct('_id')
      : undefined;

    if (
      matchingOrderIds &&
      (!matchingOrderIds.length ||
        (orderId && !matchingOrderIds.includes(orderId)))
    ) {
      return [];
    }

    if (orderId) {
      const order = await models.Orders.findOne({ _id: orderId }).lean();

      if (
        order &&
        order.posToken !== config.token &&
        order.subToken !== config.token
      ) {
        return [];
      }
    }

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(perPage) ||
      perPage < 1 ||
      perPage > 100
    ) {
      throw new Error('Invalid log pagination');
    }
    const range = {
      ...(startDate ? { $gte: new Date(startDate) } : {}),
      ...(endDate ? { $lte: new Date(endDate) } : {}),
    };
    if (
      Object.values(range).some((date) => !Number.isFinite(date.valueOf())) ||
      (range.$gte && range.$lte && range.$gte > range.$lte)
    ) {
      throw new Error('Invalid log date range');
    }

    return models.OrderChangeLogs.find({
      ...(matchingOrderIds ? { orderId: { $in: matchingOrderIds } } : {}),
      ...(orderId ? { orderId } : {}),
      ...(source === 'cart' ? { source: 'cart' } : {}),
      ...(source === 'order'
        ? {
            $or: [
              { source: { $exists: false } },
              { source: null },
              { source: 'order' },
            ],
          }
        : {}),
      ...(userId ? { userId } : {}),
      ...(startDate || endDate ? { occurredAt: range } : {}),
      posToken: config.token,
    })
      .sort({ occurredAt: -1, _id: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();
  },
};
markResolvers<IContext>(orderQueries, {
  wrapperConfig: {
    skipPermission: true,
  },
});

orderQueries.cpAddresses.wrapperConfig = {
  forClientPortal: true,
};
orderQueries.cpCurrentOrder.wrapperConfig = {
  skipPermission: true,
};
orderQueries.cpFullOrders.wrapperConfig = {
  forClientPortal: true,
};
orderQueries.cpGetLastProductView.wrapperConfig = {
  forClientPortal: true,
};

orderQueries.cpOrderDetail.wrapperConfig = {
  forClientPortal: true,
};
orderQueries.cpOrdersCheckCompany.wrapperConfig = {
  forClientPortal: true,
};

export default orderQueries;
