import { IContext } from '../../types';
import { escapeRegExp, getPureDate, paginate } from '@erxes/api-utils/src/core';
import { sendPosMessage } from '../../../messageBroker';
import { IConfig } from '../../../models/definitions/configs';
import { getCompanyInfo } from '../../../models/PutData';

interface ISearchParams {
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
  statuses: string[];
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

  const filter: any = {
    $or: [{ posToken: config.token }, { subToken: config.token }],
  };

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

  return { ...filter, status: { $in: statuses } };
};

const filterOrders = (params: ISearchParams, models, config) => {
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

const orderQueries = {
  async orders(_root, params: ISearchParams, { models, config }: IContext) {
    return filterOrders(params, models, config);
  },

  async fullOrders(_root, params: ISearchParams, { models, config }: IContext) {
    return filterOrders(params, models, config);
  },

  async ordersTotalCount(
    _root,
    params: ISearchParams,
    { models, config }: IContext,
  ) {
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

  async orderDetail(
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

    if (!order || !(order.customerType === 'visitor' || order.customerId === customerId)) {
      throw new Error('Not found');
    }

    return order;
  },

  async ordersCheckCompany(_root, { registerNumber }, { config }: IContext) {
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

  async ordersDeliveryInfo(_root, { orderId }, { subdomain }: IContext) {
    const info = await sendPosMessage({
      subdomain,
      action: 'ordersDeliveryInfo',
      data: {
        orderId: orderId,
      },
      isRPC: true,
    });

    if (info.error) {
      throw new Error(info.error);
    }

    return info;
  },
};

export default orderQueries;
