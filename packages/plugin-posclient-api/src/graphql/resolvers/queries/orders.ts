import { IContext } from '../../types';
import { escapeRegExp, getPureDate, paginate } from '@erxes/api-utils/src/core';
import fetch from 'node-fetch';
import { sendPosMessage } from '../../../messageBroker';
import { IConfig } from '../../../models/definitions/configs';
import { SUBSCRIPTION_INFO_STATUS } from '../../../models/definitions/constants';

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
  orders(_root, params: ISearchParams, { models, config }: IContext) {
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
    }).count();
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

    if (!customerId) {
      throw new Error('Not found');
    }

    return models.Orders.findOne({ _id, ...tokenFilter });
  },

  async ordersCheckCompany(_root, { registerNumber }, { config }: IContext) {
    if (!registerNumber) {
      throw new Error('Company register number required for checking');
    }
    const url =
      config && config.ebarimtConfig && config.ebarimtConfig.checkCompanyUrl;

    if (url) {
      const response = await fetch(
        url + '?' + new URLSearchParams({ regno: registerNumber }),
      ).then(res => res.json());
      return response;
    }

    return {
      error: 'ebarimt config error',
      message: 'Check company url is not configured',
    };
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

  async checkSubscription(
    _root,
    { customerId, productId },
    { models }: IContext,
  ) {
    const subscription = await models.Orders.findOne({
      customerId,
      'items.productId': productId,
      'subscriptionInfo.status': SUBSCRIPTION_INFO_STATUS.ACTIVE,
    });

    if (!subscription) {
      throw new Error(`Cannot find subscription`);
    }

    return subscription;
  },
};

export default orderQueries;
