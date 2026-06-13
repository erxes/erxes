import fetch from 'node-fetch';
import { IContext, generateModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getDynamicConfig } from '../../../dynamicConfig';

export interface IProductCode {
  code?: string;
}

export interface IDynamicProduct {
  No?: string;
}

export interface IProductCategory {
  _id?: string;
  code?: string;
}

export interface IDynamicCategory {
  Code?: string;
  Parent_Category?: string;
}

/**
 * ============================
 * MS Dynamic Check Mutations
 * ============================
 */
export const msdynamicCheckMutations = {
  /* MS Dynamic product-iig erxes product-tei shalgaj, niitlel dun butsaana */
  async toCheckMsdProducts(
    _root: unknown,
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

    const products = (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: { query: { status: { $ne: 'deleted' } } },
      defaultValue: [],
    })) as IProductCode[];

    const productCodes = products.map((product) => product.code);

    const response = (await fetch(
      `${itemApi}?$filter=Item_Category_Code ne '' and Blocked ne true and Allow_Ecommerce eq true`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
      },
    ).then((r) => r.json())) as { value?: IDynamicProduct[] };

    const resultCodes = response?.value?.map((result) => result.No) || [];

    return {
      create: resultCodes.filter((code) => !productCodes.includes(code)).length,
      delete: productCodes.filter((code) => !resultCodes.includes(code)).length,
      matched: resultCodes.filter((code) => productCodes.includes(code)).length,
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
    const hasSelectedCategory = Boolean(
      categoryId && categoryId !== 'noCategory',
    );

    const categoryQuery: {
      status: { $ne: string };
      parentId?: string;
    } = {
      status: { $ne: 'deleted' },
    };

    let parentCategoryCode: string | undefined;

    if (hasSelectedCategory) {
      categoryQuery.parentId = categoryId;

      const parentCategory = (await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'productCategories',
        action: 'findOne',
        input: { query: { _id: categoryId } },
        defaultValue: null,
      })) as IProductCategory | null;

      parentCategoryCode = parentCategory?.code;
    }

    const productCategories = (await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'productCategories',
      action: 'find',
      input: { query: categoryQuery },
      defaultValue: [],
    })) as IProductCategory[];

    const response = (await fetch(itemCategoryApi, {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString(
          'base64',
        )}`,
      },
    }).then((r) => r.json())) as { value?: IDynamicCategory[] };

    const dynamicCategories = Array.isArray(response?.value)
      ? response.value.filter((category) =>
          hasSelectedCategory
            ? category.Parent_Category === parentCategoryCode
            : true,
        )
      : [];

    const productCategoryCodes = productCategories
      .map((category) => category.code)
      .filter(Boolean);

    const dynamicCategoryCodes = dynamicCategories
      .map((category) => category.Code)
      .filter(Boolean);

    return {
      create: {
        items: dynamicCategories.filter(
          (category) =>
            category.Code && !productCategoryCodes.includes(category.Code),
        ),
      },
      update: {
        items: dynamicCategories.filter(
          (category) =>
            category.Code && productCategoryCodes.includes(category.Code),
        ),
      },
      delete: {
        items: productCategories.filter(
          (category) =>
            category.code && !dynamicCategoryCodes.includes(category.code),
        ),
      },
    };
  },
};
