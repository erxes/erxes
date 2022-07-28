import { debugError, debugInfo } from '@erxes/api-utils/src/debuggers';
import {
  extractConfig,
  getServerAddress,
  importProducts,
  importSlots,
  importUsers,
  preImportProducts,
  validateConfig
} from '../../utils/syncUtils';
import { IContext } from '../../../connectionResolver';
import { init as initBrokerMain } from '@erxes/api-utils/src/messageBroker';
import { initBroker } from '../../../messageBroker';
import { IOrderItemDocument } from '../../../models/definitions/orderItems';
import { ORDER_STATUSES } from '../../../models/definitions/constants';
import { redis } from '@erxes/api-utils/src/serviceDiscovery';
import { sendRequest } from '@erxes/api-utils/src/requests';

const configMutations = {
  posConfigsFetch: async (_root, { token }, { models }: IContext) => {
    const address = await getServerAddress();

    const config = await models.Configs.createConfig(token);

    const response = await sendRequest({
      url: `${address}/pos-init`,
      method: 'get',
      headers: { 'POS-TOKEN': token }
    });
    if (response) {
      const {
        pos = {},
        adminUsers = [],
        cashiers = [],
        productGroups = [],
        qpayConfig,
        slots = []
      } = response;

      validateConfig(pos);

      await models.Configs.updateConfig(config._id, {
        ...(await extractConfig(pos)),
        syncInfo: pos.syncInfo,
        qpayConfig
      });

      await importUsers(models, cashiers);
      await importUsers(models, adminUsers, true);
      await importSlots(models, slots);
      await importProducts(models, productGroups);
    }

    const { RABBITMQ_HOST, MESSAGE_BROKER_PREFIX } = process.env;

    const messageBrokerClient = await initBrokerMain({
      RABBITMQ_HOST,
      MESSAGE_BROKER_PREFIX,
      redis
    });

    await initBroker(messageBrokerClient)
      .then(() => {
        debugInfo('Message broker has started.');
      })
      .catch(e => {
        debugError(`Error occurred when starting message broker: ${e.message}`);
      });

    return config;
  },

  async syncConfig(_root, { type }, { models }: IContext) {
    const address = await getServerAddress();

    const config = await models.Configs.findOne({}).lean();
    const syncId = (config.syncInfo || {}).id;
    const response = await sendRequest({
      url: `${address}/pos-sync-config`,
      method: 'get',
      headers: { 'POS-TOKEN': config.token || '' },
      body: { syncId, type }
    });

    if (!response) {
      return;
    }

    switch (type) {
      case 'config':
        const {
          pos = {},
          adminUsers = [],
          cashiers = [],
          slots = [],
          qpayConfig
        } = response;

        await models.Configs.updateConfig(config._id, {
          ...(await extractConfig(pos)),
          syncInfo: pos.syncInfo || {},
          qpayConfig
        });

        await importUsers(models, cashiers);
        await importUsers(models, adminUsers);
        await importSlots(models, slots);

        break;
      case 'products':
        const { productGroups = [] } = response;
        await preImportProducts(models, productGroups);
        await importProducts(models, productGroups);
        break;
    }

    await models.Configs.updateOne(
      { _id: config._id },
      { $set: { syncInfo: { id: syncId, date: new Date() } } }
    );

    return 'success';
  },

  async syncOrders(_root, _param, { models }: IContext) {
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
      const orderItems: IOrderItemDocument[] = await models.OrderItems.find({
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
    const syncId = config.syncInfo.id;
    const address = await getServerAddress();

    try {
      const response = await sendRequest({
        url: `${address}/pos-sync-orders`,
        method: 'post',
        headers: { 'POS-TOKEN': config.token || '' },
        body: { syncId, orders, putResponses }
      });

      const { error, resOrderIds, putResponseIds } = response;

      if (error) {
        throw new Error(error);
      }

      await models.Orders.updateMany(
        { _id: { $in: resOrderIds } },
        { $set: { synced: true } }
      );
      await models.PutResponses.updateMany(
        { _id: { $in: putResponseIds } },
        { $set: { synced: true } }
      );
    } catch (e) {
      throw new Error(e.message);
    }

    return {
      kind,
      sumCount,
      syncedCount: orders.length
    };
  },

  async deleteOrders(_root, _param, { models }: IContext) {
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
