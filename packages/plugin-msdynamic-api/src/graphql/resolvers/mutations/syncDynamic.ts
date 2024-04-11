import fetch from 'node-fetch';
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

  async toSyncMsdOrders(
    _root,
    { orderIds }: { orderIds: string[] },
    { subdomain, user }: IContext
  ) {
    const result: { skipped: string[]; error: string[]; success: string[] } = {
      skipped: [],
      error: [],
      success: [],
    };

    const order = await sendPosMessage({
      subdomain,
      action: 'orders.findOne',
      data: { _id: { $in: orderIds } },
      isRPC: true,
      defaultValue: [],
    });

    const configs = await getConfig(subdomain, 'DYNAMIC', {});
    const config = configs[order.scopeBrandIds[0] || 'noBrand'];

    if (!config.salesApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not found.');
    }

    const { salesApi, username, password } = config;

    const syncLogDoc = {
      contentType: 'pos:order',
      createdAt: new Date(),
      createdBy: user._id,
    };
    const models = await generateModels(subdomain);

    const syncLog = await models.SyncLogs.syncLogsAdd({
      ...syncLogDoc,
      contentId: order._id,
      consumeData: order,
      consumeStr: JSON.stringify(order),
    });
    try {
      const response = await fetch(
        `${salesApi}?$filter=No eq '${order.syncErkhetInfo}'`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${username}:${password}`
            ).toString('base64')}`,
          },
          timeout: 60000,
        }
      ).then((r) => r.json());

      if (response.message || response.error) {
        const txt = JSON.stringify({
          message: response.message,
          error: response.error,
        });

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
      }
    } catch (e) {
      await models.SyncLogs.updateOne(
        { _id: syncLog._id },
        { $set: { error: e.message } }
      );
    }

    return result;
  },
};

export default msdynamicSyncMutations;
