import { debugError, debugInit } from '../../../debugger';
import { initBroker } from '../../../messageBroker';
import { IOrderItemDocument } from '../../../models/definitions/orderItems';
import { OrderItems } from '../../../models/OrderItems';

import { ORDER_STATUSES } from '../../../models/definitions/constants';
import { IContext } from '../../../connectionResolver';

let cl;

const configMutations = {
  posConfigsFetch: async (_root, { token }, { models }: IContext) => {
    console.log('ddddddddddddddddddddddddd');
    const { REACT_APP_MAIN_API_DOMAIN } = process.env;

    const config = await models.Configs.createConfig(token);

    initBroker(cl)
      .then(() => {
        debugInit('Message broker has started.');
      })
      .catch(e => {
        debugError(`Error occurred when starting message broker: ${e.message}`);
      });

    return config;
  },

  async syncConfig(_root, { type }, models) {
    const { REACT_APP_MAIN_API_DOMAIN } = process.env;

    const config = await models.Configs.findOne({}).lean();

    await models.Configs.updateOne(
      { _id: config._id },
      { $set: { 'syncInfo.date': new Date() } }
    );

    return 'success';
  },

  async syncOrders(_root, _param, models) {
    const { REACT_APP_MAIN_API_DOMAIN } = process.env;

    const orderFilter = {
      synced: false,
      status: { $in: ORDER_STATUSES.FULL },
      paidDate: { $exists: true, $ne: null }
    };
    let sumCount = await models.Orders.find({ ...orderFilter }).count();
    const orders = await models.Orders.find({ ...orderFilter })
      .sort({ paidDate: 1 })
      .limit(100)
      .lean();

    let kind = 'order';
    let putResponses = [];

    if (orders.length) {
      const orderIds = orders.map(o => o._id);
      const orderItems: IOrderItemDocument[] = await OrderItems.find({
        orderId: { $in: orderIds }
      }).lean();

      for (const order of orders) {
        order.items = (orderItems || []).filter(
          item => item.orderId === order._id
        );
      }

      putResponses = await models.PutResponses.find({
        contentId: { $in: orderIds },
        synced: false
      }).lean();
    } else {
      kind = 'putResponse';
      sumCount = await models.PutResponses.find({ synced: false }).count();
      putResponses = await models.PutResponses.find({ synced: false })
        .sort({ paidDate: 1 })
        .limit(100)
        .lean();
    }

    const config = await models.Configs.getConfig({});

    return {
      kind,
      sumCount,
      syncedCount: orders.length
    };
  },

  async deleteOrders(_root, _param, models) {
    const orderFilter = {
      synced: false,
      status: ORDER_STATUSES.NEW
    };

    const count = await models.Orders.find({ ...orderFilter }).count();

    await models.Orders.deleteMany({ ...orderFilter });

    return {
      deletedCount: count
    };
  }
};

export default configMutations;
