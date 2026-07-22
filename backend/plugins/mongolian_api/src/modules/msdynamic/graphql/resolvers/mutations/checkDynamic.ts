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

    const productQry: any = {
      status: { $ne: 'deleted' },
    };

    if (brandId && brandId !== 'noBrand') {
      productQry.scopeBrandIds = { $in: [brandId] };
    } else {
      productQry.$or = [
        { scopeBrandIds: { $exists: false } },
        { scopeBrandIds: { $size: 0 } },
      ];
    }

    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: { query: productQry },
      defaultValue: [],
    });

    let exchangeRates = {};

    if (config.exchangeRateApi) {
      exchangeRates = (await getExchangeRates(config)) ?? {};
    }

    const salesCodeFilter = pricePriority.replaceAll(', ', ',').split(',');

    let filterSection = '';

    for (const price of salesCodeFilter) {
      filterSection += `Sales_Code eq '${price}' or `;
    }

    const response = await fetch(
      `${priceApi}?$filter=${filterSection} Sales_Code eq ''`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
      },
    ).then((res) => res.json());

    const groupedItems: Record<string, any[]> = {};

    if (Array.isArray(response?.value)) {
      for (const item of response.value) {
        if (!groupedItems[item.Item_No]) {
          groupedItems[item.Item_No] = [];
        }

        groupedItems[item.Item_No].push(item);
      }
    }
    const productsByCode: Record<string, any> = {};

    for (const product of products) {
      productsByCode[product.code] = product;
    }

    const dynamicCodes = new Set(Object.keys(groupedItems));

    const result = {
      update: { items: [] as any[] },
      match: { items: [] as any[] },
      create: { items: [] as any[] },
      delete: { items: [] as any[] },
      error: { items: [] as any[] },
    };

    for (const Item_No of Object.keys(groupedItems)) {
      try {
        const { resPrice, resProd } = await getPrice(
          groupedItems[Item_No],
          pricePriority,
          exchangeRates,
        );

        const foundProduct = productsByCode[Item_No];

        if (!foundProduct) {
          result.create.items.push({
            Item_No,
            Unit_Price: resPrice,
            Ending_Date: resProd?.Ending_Date,
            syncStatus: false,
          });

          continue;
        }

        const item = {
          _id: foundProduct._id,
          Item_No,
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
        console.error(`Failed to process price for Item_No: ${Item_No}`, e);
        result.error.items.push({
          Item_No,
        });
      }
    }

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

    return result;
  },
  async toSyncMsdPrices(
    _root,
    { prices = [] }: { prices: any[] },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('msdSync');

    let hasFailed = false;

    for (const price of prices) {
      if (!price._id) {
        continue;
      }

      const result = await sendTRPCMessage({
        subdomain,
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
