import {
  consumeInventory,
  consumeInventoryCategory,
  getConfig,
  sendErkhetGet,
} from '@/erkhet/utils';
import { preloadInventoryContext } from '@/erkhet/utils/consumeInventory';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const SYNC_BATCH_SIZE = 10;

const ACTION_MAP: Record<string, 'create' | 'update' | 'delete'> = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

interface BatchResult {
  success: number;
  failed: number;
  errors: Array<{ code?: string; message: string }>;
}

const processBatches = async <T extends { code?: string }>(
  items: T[],
  batchSize: number,
  worker: (item: T) => Promise<unknown>,
): Promise<BatchResult> => {
  const result: BatchResult = { success: 0, failed: 0, errors: [] };

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const settled = await Promise.allSettled(batch.map((item) => worker(item)));

    settled.forEach((outcome, index) => {
      if (outcome.status === 'fulfilled') {
        result.success += 1;
        return;
      }

      const reason = outcome.reason;
      result.failed += 1;

      let message: string;
      if (reason instanceof Error) {
        message = reason.message;
      } else if (typeof reason === 'string') {
        message = reason;
      } else {
        message = 'Unknown error';
      }

      result.errors.push({ code: batch[index]?.code, message });
    });
  }

  return result;
};

const fetchErkhetInventory = async (
  config: { apiKey: string; apiSecret: string; apiToken: string },
  kind: 'inventory' | 'inv_category',
) => {
  const responseData = await sendErkhetGet('/get-api/', {
    kind,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    token: config.apiToken,
    is_gen_fk: 'true',
  });

  if (!Array.isArray(responseData) || responseData.length === 0) {
    throw new Error('Erkhet data not found.');
  }

  return responseData.map((r: any) => r.fields);
};

const assertErkhetConfig = (config: any) => {
  if (!config?.apiToken || !config?.apiKey || !config?.apiSecret) {
    throw new Error('Erkhet config not found.');
  }
};

const inventoryMutations = {
  async toCheckProducts(
    _root: undefined,
    _params: undefined,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('erkhetManageSync');

    const config = await getConfig(subdomain, 'ERKHET', {});
    assertErkhetConfig(config);

    const [allProducts, productCategories, allErkhetProducts] =
      await Promise.all([
        sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'products',
          action: 'find',
          input: { query: { status: { $ne: 'deleted' } } },
          defaultValue: [],
        }),
        sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'productCategories',
          action: 'find',
          input: { query: {} },
          defaultValue: [],
        }),
        fetchErkhetInventory(config, 'inventory'),
      ]);

    const products = allProducts.filter((p: any) => p.code);
    const erkhetProducts = allErkhetProducts.filter((r: any) => r.code);

    const categoryById = new Map<string, any>(
      productCategories.map((cat: any) => [cat._id, cat]),
    );
    const productByCode = new Map<string, any>(
      products.map((p: any) => [p.code, p]),
    );
    const erkhetCodes = new Set<string>(erkhetProducts.map((r: any) => r.code));

    const createProducts: any[] = [];
    const updateProducts: any[] = [];
    const deleteProducts: any[] = [];
    let matchedCount = 0;

    for (const product of products) {
      if (!erkhetCodes.has(product.code)) {
        deleteProducts.push(product);
      }
    }

    for (const resProd of erkhetProducts) {
      const product = productByCode.get(resProd.code);
      if (!product) {
        createProducts.push(resProd);
        continue;
      }

      const expectedBarcodes = (product.barcodes || []).join(',');
      const expectedCategoryCode = categoryById.get(product.categoryId)?.code;
      const isMatched =
        resProd.name === product.name &&
        resProd.nickname === product.shortName &&
        resProd.unit_price === product.unitPrice &&
        resProd.barcodes === expectedBarcodes &&
        (resProd.vat_type || '') === (product.taxType || '') &&
        !!product.uom &&
        resProd.measure_unit_code === product.uom &&
        resProd.category_code === expectedCategoryCode;

      if (isMatched) {
        matchedCount += 1;
      } else {
        updateProducts.push(resProd);
      }
    }

    return {
      create: { count: createProducts.length, items: createProducts },
      update: { count: updateProducts.length, items: updateProducts },
      delete: { count: deleteProducts.length, items: deleteProducts },
      matched: { count: matchedCount },
    };
  },

  async toCheckCategories(
    _root: undefined,
    _params: undefined,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('erkhetManageSync');

    const config = await getConfig(subdomain, 'ERKHET', {});
    assertErkhetConfig(config);

    const [allCategories, allErkhetCategories] = await Promise.all([
      sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'productCategories',
        action: 'find',
        input: {
          query: { status: 'active' },
          sort: { order: 1 },
        },
        defaultValue: [],
      }),
      fetchErkhetInventory(config, 'inv_category'),
    ]);

    const categories = allCategories.filter((c: any) => c.code);
    const erkhetCategories = allErkhetCategories.filter((r: any) => r.code);

    const localByCode = new Map<string, any>(
      categories.map((c: any) => [c.code, c]),
    );
    const erkhetCodes = new Set<string>(
      erkhetCategories.map((r: any) => r.code),
    );

    const updateItems: any[] = [];
    const createItems: any[] = [];
    for (const resCat of erkhetCategories) {
      if (localByCode.has(resCat.code)) {
        updateItems.push(resCat);
      } else {
        createItems.push(resCat);
      }
    }

    const deleteItems = categories.filter(
      (cat: any) => !erkhetCodes.has(cat.code),
    );

    return {
      create: { count: createItems.length, items: createItems },
      update: { count: updateItems.length, items: updateItems },
      delete: { count: deleteItems.length, items: deleteItems },
    };
  },

  async toSyncCategories(
    _root: undefined,
    { action, categories }: { action: string; categories: any[] },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('erkhetManageSync');

    const normalizedAction = ACTION_MAP[action];
    if (!normalizedAction) {
      return { status: 'success', success: 0, failed: 0, errors: [] };
    }

    const ctx = await preloadInventoryContext(subdomain);

    const result = await processBatches(categories, SYNC_BATCH_SIZE, (item) =>
      consumeInventoryCategory(
        subdomain,
        item,
        item.code,
        normalizedAction,
        ctx,
      ),
    );

    return {
      status: result.failed === 0 ? 'success' : 'partial',
      ...result,
    };
  },

  async toSyncProducts(
    _root: undefined,
    { action, products }: { action: string; products: any[] },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('erkhetManageSync');

    const normalizedAction = ACTION_MAP[action];
    if (!normalizedAction) {
      return { status: 'success', success: 0, failed: 0, errors: [] };
    }

    const ctx = await preloadInventoryContext(subdomain);

    const result = await processBatches(products, SYNC_BATCH_SIZE, (item) =>
      consumeInventory(subdomain, item, item.code, normalizedAction, ctx),
    );

    return {
      status: result.failed === 0 ? 'success' : 'partial',
      ...result,
    };
  },
};

export default inventoryMutations;