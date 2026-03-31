import { Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const orderQueries: Record<string, Resolver>= {
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
};

export default orderQueries;

orderQueries.cpBmsOrders.wrapperConfig={
  forClientPortal:true,
}

