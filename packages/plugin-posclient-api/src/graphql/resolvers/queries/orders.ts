import { IContext } from '../../types';
import { escapeRegExp, paginate } from '@erxes/api-utils/src/core';
import { sendRequest } from '@erxes/api-utils/src/requests';
import { sendPosMessage } from '../../../messageBroker';

interface ISearchParams {
  searchValue?: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
  customerId?: string;
}

interface IFullOrderParams extends ISearchParams {
  statuses: string[];
}

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
    {
      searchValue,
      statuses,
      page,
      perPage,
      sortField,
      sortDirection,
      customerId
    }: IFullOrderParams,
    { models, config }: IContext
  ) {
    const filter: any = {
      $or: [
        { posToken: config.token },
        { type: 'delivery', branchId: config.branchId }
      ]
    };

    if (searchValue) {
      filter.number = { $regex: new RegExp(escapeRegExp(searchValue), 'i') };
    }
    if (customerId) {
      filter.customerId = customerId;
    }
    const sort: { [key: string]: any } = {};

    if (sortField) {
      sort[sortField] = sortDirection;
    } else {
      sort.createdAt = 1;
    }

    return paginate(
      models.Orders.find({
        ...filter,
        status: { $in: statuses }
      })
        .sort(sort)
        .lean(),
      { page, perPage }
    );
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
