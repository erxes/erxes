import { skip } from 'node:test';
import { IContext } from '../../../connectionResolver';

const orderQueries = {
  async bmOrders(_root, { tourId, customerId }, { models }: IContext) {
    const selector: any = {};
    if (tourId) {
      selector.tourId = tourId;
    }
    if (customerId) {
      selector.customerId = customerId;
    }
    const list = await models.Orders.find(selector);
    // const total = await models.Tours.countDocuments();
    return {
      list,
      total: list.length,
    };
  },
};

export default orderQueries;
