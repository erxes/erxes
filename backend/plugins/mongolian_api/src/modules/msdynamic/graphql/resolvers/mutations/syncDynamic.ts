import fetch from 'node-fetch';
import { IContext, generateModels } from '~/connectionResolvers';
import {
  consumeCategory,
  consumeInventory,
  getExchangeRates,
  getPrice,
  orderToDynamic,
} from '../../../utils';
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

  const config = map[brandId || 'noBrand'];

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
  async toSyncMsdProducts(
    _root,
    {
      brandId,
      action,
      products,
    }: { brandId: string; action: string; products: any[] },
    { subdomain, user }: IContext,
  ) {
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
    { subdomain }: IContext,
  ) {
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
    { subdomain, user }: IContext,
  ) {
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

    const syncLog = await models.SyncLogs.syncLogsAdd({
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
      await models.SyncLogs.updateOne(
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
