import fetch from 'node-fetch';
import { IContext, generateModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getDynamicConfig } from '../../../dynamicConfig';

/**
 * ============================
 * MS Dynamic Check Mutations
 * ============================
 */
export const msdynamicCheckMutations = {
  /* MS Dynamic product-iig erxes product-tei shalgaj, niitlel dun butsaana */
  async toCheckMsdProducts(
    _root,
    { brandId }: { brandId: string },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('msdCheck');

    const models = await generateModels(subdomain);
    const config = await getDynamicConfig(models, brandId);

    if (!config.itemApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not valid.');
    }

    const { itemApi, username, password } = config;

    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: { query: { status: { $ne: 'deleted' } } },
      defaultValue: [],
    });

    const productCodes = products.map((p: any) => p.code);

    const response = await fetch(
      `${itemApi}?$filter=Item_Category_Code ne '' and Blocked ne true and Allow_Ecommerce eq true`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
      },
    ).then((r) => r.json());

    const resultCodes = response?.value?.map((r: any) => r.No) || [];

    return {
      create: resultCodes.filter((c: string) => !productCodes.includes(c))
        .length,
      delete: productCodes.filter((c: string) => !resultCodes.includes(c))
        .length,
      matched: resultCodes.filter((c: string) => productCodes.includes(c))
        .length,
    };
  },

  async toCheckMsdSynced(
    _root: unknown,
    { ids = [] }: { ids?: string[] },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('msdCheck');

    const models = await generateModels(subdomain);

    const syncLogs = await models.SyncLogsMSD.find({
      contentType: 'pos:order',
      contentId: { $in: ids },
      error: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .lean();

    const syncMap: Record<
      string,
      {
        isSynced: boolean;
        syncedDate?: string;
        syncedBillNumber?: string;
        syncedCustomer?: string;
      }
    > = {};

    for (const log of syncLogs) {
      const existing = syncMap[log.contentId];

      if (!existing && log.responseData?.No) {
        syncMap[log.contentId] = {
          isSynced: true,
          syncedDate: log.responseData.Order_Date,
          syncedBillNumber: log.responseData.No,
          syncedCustomer: log.responseData.Sell_to_Customer_No,
        };
      }
    }

    return ids.map((_id) => ({
      _id,
      isSynced: Boolean(syncMap[_id]),
      syncedDate: syncMap[_id]?.syncedDate || null,
      syncedBillNumber: syncMap[_id]?.syncedBillNumber || null,
      syncedCustomer: syncMap[_id]?.syncedCustomer || null,
    }));
  },

  /* MS Dynamic angilal-iig erxes angilal-tai shalgaj, sync uildluudig buleglene */
  async toCheckMsdProductCategories(
    _root: unknown,
    { brandId, categoryId }: { brandId: string; categoryId?: string },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('msdCheck');

    const models = await generateModels(subdomain);
    const config = await getDynamicConfig(models, brandId);

    if (!config.itemCategoryApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not valid.');
    }

    const { itemCategoryApi, username, password } = config;

    const categoryQuery: {
      status: { $ne: string };
      parentId?: string;
    } = {
      status: { $ne: 'deleted' },
    };

    if (categoryId && categoryId !== 'noCategory') {
      categoryQuery.parentId = categoryId;
    }

    const productCategories = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'productCategories',
      action: 'find',
      input: { query: categoryQuery },
      defaultValue: [],
    });

    const response = await fetch(itemCategoryApi, {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
          'base64',
        )}`,
      },
    }).then((r) => r.json());

    const dynamicCategories = Array.isArray(response?.value)
      ? response.value
      : [];

    const productCategoryCodes = productCategories
      .map((category: { code?: string }) => category.code)
      .filter(Boolean);

    const dynamicCategoryCodes = dynamicCategories
      .map((category: { Code?: string }) => category.Code)
      .filter(Boolean);

    return {
      create: {
        items: dynamicCategories.filter(
          (category: { Code?: string }) =>
            category.Code && !productCategoryCodes.includes(category.Code),
        ),
      },
      update: {
        items: dynamicCategories.filter(
          (category: { Code?: string }) =>
            category.Code && productCategoryCodes.includes(category.Code),
        ),
      },
      delete: {
        items: productCategories.filter(
          (category: { code?: string }) =>
            category.code && !dynamicCategoryCodes.includes(category.code),
        ),
      },
    };
  },
};
