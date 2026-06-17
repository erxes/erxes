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

  async toCheckMsdPrices(
    _root,
    { brandId }: { brandId: string },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('msdCheck');

    const models = await generateModels(subdomain);
    const config = await getDynamicConfig(models, brandId);

    if (!config.priceApi || !config.username || !config.password) {
      throw new Error('MS Dynamic config not valid.');
    }

    const {
      priceApi,
      username,
      password,
      pricePriority,
      brandId: cfgBrandId,
    } = config;

    const productQry: {
      status: { $ne: string };
      scopeBrandIds?: { $in: string[] };
    } = {
      status: { $ne: 'deleted' },
    };

    if (cfgBrandId && cfgBrandId !== 'noBrand') {
      productQry.scopeBrandIds = { $in: [cfgBrandId] };
    }

    const [products, exchangeRates] = await Promise.all([
      sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'products',
        action: 'find',
        input: { query: productQry },
        defaultValue: [],
      }),
      config.exchangeRateApi
        ? getExchangeRates(config).catch((err) => {
            console.error('Failed to fetch exchange rates:', err);
            return {};
          })
        : Promise.resolve({}),
    ]);

    const productByCode: Record<string, any> = {};
    for (const p of products) {
      productByCode[p.code] = p;
    }

    const salesCodeFilter = (pricePriority || '')
      .replace(/, /g, ',')
      .split(',')
      .filter(Boolean);
    let filterSection = '';
    for (const sc of salesCodeFilter) {
      filterSection += `Sales_Code eq '${sc}' or `;
    }

    const priceResponse = await fetch(
      `${priceApi}?$filter=${filterSection} Sales_Code eq ''`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
        timeout: 180000,
      },
    ).then((r) => r.json());

    const itemsByCode: Record<string, any[]> = {};
    if (Array.isArray(priceResponse?.value)) {
      for (const item of priceResponse.value) {
        const code = item.Item_No;
        if (!itemsByCode[code]) itemsByCode[code] = [];
        itemsByCode[code].push(item);
      }
    }

    const msdCodes = new Set(Object.keys(itemsByCode));

    const result: Record<string, { items: any[] }> = {
      update: { items: [] },
      match: { items: [] },
      create: { items: [] },
      delete: { items: [] },
      error: { items: [] },
    };

    for (const code of msdCodes) {
      try {
        const resProds = itemsByCode[code];
        const { resPrice, resProd } = await getPrice(
          resProds,
          pricePriority,
          exchangeRates,
        );

        const existing = productByCode[code];

        if (!existing) {
          result.create.items.push({
            ...resProd,
            Item_No: code,
            Unit_Price: resPrice,
            unitPrice: undefined,
          });
        } else if (existing.unitPrice !== resPrice) {
          result.update.items.push({
            ...resProd,
            Item_No: code,
            Unit_Price: resPrice,
            unitPrice: existing.unitPrice,
          });
        } else {
          result.match.items.push({
            ...resProd,
            Item_No: code,
            Unit_Price: resPrice,
            unitPrice: existing.unitPrice,
          });
        }
      } catch (e: any) {
        result.error.items.push({
          Item_No: code,
          Unit_Price: 0,
          message: e.message,
        });
      }
    }

    for (const p of products) {
      if (!msdCodes.has(p.code) && p.unitPrice) {
        result.delete.items.push({
          code: p.code,
          unitPrice: p.unitPrice,
          Item_No: p.code,
        });
      }
    }

    return result;
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
};
