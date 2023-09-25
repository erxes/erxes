import { IContext } from '../../types';
import { escapeRegExp, getPureDate, paginate } from '@erxes/api-utils/src/core';
import { sendRequest } from '@erxes/api-utils/src/requests';
import { sendPosMessage } from '../../../messageBroker';
import { IConfig } from '../../../models/definitions/configs';

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
  dueStartDate?: Date;
  dueEndDate?: Date;
  isPreExclude?: boolean;
}

const generateFilter = (config: IConfig, params: ISearchParams) => {
  const {
    searchValue,
    statuses,
    customerId,
    startDate,
    endDate,
    isPaid,
    dateType,
    customerType,
    dueStartDate,
    dueEndDate,
    isPreExclude
  } = params;
  const filter: any = {
    $or: [{ posToken: config.token }, { subToken: config.token }]
  };

  if (searchValue) {
    filter.$or = [
      { number: { $regex: new RegExp(escapeRegExp(searchValue), 'i') } },
      { origin: { $regex: new RegExp(escapeRegExp(searchValue), 'i') } }
    ];
  }

  if (customerId) {
    filter.customerId = customerId;
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
      default: 'modifiedAt'
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
      ...filter
    })
      .sort(sort)
      .lean(),
    { page, perPage }
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
    { models, config }: IContext
  ) {
    const filter = generateFilter(config, params);
    return await models.Orders.find({
      ...filter
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
      sortDirection
    }: ISearchParams,
    { models }: IContext
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
        status: { $in: statuses }
      })
        .sort(sort)
        .lean(),
      { page, perPage }
    );
  },

  async orderDetail(
    _root,
    { _id, customerId }: { _id: string; customerId?: string },
    { posUser, models, config }: IContext
  ) {
    if (posUser) {
      return models.Orders.findOne({ _id });
    }

    if (!customerId) {
      throw new Error('Not found');
    }

    return models.Orders.findOne({ _id, customerId, posToken: config.token });
  },

  async ordersCheckCompany(_root, { registerNumber }, { config }: IContext) {
    if (!registerNumber) {
      throw new Error('Company register number required for checking');
    }
    const url =
      config && config.ebarimtConfig && config.ebarimtConfig.checkCompanyUrl;

    if (url) {
      const response = await sendRequest({
        url,
        method: 'GET',
        params: { regno: registerNumber }
      });

      return response;
    }

    return {
      error: 'ebarimt config error',
      message: 'Check company url is not configured'
    };
  },

  async ordersDeliveryInfo(_root, { orderId }, { subdomain }: IContext) {
    const info = await sendPosMessage({
      subdomain,
      action: 'ordersDeliveryInfo',
      data: {
        orderId: orderId
      },
      isRPC: true
    });

    if (info.error) {
      throw new Error(info.error);
    }

    return info;
  }
};

export default orderQueries;
