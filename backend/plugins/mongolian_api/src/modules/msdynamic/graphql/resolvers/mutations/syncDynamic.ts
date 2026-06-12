import { IContext, generateModels } from '~/connectionResolvers';
import {
  consumeCategory,
  consumeInventory,
  orderToDynamic,
} from '../../../utils';
import { consumeCustomers } from '~/modules/msdynamic/utilsCustomer';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

/**
 * Get DYNAMIC config from mnconfigs module
 */
const normalizeDynamicConfigs = (configsMap: Record<string, any>) => {
  return Object.entries(configsMap || {}).reduce((acc: any, [key, value]) => {
    acc[key || 'noBrand'] = {
      ...value,
      brandId: value?.brandId || key || 'noBrand',
    };
    return acc;
  }, {});
};

const pickDynamicConfig = (
  configsMap: Record<string, any>,
  brandId?: string,
) => {
  const hasSelectedBrand = brandId && brandId !== 'noBrand';
  const config = hasSelectedBrand
    ? configsMap[brandId]
    : configsMap.noBrand || configsMap[''] || Object.values(configsMap)[0];

  if (!config) {
    throw new Error(
      hasSelectedBrand
        ? `MS Dynamic config not found for selected brand: ${brandId}`
        : 'MS Dynamic config not found.',
    );
  }

  return config.brandId ? config : { ...config, brandId: brandId || 'noBrand' };
};

const getDynamicConfig = async (models: any, brandId?: string) => {
  const groupedConfig = await models.Configs.getConfig('DYNAMIC', '');

  if (groupedConfig?.value && Object.keys(groupedConfig.value).length) {
    return pickDynamicConfig(
      normalizeDynamicConfigs(groupedConfig.value),
      brandId,
    );
  }

  const configs = await models.Configs.getConfigs('DYNAMIC');

  if (!configs?.length) {
    throw new Error('MS Dynamic config not found.');
  }

  const configsMap = configs.reduce((acc: any, conf: any) => {
    acc[conf.subId || 'noBrand'] = conf.value;
    return acc;
  }, {});

return pickDynamicConfig(normalizeDynamicConfigs(configsMap), brandId);
};

/**
 * ============================
 * MS Dynamic Sync Mutations
 * ============================
 */
export const msdynamicSyncMutations = {
  /* Songogdson erxes product-uudig neg negiig ni MS Dynamic ruu sync hiine */
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

  /* Songogdson product angilal-uudiig neg negiig ni MS Dynamic ruu sync hiine */
  async toSyncMsdProductCategories(
    _root: unknown,
    {
      brandId,
      action,
      categoryId,
      categories,
    }: {
      brandId: string;
      action: string;
      categoryId?: string;
      categories: unknown[];
    },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('msdSync');

    const models = await generateModels(subdomain);
    const config = await getDynamicConfig(models, brandId);

    for (const category of categories || []) {
      try {
        await consumeCategory(
          subdomain,
          config,
          categoryId,
          category,
          action.toLowerCase(),
        );
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('toSyncMsdProductCategories error:', message);
      }
    }

    return { status: 'success' };
  },

  /* Songogdson hereglegch-uudiig neg negiig ni MS Dynamic ruu sync hiine */
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

  /* POS zahirag MS Dynamic ruu ilgeej, sync hariug temdeglene */
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
