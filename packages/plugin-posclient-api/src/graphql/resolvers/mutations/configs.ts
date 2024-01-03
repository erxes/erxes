import { authCookieOptions } from '@erxes/api-utils/src/core';
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
import { initBroker, sendPosMessage } from '../../../messageBroker';
import { IOrderItemDocument } from '../../../models/definitions/orderItems';
import { redis } from '@erxes/api-utils/src/serviceDiscovery';
import { sendRequest } from '@erxes/api-utils/src/requests';
import { app } from '../../../configs';
import { IPutResponseDocument } from '../../../models/definitions/putResponses';

const configMutations = {
  posConfigsFetch: async (
    _root,
    { token },
    { models, subdomain }: IContext
  ) => {
    const address = await getServerAddress(subdomain);

    const config = await models.Configs.createConfig(token, 'init');

    try {
      const response = await sendRequest({
        url: `${address}/pos-init`,
        method: 'get',
        headers: { 'POS-TOKEN': token }
      });
      if (response && !response.error) {
        const {
          pos = {},
          adminUsers = [],
          cashiers = [],
          productGroups = [],
          slots = []
        } = response;

        validateConfig(pos);

        await models.Configs.updateConfig(config._id, {
          ...(await extractConfig(subdomain, pos)),
          token
        });

        await importUsers(models, cashiers, token);
        await importUsers(models, adminUsers, token, true);
        await importSlots(models, slots, token);
        await importProducts(subdomain, models, token, productGroups);
      } else {
        await models.Configs.deleteOne({ token });
        throw new Error(response ? response.error : 'cant connect server');
      }
    } catch (e) {
      await models.Configs.deleteOne({ token });
      throw new Error(e.message);
    }

    const { RABBITMQ_HOST, MESSAGE_BROKER_PREFIX } = process.env;

    const messageBrokerClient = await initBrokerMain(
      {
        RABBITMQ_HOST,
        MESSAGE_BROKER_PREFIX,
        redis,
        app
      },
      initBroker
    );

    await initBroker(messageBrokerClient)
      .then(() => {
        console.log('Message broker has started.');
      })
      .catch(e => {
        console.log(
          `Error occurred when starting message broker: ${e.message}`
        );
      });

    return config;
  },

  async syncConfig(_root, { type }, { models, subdomain, config }: IContext) {
    const address = await getServerAddress(subdomain);
    const { token } = config;

    const response = await sendRequest({
      url: `${address}/pos-sync-config`,
      method: 'get',
      headers: { 'POS-TOKEN': config.token || '' },
      body: { token, type },
      timeout: 300000
    });

    if (!response) {
      return;
    }

    switch (type) {
      case 'config':
        const { pos = {}, adminUsers = [], cashiers = [] } = response;
        await models.Configs.updateConfig(config._id, {
          ...(await extractConfig(subdomain, pos)),
          token: config.token
        });

        await importUsers(models, cashiers, config.token);
        await importUsers(models, adminUsers, config.token, true);

        break;
      case 'products':
        const { productGroups = [] } = response;
        await preImportProducts(models, token, productGroups);
        await importProducts(subdomain, models, token, productGroups);
        break;
      case 'slots':
        const { slots = [] } = response;
        await importSlots(models, slots, token);
        break;
      case 'productsConfigs':
        await models.ProductsConfigs.createOrUpdateConfig({
          code: 'similarityGroup',
          value: response
        });
        break;
    }
    return 'success';
  },

  async syncOrders(_root, _param, { models, subdomain, config }: IContext) {
    const unSyncedPutResponses: IPutResponseDocument[] = await models.PutResponses.find(
      { synced: { $ne: true } }
    )
      .sort({ paidDate: 1 })
      .limit(100)
      .lean();
    const putResContentIds = unSyncedPutResponses.map(pr => pr.contentId);

    const orderFilter = {
      $and: [
        { posToken: config.token },
        {
          $or: [
            {
              synced: { $ne: true },
              paidDate: { $exists: true, $ne: null }
            },
            { _id: { $in: putResContentIds } }
          ]
        }
      ]
    };

    let sumCount = await models.Orders.find({ ...orderFilter }).count();
    const orders = await models.Orders.find({ ...orderFilter })
      .sort({ paidDate: 1 })
      .limit(100)
      .lean();

    const data: any[] = [];
    const orderIds = orders.map(o => o._id);
    const orderItems: IOrderItemDocument[] = await models.OrderItems.find({
      orderId: { $in: orderIds }
    }).lean();

    const putResponses = await models.PutResponses.find({
      contentId: { $in: orderIds }
    }).lean();

    for (const order of orders) {
      const perData: any = {
        posToken: config.token,
        order
      };
      perData.items = (orderItems || []).filter(
        item => item.orderId === order._id
      );
      perData.responses = (putResponses || []).filter(
        pr => pr.contentId === order._id
      );

      data.push(perData);
    }

    if (data.length) {
      await sendPosMessage({
        subdomain,
        action: 'createOrUpdateOrdersMany',
        data: { posToken: config.token, syncOrders: data }
      });
    }

    return {
      kind: 'order',
      sumCount,
      syncedCount: orders.length
    };
  },

  async deleteOrders(_root, _param, { models }: IContext) {
    // const orderFilter = {
    //   synced: false,
    //   status: ORDER_STATUSES.NEW
    // };

    // const count = await models.Orders.find({ ...orderFilter }).count();

    // await models.Orders.deleteMany({ ...orderFilter });

    return {
      deletedCount: 0
    };
  },

  posChooseConfig: async (
    _root,
    { token }: { token: string },
    { res, models }: IContext
  ) => {
    const config = await models.Configs.findOne({ token });

    if (!config) {
      throw new Error('token not found');
    }

    res.cookie(
      'pos-config-token',
      token,
      authCookieOptions({ sameSite: 'none' })
    );

    return 'chosen';
  }
};

export default configMutations;
