import { IContext } from '../../types';
import { escapeRegExp, paginate } from '@erxes/api-utils/src/core';
import { sendRequest } from '@erxes/api-utils/src/requests';
import { sendPosMessage } from '../../../messageBroker';
import { IConfig } from '../../../models/definitions/configs';

interface ISearchParams {
  searchValue?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
  customerId?: string;
}

interface IFullOrderParams extends ISearchParams {
  statuses: string[];
}

export const getPureDate = (date: Date, multiplier = 1) => {
  const ndate = new Date(date);
  const diffTimeZone =
    multiplier * Number(process.env.TIMEZONE || 0) * 1000 * 60 * 60;
  return new Date(ndate.getTime() - diffTimeZone);
};

const generateFilter = (config: IConfig, params: IFullOrderParams) => {
  const { searchValue, statuses, customerId, startDate, endDate } = params;
  const filter: any = {
    $or: [
      { posToken: config.token },
      { type: 'delivery', branchId: config.branchId }
    ]
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

  const dateQry: any = {};
  if (startDate) {
    dateQry.$gte = getPureDate(startDate);
  }
  if (endDate) {
    dateQry.$lte = getPureDate(endDate);
  }
  if (Object.keys(dateQry).length) {
    filter.modifiedAt = dateQry;
  }

  return { ...filter, status: { $in: statuses } };
};

const orderQueries = {
  orders(
    _root,
    { searchValue, page, perPage }: ISearchParams,
    { models, config }: IContext
  ) {
    const filter: any = { posToken: config.token };

    if (searchValue) {
      filter.number = { $regex: new RegExp(escapeRegExp(searchValue), 'i') };
    }

    return paginate(
      models.Orders.find(filter)
        .sort({ createdAt: -1 })
        .lean(),
      {
        page,
        perPage
      }
    );
  },

  async fullOrders(
    _root,
    params: IFullOrderParams,
    { models, config }: IContext
  ) {
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
  },

  async ordersTotalCount(
    _root,
    params: IFullOrderParams,
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
    }: IFullOrderParams,
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
