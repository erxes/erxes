import fetch from 'node-fetch';
import { generateModels } from '../../../connectionResolver';
import {
  IContext,
  sendPosMessage,
  sendProductsMessage,
} from '../../../messageBroker';
import {
  consumeCategory,
  consumeCustomers,
  consumeInventory,
  dealToDynamic,
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
    { brandId }: { brandId: string },
    { subdomain }: IContext
  ) {
    const configs = await getConfig(subdomain, 'DYNAMIC', {});
    const config = configs[brandId || 'noBrand'];

    const updatePrices: any[] = [];
    const createPrices: any[] = [];
    const deletePrices: any[] = [];
    const matchPrices: any[] = [];

    if (!config.priceApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not found.');
    }

    const { priceApi, username, password } = config;

    const productQry: any = { status: { $ne: 'deleted' } };

    if (brandId && brandId !== 'noBrand') {
      productQry.scopeBrandIds = { $in: [brandId] };
    } else {
      productQry.$or = [
        { scopeBrandIds: { $exists: false } },
        { scopeBrandIds: { $size: 0 } },
      ];
    }

    try {
      const productsCount = await sendProductsMessage({
        subdomain,
        action: 'count',
        data: { query: productQry },
        isRPC: true,
      });

      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          query: productQry,
          limit: productsCount,
        },
        isRPC: true,
      });

      const response = await fetch(
        `${priceApi}?$filter=Sales_Code eq 'ONLINE' or Sales_Code eq ''`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${username}:${password}`
            ).toString('base64')}`,
          },
        }
      ).then((res) => res.json());

      const groupedItems = {};
      const currentDate = new Date('2023-05-18').getTime();

      if (response && response.value.length > 0) {
        for (const item of response.value) {
          const { Item_No } = item;

          if (!groupedItems[Item_No]) {
            groupedItems[Item_No] = [];
          }

          groupedItems[Item_No].push({ ...item });
        }
      }

      const productsByCode = {};
      // delete price
      for (const product of products) {
        if (!groupedItems[product.code]) {
          deletePrices.push(product);
        } else {
          productsByCode[product.code] = product;
        }
      }

      // update price
      for (const key in groupedItems) {
        if (groupedItems.hasOwnProperty(key)) {
          const resProd = groupedItems[key];

          for (const prod of resProd) {
            const { Item_No, Unit_Price, Ending_Date, Starting_Date } =
              prod as any;

            const startDate = new Date(Starting_Date).getTime();
            const endDate = new Date(Ending_Date).getTime();

            if (startDate <= currentDate && currentDate <= endDate) {
              let minPrice = 0;

              const updateCode = Item_No.replace(/\s/g, '');

              if (minPrice === 0) {
                minPrice = Unit_Price;
              }

              if (Unit_Price < minPrice) {
                minPrice = Unit_Price;
              }

              const foundProduct = products.find(
                (product) => product.code === updateCode
              );

              if (foundProduct) {
                if (foundProduct.unitPrice === minPrice) {
                  matchPrices.push(prod);
                }
                await sendProductsMessage({
                  subdomain,
                  action: 'updateProduct',
                  data: {
                    _id: foundProduct._id,
                    doc: { unitPrice: minPrice || 0 },
                  },
                  isRPC: true,
                });
                updatePrices.push(prod);
              } else {
                createPrices.push(prod);
              }
            }
          }
        }
      }
    } catch (e) {
      console.log(e, 'error');
    }

    return {
      create: {
        count: createPrices.length,
        items: createPrices,
      },
      match: {
        count: matchPrices.length,
        items: matchPrices,
      },
      update: {
        count: updatePrices.length,
        items: updatePrices,
      },
      delete: {
        count: deletePrices.length,
        items: deletePrices,
      },
    };
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

      if (response.value.length === 0) {
        result.error.push(order._id);
      }

      if (response.value.length > 0) {
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

  async toSendMsdOrders(
    _root,
    { orderIds }: { orderIds: string[] },
    { subdomain, user }: IContext
  ) {
    let response = {} as any;
    const order = await sendPosMessage({
      subdomain,
      action: 'orders.findOne',
      data: { _id: { $in: orderIds } },
      isRPC: true,
      defaultValue: [],
    });

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
      response = await dealToDynamic(subdomain, syncLog, order, models);
    } catch (e) {
      await models.SyncLogs.updateOne(
        { _id: syncLog._id },
        { $set: { error: e.message } }
      );
    }

    return {
      _id: order._id,
      isSynced: true,
      syncedDate: response.Order_Date,
      syncedBillNumber: response.No,
      syncedCustomer: response.Sell_to_Customer_No,
    };
  },
};

export default msdynamicSyncMutations;
