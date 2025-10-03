import { cursorPaginate } from 'erxes-api-shared/src/utils';
import { IContext } from '~/connectionResolvers';

const orderQueries = {
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
};

export default orderQueries;
