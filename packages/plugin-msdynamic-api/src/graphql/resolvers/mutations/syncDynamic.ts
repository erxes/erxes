import { generateModels } from '../../../connectionResolver';
import { IContext, sendPosMessage } from '../../../messageBroker';
import {
  consumeCategory,
  consumeCustomers,
  consumeInventory,
  consumePrice,
  getConfig,
} from '../../../utils';

const msdynamicSyncMutations = {
  async toSyncMsdProducts(
    _root,
    {
      brandId,
      action,
      products,
    }: { brandId: string; action: string; products: any[] },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, 'DYNAMIC', {});
    const config = configs[brandId || 'noBrand'];

    try {
      switch (action) {
        case 'CREATE': {
          for (const product of products) {
            await consumeInventory(subdomain, config, product, 'create');
          }
          break;
        }
        case 'UPDATE': {
          for (const product of products) {
            await consumeInventory(subdomain, config, product, 'update');
          }
          break;
        }
        case 'DELETE': {
          for (const product of products) {
            await consumeInventory(subdomain, config, product, 'delete');
          }
          break;
        }
        default:
          break;
      }

      return {
        status: 'success',
      };
    } catch (e) {
      console.log(e, 'error');
    }
  },

  async toSyncMsdPrices(
    _root,
    {
      brandId,
      action,
      prices,
    }: { brandId: string; action: string; prices: any[] },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, 'DYNAMIC', {});
    const config = configs[brandId || 'noBrand'];

    try {
      switch (action) {
        case 'CREATE': {
          break;
        }
        case 'UPDATE': {
          for (const price of prices) {
            await consumePrice(subdomain, config, price, 'update');
          }
          break;
        }
        case 'DELETE': {
          break;
        }
        default:
          break;
      }

      return {
        status: 'success',
      };
    } catch (e) {
      console.log(e, 'error');
    }
  },

  async toSyncMsdProductCategories(
    _root,
    {
      brandId,
      action,
      categoryId,
      categories,
    }: {
      brandId: string;
      action: string;
      categoryId: string;
      categories: any[];
    },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, 'DYNAMIC', {});
    const config = configs[brandId || 'noBrand'];

    try {
      switch (action) {
        case 'CREATE': {
          for (const category of categories) {
            await consumeCategory(
              subdomain,
              config,
              categoryId,
              category,
              'create'
            );
          }
          break;
        }
        case 'UPDATE': {
          for (const category of categories) {
            await consumeCategory(
              subdomain,
              config,
              categoryId,
              category,
              'update'
            );
          }
          break;
        }
        case 'DELETE': {
          for (const category of categories) {
            await consumeCategory(subdomain, config, '', category, 'delete');
          }
          break;
        }
        default:
          break;
      }

      return {
        status: 'success',
      };
    } catch (e) {
      console.log(e, 'error');
    }
  },

  async toSyncMsdCustomers(
    _root,
    {
      brandId,
      action,
      customers,
    }: { brandId: string; action: string; customers: any[] },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, 'DYNAMIC', {});
    const config = configs[brandId || 'noBrand'];

    try {
      switch (action) {
        case 'CREATE': {
          for (const customer of customers) {
            await consumeCustomers(subdomain, config, customer, 'create');
          }
          break;
        }
        case 'UPDATE': {
          for (const customer of customers) {
            await consumeCustomers(subdomain, config, customer, 'update');
          }
          break;
        }
        case 'DELETE': {
          for (const customer of customers) {
            await consumeCustomers(subdomain, config, customer, 'delete');
          }
          break;
        }
        default:
          break;
      }

      return {
        status: 'success',
      };
    } catch (e) {
      console.log(e, 'error');
    }
  },

  async toSyncOrders(
    _root,
    { orderIds }: { orderIds: string[] },
    { subdomain, user }: IContext
  ) {
    const result: { skipped: string[]; error: string[]; success: string[] } = {
      skipped: [],
      error: [],
      success: [],
    };

    const orders = await sendPosMessage({
      subdomain,
      action: 'orders.find',
      data: { _id: { $in: orderIds } },
      isRPC: true,
      defaultValue: [],
    });

    const posTokens = [...new Set((orders || []).map((o) => o.posToken))];
    const models = await generateModels(subdomain);
    const poss = await sendPosMessage({
      subdomain,
      action: 'configs.find',
      data: { token: { $in: posTokens } },
      isRPC: true,
      defaultValue: [],
    });

    const posByToken = {};
    for (const pos of poss) {
      posByToken[pos.token] = pos;
    }

    const syncLogDoc = {
      contentType: 'pos:order',
      createdAt: new Date(),
      createdBy: user._id,
    };

    for (const order of orders) {
      const syncLog = await models.SyncLogs.syncLogsAdd({
        ...syncLogDoc,
        contentId: order._id,
        consumeData: order,
        consumeStr: JSON.stringify(order),
      });
      try {
        const pos = posByToken[order.posToken];

        // const postData = await getPostDataOrders(subdomain, pos, order);
        // if (!postData) {
        //   result.skipped.push(order._id);
        //   throw new Error('maybe, has not config');
        // }

        // const response = await sendRPCMessage(
        //   models,
        //   syncLog,
        //   'rpc_queue:erxes-automation-erkhet',
        //   {
        //     action: 'get-response-send-order-info',
        //     isEbarimt: false,
        //     payload: JSON.stringify(postData),
        //     thirdService: true,
        //     isJson: true
        //   }
        // );

        // if (response.message || response.error) {
        //   const txt = JSON.stringify({
        //     message: response.message,
        //     error: response.error
        //   });

        //   await sendPosMessage({
        //     subdomain,
        //     action: 'orders.updateOne',
        //     data: {
        //       selector: { _id: order._id },
        //       modifier: {
        //         $set: { syncErkhetInfo: txt }
        //       }
        //     },
        //     isRPC: true
        //   });
        // }

        // if (response.error) {
        //   result.error.push(order._id);
        //   continue;
        // }

        result.success.push(order._id);
      } catch (e) {
        await models.SyncLogs.updateOne(
          { _id: syncLog._id },
          { $set: { error: e.message } }
        );
      }
    }

    return result;
  },
};

export default msdynamicSyncMutations;
