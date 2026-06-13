import { IContext, generateModels } from '~/connectionResolvers';
import {
  consumeCategory,
  consumeInventory,
  orderToDynamic,
} from '../../../utils';
import { consumeCustomers } from '~/modules/msdynamic/utilsCustomer';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getDynamicConfig } from '../../../dynamicConfig';

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
