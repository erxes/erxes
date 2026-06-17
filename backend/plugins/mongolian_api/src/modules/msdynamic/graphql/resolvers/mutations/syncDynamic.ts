import { IContext, generateModels } from '~/connectionResolvers';
import { consumeInventory, orderToDynamic } from '../../../utils';
import { consumeCustomers } from '~/modules/msdynamic/utilsCustomer';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

/**
 * Get DYNAMIC config from mnconfigs module
 */
const getDynamicConfig = async (models: any, brandId?: string) => {
  const configs = await models.Configs.getConfigs('DYNAMIC');

  if (!configs?.length) {
    throw new Error('MS Dynamic config not found.');
  }

  const map = configs.reduce((acc: any, conf: any) => {
    acc[conf.subId || 'noBrand'] = conf.value;
    return acc;
  }, {});

  const key = brandId || 'noBrand';
  let config = map[key];

  if (!config && map['noBrand'] && typeof map['noBrand'] === 'object') {
    config = map['noBrand'][key];
  }

  if (!config) {
    throw new Error('MS Dynamic config not found.');
  }

  return config;
};

/**
 * ============================
 * MS Dynamic Sync Mutations
 * ============================
 */
export const msdynamicSyncMutations = {
  async toSyncMsdPrices(
    _root,
    {
      prices,
    }: {
      prices: {
        Item_No?: string;
        code?: string;
        Unit_Price?: number;
        unitPrice?: number;
      }[];
    },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('msdSync');

    const results = { succeeded: 0, failed: 0, skipped: 0 };

    for (const price of prices || []) {
      try {
        const code = price.Item_No || price.code;
        if (!code) {
          results.skipped++;
          continue;
        }

        const product = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'products',
          action: 'findOne',
          input: { query: { code } },
          defaultValue: null,
        });

        if (!product) {
          results.skipped++;
          continue;
        }

        const newPrice = price.Unit_Price ?? price.unitPrice;
        if (newPrice == null) {
          results.skipped++;
          continue;
        }

        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'products',
          action: 'updateProduct',
          input: {
            _id: product._id,
            doc: { unitPrice: newPrice },
          },
          defaultValue: {},
        });

        results.succeeded++;
      } catch (e) {
        console.error(
          'toSyncMsdPrices error:',
          e instanceof Error ? e.message : e,
        );
        results.failed++;
      }
    }

    return { status: 'success', ...results };
  },

  async toSyncMsdProducts(
    _root,
    {
      brandId,
      action,
      products,
    }: { brandId: string; action: string; products: any[] },
    { subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('msdSync');

    const models = await generateModels(subdomain);
    const config = await getDynamicConfig(models, brandId);

    for (const product of products || []) {
      try {
        await consumeInventory(
          subdomain,
          config,
          product,
          action.toLowerCase(),
          user,
        );
      } catch (e: any) {
        console.error('toSyncMsdProducts error:', e?.message);
      }
    }

    return { status: 'success' };
  },

  async toSyncMsdCustomers(
    _root,
    {
      brandId,
      action,
      customers,
    }: { brandId: string; action: string; customers: any[] },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('msdSync');

    const models = await generateModels(subdomain);
    const config = await getDynamicConfig(models, brandId);

    for (const customer of customers || []) {
      try {
        await consumeCustomers(
          subdomain,
          config,
          customer,
          action.toLowerCase(),
        );
      } catch (e: any) {
        console.error('toSyncMsdCustomers error:', e?.message);
      }
    }

    return { status: 'success' };
  },

  async toSendMsdOrders(
    _root,
    { orderIds }: { orderIds: string[] },
    { subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('msdSync');

    const models = await generateModels(subdomain);

    const order = await sendTRPCMessage({
      subdomain,
      pluginName: 'pos',
      module: 'orders',
      action: 'findOne',
      input: { _id: { $in: orderIds } },
      defaultValue: {},
    });

    if (!order?._id) {
      throw new Error('Order not found');
    }

    const config = await getDynamicConfig(models, order.scopeBrandIds?.[0]);

    const syncLog = await models.SyncLogsMSD.syncLogsAdd({
      contentType: 'pos:order',
      contentId: order._id,
      createdAt: new Date(),
      createdBy: user?._id,
      consumeData: order,
      consumeStr: JSON.stringify(order),
    });

    let response;

    try {
      response = await orderToDynamic(
        subdomain,
        models,
        syncLog,
        order,
        config,
      );
    } catch (e: any) {
      await models.SyncLogsMSD.updateOne(
        { _id: syncLog._id },
        { $set: { error: e?.message } },
      );
      throw e;
    }

    return {
      _id: order._id,
      isSynced: true,
      syncedDate: response?.Order_Date,
      syncedBillNumber: response?.No,
      syncedCustomer: response?.Sell_to_Customer_No,
    };
  },
};
