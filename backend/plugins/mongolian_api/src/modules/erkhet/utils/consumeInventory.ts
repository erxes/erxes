import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getConfig } from './utils';

type Action = 'create' | 'update' | 'delete';

export interface InventoryConsumeContext {
  config?: any;
  weightField?: { _id?: string } | null;
  productByCode?: Map<string, any>;
  categoryByCode?: Map<string, any>;
}

const findProductByCode = async (
  subdomain: string,
  code: string,
  ctx?: InventoryConsumeContext,
) => {
  if (ctx?.productByCode) {
    return ctx.productByCode.get(code) ?? null;
  }
  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'products',
    action: 'findOne',
    input: { query: { code } },
  });
};

const findCategoryByCode = async (
  subdomain: string,
  code: string | undefined,
  ctx?: InventoryConsumeContext,
) => {
  if (!code) return null;
  if (ctx?.categoryByCode) {
    return ctx.categoryByCode.get(code) ?? null;
  }
  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'productCategories',
    action: 'findOne',
    input: { query: { code } },
    defaultValue: null,
  });
};

const resolveConfig = async (subdomain: string, ctx?: InventoryConsumeContext) => {
  if (ctx?.config) return ctx.config;
  return getConfig(subdomain, 'ERKHET', {});
};

const resolveWeightField = async (
  subdomain: string,
  ctx?: InventoryConsumeContext,
) => {
  if (ctx?.weightField !== undefined) return ctx.weightField;
  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'findOne',
    input: { query: { code: 'weight' } },
    defaultValue: null,
  });
};

export const preloadInventoryContext = async (
  subdomain: string,
): Promise<InventoryConsumeContext> => {
  const [config, weightField, products, categories] = await Promise.all([
    getConfig(subdomain, 'ERKHET', {}),
    sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'fields',
      action: 'findOne',
      input: { query: { code: 'weight' } },
      defaultValue: null,
    }),
    sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'products',
      action: 'find',
      input: { query: {} },
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
  ]);

  return {
    config,
    weightField,
    productByCode: new Map(
      (products as any[]).map((p) => [p.code, p]),
    ),
    categoryByCode: new Map(
      (categories as any[]).map((c) => [c.code, c]),
    ),
  };
};

const applyWeightField = (
  document: any,
  product: any,
  weightField: any,
  doc: any,
) => {
  if (weightField?._id && doc.weight !== undefined) {
    document.propertiesData = {
      ...product?.propertiesData,
      [weightField._id]: Number(doc.weight),
    };
  }
};

const applySubUoms = (document: any, product: any, doc: any) => {
  if (!doc.sub_measure_unit_code || !doc.ratio_measure_unit) return;

  let subUoms = product?.subUoms || [];
  subUoms = subUoms.filter((u: any) => u.uom !== doc.sub_measure_unit_code);
  subUoms.unshift({ uom: doc.sub_measure_unit_code, ratio: doc.ratio_measure_unit });
  document.subUoms = subUoms;
};

const applyDescription = (doc: any, config: any) => {
  if (!config?.consumeDescription) return;
  doc.description = config.consumeDescription.replace(
    /\$\{doc\.([^}]+)\}/g,
    (match: string, path: string) => {
      const value = path
        .split('.')
        .reduce((acc: any, segment: string) => acc?.[segment], doc);
      return value !== undefined && value !== null ? String(value) : match;
    },
  );
};

const upsertProduct = async (subdomain: string, product: any, document: any) => {
  if (product?._id) {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'products',
      action: 'updateProduct',
      input: { _id: product._id, doc: { ...document } },
    });
  } else {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'products',
      action: 'createProduct',
      input: { doc: { ...document } },
    });
  }
};

export const consumeInventory = async (
  subdomain: string,
  doc: any,
  old_code: string,
  action: Action,
  ctx?: InventoryConsumeContext,
) => {
  const product = await findProductByCode(subdomain, old_code, ctx);

  if (action === 'delete') {
    if (product?._id) {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'products',
        action: 'removeProducts',
        input: { _ids: [product._id] },
      });
    }
    return;
  }

  if (action !== 'create' && action !== 'update') return;

  const [productCategory, config, weightField] = await Promise.all([
    findCategoryByCode(subdomain, doc.category_code, ctx),
    resolveConfig(subdomain, ctx),
    resolveWeightField(subdomain, ctx),
  ]);

  const document: any = {
    name: doc.name || '',
    shortName: doc.nickname || '',
    type: doc.is_service ? 'service' : 'product',
    unitPrice: doc.unit_price,
    code: doc.code,
    productId: doc.id,
    uom: doc.measure_unit_code,
    subUoms: product?.subUoms,
    barcodes: doc.barcodes ? doc.barcodes.split(',') : [],
    categoryId: productCategory ? productCategory._id : product?.categoryId,
    categoryCode: productCategory ? productCategory.code : product?.categoryCode,
    status: 'active',
  };

  applyWeightField(document, product, weightField, doc);
  applySubUoms(document, product, doc);
  applyDescription(doc, config);

  await upsertProduct(subdomain, product, document);
};

export const consumeInventoryCategory = async (
  subdomain: string,
  doc: any,
  old_code: string,
  action: Action,
  ctx?: InventoryConsumeContext,
) => {
  const productCategory = await findCategoryByCode(subdomain, old_code, ctx);

  if (action === 'delete') {
    if (productCategory?._id) {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'productCategories',
        action: 'removeProductCategory',
        input: { _id: productCategory._id },
      });
    }
    return;
  }

  if (action !== 'create' && action !== 'update') return;

  const parentCategory = await findCategoryByCode(
    subdomain,
    doc.parent_code,
    ctx,
  );

  const document = {
    code: doc.code,
    name: doc.name,
    order: doc.order,
    status: 'active',
  };

  if (productCategory) {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'productCategories',
      action: 'updateProductCategory',
      input: {
        _id: productCategory._id,
        doc: {
          ...document,
          parentId: parentCategory
            ? parentCategory._id
            : productCategory.parentId,
        },
      },
    });
  } else {
    await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'productCategories',
      action: 'createProductCategory',
      input: {
        doc: {
          ...document,
          parentId: parentCategory ? parentCategory._id : '',
        },
      },
    });
  }
};
