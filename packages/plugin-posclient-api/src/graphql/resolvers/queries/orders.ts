import { sendGraphQLRequest } from './utils';
import { IContext } from '../../types';
import { escapeRegExp, paginate, sendRequest } from '../../utils/commonUtils';

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
  orders(_root, models, { searchValue, page, perPage }: ISearchParams) {
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

  fullOrders(
    _root,
    models,
    {
      searchValue,
      statuses,
      page,
      perPage,
      sortField,
      sortDirection,
      customerId
    }: IFullOrderParams
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

  orderDetail(_root, models, { _id }) {
    return models.Orders.findOne({ _id });
  },

  async ordersCheckCompany(_root, { registerNumber }, {}: IContext) {
    if (!registerNumber) {
      throw new Error('Company register number required for checking');
    }

    if ('') {
      const response = await sendRequest({
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
