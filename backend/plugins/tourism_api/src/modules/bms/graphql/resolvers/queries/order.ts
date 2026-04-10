import { Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const orderQueries: Record<string, Resolver> = {
  async bmsOrders(
    _root,
    { tourId, customerId, branchId, ...params },
    { models }: IContext,
  ) {
    const selector: any = {};
    if (tourId) {
      selector.tourId = tourId;
    }
    if (customerId) {
      selector.customerId = customerId;
    }

    if (branchId) {
      selector.branchId = branchId;
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Orders,
      params,
      query: selector,
    });

    return { list, totalCount, pageInfo };
  },

  async cpBmsOrders(
    _root,
    { tourId, customerId, branchId, ...params },
    { models }: IContext,
  ) {
    const selector: any = {};
    if (tourId) {
      selector.tourId = tourId;
    }
    if (customerId) {
      selector.customerId = customerId;
    }

    if (branchId) {
      selector.branchId = branchId;
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Orders,
      params,
      query: selector,
    });

    return { list, totalCount, pageInfo };
  },

  async bmsOrderDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Orders.getOrder(_id);
  },

  async bmsOrderCustomerIds(
    _root,
    { tourId, branchId }: { tourId: string},
    { models }: IContext,
  ) {
    const selector: Record<string, string> = { tourId };

    const orders = await models.Orders.find(selector, {
      customerId: 1,
      additionalCustomers: 1,
    }).lean();

    return Array.from(
      new Set(
        orders.flatMap((order) => [
          ...(order.customerId ? [order.customerId] : []),
          ...(Array.isArray(order.additionalCustomers)
            ? order.additionalCustomers.filter(
                (customerId): customerId is string => !!customerId,
              )
            : []),
        ]),
      ),
    );
  },
};

export default orderQueries;

orderQueries.cpBmsOrders.wrapperConfig = {
  forClientPortal: true,
};
