import { Request, Response } from 'express';
import { getSubdomain, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels, generateModels } from '~/connectionResolvers';

type TCodeMap = Record<string, string>;

type TErkhetProductCategory = {
  code?: string;
  name?: string;
  parentCode?: string;
  description?: string;
};

type TErkhetProduct = {
  code?: string;
  name?: string;
  categoryCode?: string;
  uom?: string;
  unitPrice?: number;
  barcodes?: string[];
};

type TErkhetFixedAssetCategory = {
  code?: string;
  name?: string;
  parentCode?: string;
  description?: string;
  defaultUsefulLife?: number;
  defaultSalvageValue?: number;
};

type TErkhetReferencesRequest = {
  userId?: string;
  dryRun?: boolean;
  productCategories?: TErkhetProductCategory[];
  products?: TErkhetProduct[];
  fixedAssetCategories?: TErkhetFixedAssetCategory[];
};

type TReferenceRow = {
  type: string;
  code?: string;
  action: 'create' | 'update' | 'skip' | 'error';
  _id?: string;
  error?: string;
};

const uniq = (values: string[]) => [...new Set(values.filter(Boolean))];

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const indexByCode = <T extends { _id: string; code?: string }>(
  items: T[] = [],
) =>
  items.reduce<TCodeMap>((byCode, item) => {
    if (item?.code) {
      byCode[item.code] = item._id;
    }
    return byCode;
  }, {});

const cleanDoc = <T extends Record<string, unknown>>(doc: T) =>
  Object.fromEntries(
    Object.entries(doc).filter(([, value]) => value !== undefined),
  );

const requireCodeAndName = (
  type: string,
  doc: { code?: string; name?: string },
) => {
  if (!doc.code) {
    throw new Error(`${type} code is required`);
  }

  if (!doc.name) {
    throw new Error(`${type} name is required: ${doc.code}`);
  }
};

const fetchCoreCodeMap = async ({
  subdomain,
  module,
  codes,
}: {
  subdomain: string;
  module: 'productCategories' | 'products';
  codes: string[];
}) => {
  if (!codes.length) {
    return {};
  }

  // Erkhet тал зөвхөн code явуулна. Erxes дээр хадгалахдаа public core
  // лавлахуудын _id-г олж тааруулахын тулд code -> _id map бэлдэнэ.
  const docs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module,
    action: 'find',
    input: {
      query: { code: { $in: codes } },
      fields: { _id: 1, code: 1 },
    },
    defaultValue: [],
  });

  return indexByCode(docs);
};

const syncProductCategories = async ({
  subdomain,
  userId,
  dryRun,
  categories,
}: {
  subdomain: string;
  userId?: string;
  dryRun: boolean;
  categories: TErkhetProductCategory[];
}) => {
  const rows: TReferenceRow[] = [];
  const codes = uniq(categories.map((category) => category.code || ''));
  // Эцэг category-г code-р нь зааж ирүүлдэг тул эхлээд batch дотор байгаа
  // болон өмнө sync хийгдсэн category-уудыг нэг map-д цуглуулна.
  const categoryIdsByCode = await fetchCoreCodeMap({
    subdomain,
    module: 'productCategories',
    codes,
  });

  for (const category of categories) {
    try {
      requireCodeAndName('Product category', category);
      const code = category.code || '';

      const parentId = category.parentCode
        ? categoryIdsByCode[category.parentCode] || ''
        : '';

      if (category.parentCode && !parentId) {
        throw new Error(`Product category parent not found: ${category.parentCode}`);
      }

      const doc = cleanDoc({
        code,
        name: category.name,
        parentId,
        description: category.description,
        status: 'active',
      });
      const existingId = categoryIdsByCode[code];
      const action = existingId ? 'update' : 'create';

      if (!dryRun) {
        const saved = await sendTRPCMessage({
          subdomain,
          method: 'mutation',
          pluginName: 'core',
          module: 'productCategories',
          action: existingId
            ? 'updateProductCategory'
            : 'createProductCategory',
          input: existingId ? { _id: existingId, doc } : { doc },
          context: { userId },
          defaultValue: {},
        });

        if (saved?._id) {
          categoryIdsByCode[code] = saved._id;
        }
      } else if (!existingId) {
        // Dry-run үед DB-д бичихгүй ч дараагийн child/product мөрүүд parent-аа
        // олж чадсан мэт validation үргэлжлэх ёстой.
        categoryIdsByCode[code] = `dry-run:${code}`;
      }

      rows.push({
        type: 'productCategory',
        code,
        action,
        _id: categoryIdsByCode[code],
      });
    } catch (error) {
      rows.push({
        type: 'productCategory',
        code: category.code,
        action: 'error',
        error: getErrorMessage(error, 'Product category sync failed'),
      });
    }
  }

  return { rows, categoryIdsByCode };
};

const syncProducts = async ({
  subdomain,
  userId,
  dryRun,
  products,
  categoryIdsByCode,
}: {
  subdomain: string;
  userId?: string;
  dryRun: boolean;
  products: TErkhetProduct[];
  categoryIdsByCode: TCodeMap;
}) => {
  const rows: TReferenceRow[] = [];
  const productIdsByCode = await fetchCoreCodeMap({
    subdomain,
    module: 'products',
    codes: uniq(products.map((product) => product.code || '')),
  });

  for (const product of products) {
    try {
      requireCodeAndName('Product', product);
      const code = product.code || '';

      const categoryId = product.categoryCode
        ? categoryIdsByCode[product.categoryCode]
        : '';

      // Бараа transaction дээр ирэхээсээ өмнө category-тэйгээ хамт sync
      // хийгдсэн байх ёстой. Ингэхгүй бол transaction route дээр product
      // code-г _id болгох боломжгүй.
      if (product.categoryCode && !categoryId) {
        throw new Error(`Product category not found: ${product.categoryCode}`);
      }

      const doc = cleanDoc({
        code,
        name: product.name,
        categoryId,
        uom: product.uom,
        unitPrice: product.unitPrice,
        barcodes: product.barcodes || [],
        type: 'product',
        status: 'active',
      });
      const existingId = productIdsByCode[code];
      const action = existingId ? 'update' : 'create';

      if (!dryRun) {
        const saved = await sendTRPCMessage({
          subdomain,
          method: 'mutation',
          pluginName: 'core',
          module: 'products',
          action: existingId ? 'updateProduct' : 'createProduct',
          input: existingId ? { _id: existingId, doc } : { doc },
          context: { userId },
          defaultValue: {},
        });

        if (saved?._id) {
          productIdsByCode[code] = saved._id;
        }
      }

      rows.push({
        type: 'product',
        code,
        action,
        _id: productIdsByCode[code],
      });
    } catch (error) {
      rows.push({
        type: 'product',
        code: product.code,
        action: 'error',
        error: getErrorMessage(error, 'Product sync failed'),
      });
    }
  }

  return rows;
};

const syncFixedAssetCategories = async ({
  models,
  userId,
  dryRun,
  categories,
}: {
  models: IModels;
  userId?: string;
  dryRun: boolean;
  categories: TErkhetFixedAssetCategory[];
}) => {
  const rows: TReferenceRow[] = [];
  // Үндсэн хөрөнгийн master/category нь accounting plugin-ийн өөрийн
  // collection-д хадгалагддаг тул core service дуудахгүй, tenant model ашиглана.
  const categoryIdsByCode = indexByCode(
    await models.FixedAssetCategories.find(
      { code: { $in: uniq(categories.map((category) => category.code || '')) } },
      { _id: 1, code: 1 },
    ).lean(),
  );

  for (const category of categories) {
    try {
      requireCodeAndName('Fixed asset category', category);
      const code = category.code || '';

      const parentId = category.parentCode
        ? categoryIdsByCode[category.parentCode] || ''
        : '';

      if (category.parentCode && !parentId) {
        throw new Error(
          `Fixed asset category parent not found: ${category.parentCode}`,
        );
      }

      const doc = cleanDoc({
        code,
        name: category.name,
        parentId,
        description: category.description,
        defaultUsefulLife: category.defaultUsefulLife,
        defaultSalvageValue: category.defaultSalvageValue,
        status: 'active',
      });
      const existingId = categoryIdsByCode[code];
      const action = existingId ? 'update' : 'create';

      if (!dryRun) {
        if (existingId) {
          await models.FixedAssetCategories.updateOne(
            { _id: existingId },
            {
              $set: {
                ...doc,
                modifiedBy: userId,
                updatedAt: new Date(),
              },
            },
          );
        } else {
          const saved = await models.FixedAssetCategories.create({
            ...doc,
            createdBy: userId,
            createdAt: new Date(),
          });
          categoryIdsByCode[code] = saved._id;
        }
      } else if (!existingId) {
        // Dry-run дээр parent chain болон дараагийн fixed asset мөрүүдийг
        // бодитоор бичилгүйгээр шалгахын тулд түр id хэрэглэнэ.
        categoryIdsByCode[code] = `dry-run:${code}`;
      }

      rows.push({
        type: 'fixedAssetCategory',
        code,
        action,
        _id: categoryIdsByCode[code],
      });
    } catch (error) {
      rows.push({
        type: 'fixedAssetCategory',
        code: category.code,
        action: 'error',
        error: getErrorMessage(error, 'Fixed asset category sync failed'),
      });
    }
  }

  return { rows, categoryIdsByCode };
};

export const importErkhetReferences = async (req: Request, res: Response) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);
  const body = (req.body || {}) as TErkhetReferencesRequest;
  const dryRun = !!body.dryRun;
  const rows: TReferenceRow[] = [];

  // Reference sync нь transaction sync-ээс өмнөх bootstrap шат.
  // Бараа дээр category + product үүсгэнэ, fixed asset дээр зөвхөн category tree үүсгэнэ.
  const productCategoryResult = await syncProductCategories({
    subdomain,
    userId: body.userId,
    dryRun,
    categories: body.productCategories || [],
  });
  rows.push(...productCategoryResult.rows);

  const productCategoryCodes = uniq(
    (body.products || []).map((product) => product.categoryCode || ''),
  );
  const productCategoryIdsByCode = {
    ...productCategoryResult.categoryIdsByCode,
    ...(await fetchCoreCodeMap({
      subdomain,
      module: 'productCategories',
      codes: productCategoryCodes,
    })),
  };

  rows.push(
    ...(await syncProducts({
      subdomain,
      userId: body.userId,
      dryRun,
      products: body.products || [],
      categoryIdsByCode: productCategoryIdsByCode,
    })),
  );

  const fixedAssetCategoryResult = await syncFixedAssetCategories({
    models,
    userId: body.userId,
    dryRun,
    categories: body.fixedAssetCategories || [],
  });
  rows.push(...fixedAssetCategoryResult.rows);

  const errorRows = rows.filter((row) => row.action === 'error');

  return res.json({
    dryRun,
    totalCount: rows.length,
    createdCount: rows.filter((row) => row.action === 'create').length,
    updatedCount: rows.filter((row) => row.action === 'update').length,
    skippedCount: rows.filter((row) => row.action === 'skip').length,
    errorCount: errorRows.length,
    rows,
    errorRows,
  });
};
