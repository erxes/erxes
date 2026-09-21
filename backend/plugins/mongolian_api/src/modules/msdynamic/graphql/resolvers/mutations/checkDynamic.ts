import fetch from 'node-fetch';
import { IContext, generateModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getExchangeRates, getPrice } from '../../../utils';
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
const buildProductQuery = (brandId?: string) => {
  const query: any = {
    status: { $ne: 'deleted' },
  };

  if (brandId && brandId !== 'noBrand') {
    query.scopeBrandIds = { $in: [brandId] };
  } else {
    query.$or = [
      { scopeBrandIds: { $exists: false } },
      { scopeBrandIds: { $size: 0 } },
    ];
  }

  return query;
};
const groupItemsByCode = (items: any[] = []) => {
  const grouped: Record<string, any[]> = {};

  for (const item of items) {
    grouped[item.Item_No] ??= [];
    grouped[item.Item_No].push(item);
  }

  return grouped;
};
const mapProductsByCode = (products: any[]) => {
  const map: Record<string, any> = {};

  for (const product of products) {
    map[product.code] = product;
  }

  return map;
};
const comparePrices = async ({
  groupedItems,
  productsByCode,
  pricePriority,
  exchangeRates,
  result,
}: {
  groupedItems: Record<string, any[]>;
  productsByCode: Record<string, any>;
  pricePriority: string;
  exchangeRates: any;
  result: any;
}) => {
for (const itemNo of Object.keys(groupedItems)) {
  if (itemNo === '20-KA900E-QS') {
    console.log('🔥 FOUND 20-KA900E-QS BEFORE GETPRICE');
    console.log(groupedItems[itemNo]);
  }

  try {
    const { resPrice, resProd } = await getPrice(
      groupedItems[itemNo],
      pricePriority,
      exchangeRates,
    );

    if (itemNo === '20-KA900E-QS') {
      console.log('🔥 PRICE DEBUG:', {
        items: groupedItems[itemNo],
        pricePriority,
        exchangeRates,
        resPrice,
        resProd,
      });
    }

    const foundProduct = productsByCode[itemNo];

      if (!foundProduct) {
        result.create.items.push({
          Item_No: itemNo,
          Unit_Price: resPrice,
          Ending_Date: resProd?.Ending_Date,
          syncStatus: false,
        });

        continue;
      }

      const item = {
        _id: foundProduct._id,
        Item_No: itemNo,
        Unit_Price: resPrice,
        Ending_Date: resProd?.Ending_Date,
        code: foundProduct.code,
        unitPrice: foundProduct.unitPrice,
        syncStatus: foundProduct.unitPrice === resPrice,
      };

      if (foundProduct.unitPrice === resPrice) {
        result.match.items.push(item);
      } else {
        result.update.items.push(item);
      }
    } catch (e) {
      console.error(`Failed to process ${itemNo}`, e);

      result.error.items.push({
        Item_No: itemNo,
      });
    }
  }
};
const collectDeletedProducts = (
  products: any[],
  dynamicCodes: Set<string>,
  result: any,
) => {
  for (const product of products) {
    if (!dynamicCodes.has(product.code)) {
      result.delete.items.push({
        _id: product._id,
        code: product.code,
        unitPrice: product.unitPrice,
        syncStatus: false,
      });
    }
  }
};
/**
 * ============================
 * MS Dynamic Check Mutations
 * ============================
 */
export const msdynamicCheckMutations = {
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
      method: 'query',
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
        timeout: 180000,
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

    const categoriesCount = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'categories',
      action: 'count',
      input: {
        query: { status: { $ne: 'deleted' } },
      },
      defaultValue: 0,
    });

    const categories = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'categories',
      action: 'find',
      input: {
        query: { status: { $ne: 'deleted' } },
        limit: categoriesCount,
      },
      defaultValue: [],
    });

    const response = await fetch(itemCategoryApi, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${username}:${password}`,
        ).toString('base64')}`,
      },
    }).then((res) => res.json());

    const dynamicCategories = Array.isArray(response?.value)
      ? response.value
      : [];

    const resultCodes = dynamicCategories
      .map((category: { Code?: string }) => category.Code)
      .filter(Boolean);

    const categoryByCode: Record<string, any> = {};
    const categoryById: Record<string, any> = {};

    const createCategories: any[] = [];
    const updateCategories: any[] = [];
    const deleteCategories: any[] = [];
    let matchedCount = 0;

    for (const category of categories) {
      categoryByCode[category.code] = category;
      categoryById[category._id] = category;

      if (!resultCodes.includes(category.code)) {
        deleteCategories.push(category);
      }
    }

    for (const dynamicCategory of dynamicCategories) {
      const category = categoryByCode[dynamicCategory.Code];

      if (!category) {
        createCategories.push(dynamicCategory);
        continue;
      }

      const isMatched =
        dynamicCategory.Code === category.code &&
        (categoryId === category.parentId ||
          categoryById[category.parentId]?.code ===
            dynamicCategory.Parent_Category) &&
        category.name === dynamicCategory.Description;

      if (isMatched) {
        matchedCount += 1;
      } else {
        updateCategories.push(dynamicCategory);
      }
    }

    return {
      create: {
        count: createCategories.length,
        items: createCategories,
      },
      update: {
        count: updateCategories.length,
        items: updateCategories,
      },
      delete: {
        count: deleteCategories.length,
        items: deleteCategories,
      },
      matched: {
        count: matchedCount,
      },
    };
  },
  async toCheckMsdPrices(
    _root,
    { brandId }: { brandId: string },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('msdCheck');

    const models = await generateModels(subdomain);
    const config = await getDynamicConfig(models, brandId);

    if (
      !config.priceApi ||
      !config.username ||
      !config.password ||
      !config.pricePriority
    ) {
      throw new Error('MS Dynamic price config not found.');
    }

    const { priceApi, username, password, pricePriority } = config;
    const productQry = buildProductQuery(brandId);

    const products = await sendTRPCMessage({
      subdomain,
      method: 'query',
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: { query: productQry },
      defaultValue: [],
    });

    const exchangeRates = config.exchangeRateApi
      ? ((await getExchangeRates(config)) ?? {})
      : {};

    const salesCodeFilter = pricePriority.replace(/, /g, ',').split(',');

    const filterSection = salesCodeFilter
      .map((price) => `Sales_Code eq '${price}'`)
      .join(' or ');

    const response = await fetch(
      `${priceApi}?$filter=${filterSection} or Sales_Code eq ''`,
      {
        timeout: 180000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
      },
    ).then((res) => res.json());
    const groupedItems = groupItemsByCode(response?.value);
    const productsByCode = mapProductsByCode(products);
    const dynamicCodes = new Set(Object.keys(groupedItems));

    const result = {
      update: { items: [] as any[] },
      match: { items: [] as any[] },
      create: { items: [] as any[] },
      delete: { items: [] as any[] },
      error: { items: [] as any[] },
    };

    await comparePrices({
      groupedItems,
      productsByCode,
      pricePriority,
      exchangeRates,
      result,
    });

    collectDeletedProducts(products, dynamicCodes, result);

    return result;
  },
  async toSyncMsdPrices(
    _root,
    { prices = [], brandId }: { prices: any[]; brandId: string },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('msdSync');
    const models = await generateModels(subdomain);
const config = await getDynamicConfig(models, brandId);
    let hasFailed = false;

    for (const price of prices) {
      if (!price._id) {
  const response = await fetch(
    `${config.itemApi}?$filter=No eq '${price.Item_No}'`,
    {
      timeout: 180000,
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${Buffer.from(
          `${config.username}:${config.password}`,
        ).toString('base64')}`,
      },
    },
  ).then((res) => res.json());

  const doc = response?.value?.[0];

  if (!doc) {
    hasFailed = true;
    console.error(
      `MS Dynamic product not found: ${price.Item_No}`,
    );
    continue;
  }

  const document = {
    name: doc.Description || 'default',
    shortName: doc.Description_2 || '',
    type: doc.Type === 'Inventory' ? 'product' : 'service',
    unitPrice: Number(price.Unit_Price) || 0,
    code: doc.No,
    uom: doc.Base_Unit_of_Measure || 'PCS',
    categoryId: null,
    scopeBrandIds: [brandId],
    status: 'active',
  };

  const result = await sendTRPCMessage({
    subdomain,
    method: 'mutation',
    pluginName: 'core',
    module: 'products',
    action: 'createProduct',
    input: { doc },
    defaultValue: null,
  });

  if (!result) {
    hasFailed = true;
  }

  continue;
}

      const result = await sendTRPCMessage({
        subdomain,
        method: 'mutation',
        pluginName: 'core',
        module: 'products',
        action: 'updateProduct',
        input: {
          _id: price._id,
          doc: {
            unitPrice: Number(price.Unit_Price) || 0,
            currency: 'MNT',
          },
        },
        defaultValue: null,
      });

      if (!result) {
        hasFailed = true;
        console.error(
          `Failed to sync MS Dynamic price for product ${price._id}`,
        );
      }
    }

    return {
      status: hasFailed ? 'failed' : 'success',
    };
  },
};
