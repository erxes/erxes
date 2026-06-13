import { IContext, generateModels } from '~/connectionResolvers';
import {
  consumeCategory,
  consumeInventory,
  orderToDynamic,
} from '../../../utils';
import { consumeCustomers } from '~/modules/msdynamic/utilsCustomer';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getDynamicConfig } from '../../../dynamicConfig';

export interface ISyncFailure {
  category: unknown;
  message: string;
}

/**
 * ============================
 * MS Dynamic Sync Mutations
 * ============================
 */
export const msdynamicSyncMutations = {
  /* Songogdson erxes product-uudig neg negiig ni MS Dynamic ruu sync hiine */
  async toSyncMsdProducts(
    _root: unknown,
    {
      brandId,
      action,
      products,
    }: { brandId: string; action: string; products: unknown[] },
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
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('toSyncMsdProducts error:', message);
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
    const failed: ISyncFailure[] = [];

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
        failed.push({ category, message });
      }
    }

    if (!failed.length) {
      return { status: 'success' };
    }

    return {
      status:
        failed.length === categories.length ? 'failure' : 'partial_failure',
      failedCount: failed.length,
      failed,
    };
  },

  /* Songogdson hereglegch-uudiig neg negiig ni MS Dynamic ruu sync hiine */
  async toSyncMsdCustomers(
    _root: unknown,
    {
      brandId,
      action,
      customers,
    }: { brandId: string; action: string; customers: unknown[] },
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
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        console.error('toSyncMsdCustomers error:', message);
      }
    }

    return { status: 'success' };
  },

  /* POS zahirag MS Dynamic ruu ilgeej, sync hariug temdeglene */
  async toSendMsdOrders(
    _root: unknown,
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      await models.SyncLogsMSD.updateOne(
        { _id: syncLog._id },
        { $set: { error: message } },
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
