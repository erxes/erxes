import { sendGraphQLRequest } from './utils';
import { IContext } from '../../types';
import { escapeRegExp, paginate } from '@erxes/api-utils/src/core';
import { sendRequest } from '@erxes/api-utils/src/requests';

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
    { models }: IContext
  ) {
    const filter: any = {};

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
    { models }: IContext
  ) {
    const filter: any = {};

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

  async orderDetail(
    _root,
    { _id, customerId }: { _id: string; customerId?: string },
    { posUser, models }: IContext
  ) {
    if (posUser) {
      return models.Orders.findOne({ _id });
    }

    if (!customerId) {
      throw new Error('Not found');
    }

    return models.Orders.findOne({ _id, customerId });
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

  async ordersDeliveryInfo(_root, { orderId }) {
    return sendGraphQLRequest({
      query: `
        query ordersDeliveryInfo($orderId: String!) {
          ordersDeliveryInfo(orderId: $orderId) {
            _id
            status
            date
          }
        }
      `,
      name: 'ordersDeliveryInfo',
      variables: { orderId }
    });
  }
};

export default orderQueries;
