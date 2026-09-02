import { Request, Response } from 'express';
import {
  getFullDate,
  getSubdomain,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
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
  sourceCode?: string;
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
  defaultAnnualDepreciationRate?: number;
  defaultSalvageValue?: number;
};

type TErkhetWorker = {
  code?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  register?: string;
  departmentCode?: string;
  position?: string;
};

type TErkhetExchangeRate = {
  code?: string;
  date?: string;
  mainCurrency?: string;
  rateCurrency?: string;
  rate?: number;
};

type TErkhetReferencesRequest = {
  userId?: string;
  dryRun?: boolean;
  productCategories?: TErkhetProductCategory[];
  products?: TErkhetProduct[];
  fixedAssetCategories?: TErkhetFixedAssetCategory[];
  workers?: TErkhetWorker[];
  exchangeRates?: TErkhetExchangeRate[];
};

type TReferenceRow = {
  type: string;
  code?: string;
  action: 'create' | 'update' | 'skip' | 'error';
  _id?: string;
  error?: string;
};

const uniq = (values: string[]) => [...new Set(values.filter(Boolean))];

const normalizeSourceCode = (value?: string) =>
  typeof value === 'string' ? value.trim() : value || '';

const normalizeIdentifierCode = (value?: string) =>
  normalizeSourceCode(value).replace(/\s+/g, '');

const normalizeEmail = (value?: string) =>
  normalizeSourceCode(value).toLowerCase();

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const indexByCode = <T extends { _id: string; code?: string }>(
  items: T[] = [],
) =>
  items.reduce<TCodeMap>((byCode, item) => {
    if (item?.code) {
      byCode[normalizeSourceCode(item.code)] = item._id;
      byCode[normalizeIdentifierCode(item.code)] = item._id;
    }
    return byCode;
  }, {});

const cleanDoc = <T extends Record<string, unknown>>(doc: T) =>
  Object.fromEntries(
    Object.entries(doc).filter(([, value]) => value !== undefined),
  );

const getDateRange = (date: Date) => {
  const start = getFullDate(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
};

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

const fetchUsersByEmail = async (subdomain: string, emails: string[]) => {
  if (!emails.length) {
    return {};
  }

  const users = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'users',
    action: 'find',
    input: {
      query: { email: { $in: emails } },
      fields: { _id: 1, email: 1 },
    },
    defaultValue: [],
  });

  return (users as Array<{ _id: string; email?: string }>).reduce(
    (byEmail: TCodeMap, user) => {
      if (user?.email) {
        byEmail[normalizeEmail(user.email)] = user._id;
      }

      return byEmail;
    },
    {},
  );
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
        throw new Error(
          `Product category parent not found: ${category.parentCode}`,
        );
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
  const productCodes = products.reduce<string[]>((codes, product) => {
    if (product.code) {
      codes.push(product.code, normalizeIdentifierCode(product.code));
    }
    if (product.sourceCode) {
      codes.push(
        product.sourceCode,
        normalizeIdentifierCode(product.sourceCode),
      );
    }

    return codes;
  }, []);
  const productIdsByCode = await fetchCoreCodeMap({
    subdomain,
    module: 'products',
    codes: uniq(productCodes.map((code) => normalizeSourceCode(code))),
  });

  for (const product of products) {
    try {
      requireCodeAndName('Product', product);
      const code = normalizeIdentifierCode(product.code);

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

const syncWorkers = async ({
  subdomain,
  dryRun,
  workers,
}: {
  subdomain: string;
  dryRun: boolean;
  workers: TErkhetWorker[];
}) => {
  const rows: TReferenceRow[] = [];
  const emails = uniq(
    workers.map((worker) => normalizeEmail(worker.email)).filter(Boolean),
  );
  const userIdsByEmail = await fetchUsersByEmail(subdomain, emails);

  for (const worker of workers) {
    const email = normalizeEmail(worker.email);
    const code = normalizeSourceCode(worker.code || worker.register || email);

    try {
      if (!email) {
        rows.push({
          type: 'worker',
          code,
          action: 'skip',
          error: 'Worker email is empty',
        });
        continue;
      }

      const existingId = userIdsByEmail[email];

      if (existingId) {
        rows.push({
          type: 'worker',
          code,
          action: 'skip',
          _id: existingId,
        });
        continue;
      }

      const firstName = normalizeSourceCode(worker.firstName);
      const lastName = normalizeSourceCode(worker.lastName);
      const fullName =
        normalizeSourceCode(worker.fullName) ||
        normalizeSourceCode(`${firstName} ${lastName}`);

      let createdId = '';

      if (!dryRun) {
        const saved = await sendTRPCMessage({
          subdomain,
          method: 'mutation',
          pluginName: 'core',
          module: 'users',
          action: 'create',
          input: {
            data: {
              email,
              isActive: true,
              notUsePassword: true,
              details: cleanDoc({
                firstName,
                lastName,
                fullName,
                operatorPhone: normalizeSourceCode(worker.phone),
                position: normalizeSourceCode(worker.position),
                shortName: normalizeSourceCode(worker.register),
              }),
            },
          },
          defaultValue: {},
        });

        createdId = saved?._id || '';
        if (createdId) {
          userIdsByEmail[email] = createdId;
        }
      }

      rows.push({
        type: 'worker',
        code,
        action: 'create',
        _id: createdId || userIdsByEmail[email],
      });
    } catch (error) {
      rows.push({
        type: 'worker',
        code,
        action: 'error',
        error: getErrorMessage(error, 'Worker sync failed'),
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
      {
        code: { $in: uniq(categories.map((category) => category.code || '')) },
      },
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
        defaultAnnualDepreciationRate: category.defaultAnnualDepreciationRate,
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

const syncExchangeRates = async ({
  subdomain,
  dryRun,
  exchangeRates,
}: {
  subdomain: string;
  dryRun: boolean;
  exchangeRates: TErkhetExchangeRate[];
}) => {
  const rows: TReferenceRow[] = [];

  for (const exchangeRate of exchangeRates) {
    const date = normalizeSourceCode(exchangeRate.date);
    const mainCurrency =
      normalizeSourceCode(exchangeRate.mainCurrency) || 'MNT';
    const rateCurrency = normalizeSourceCode(exchangeRate.rateCurrency);
    const code =
      normalizeSourceCode(exchangeRate.code) ||
      `${date}:${mainCurrency}:${rateCurrency}`;

    try {
      if (!date || !rateCurrency || !exchangeRate.rate) {
        throw new Error(
          `Exchange rate date, currency and rate are required: ${code}`,
        );
      }

      const rateDate = new Date(date);
      const { start, end } = getDateRange(rateDate);
      const existing = await sendTRPCMessage({
        subdomain,
        pluginName: 'mongolian',
        module: 'exchangeRates',
        action: 'findOne',
        input: {
          query: {
            mainCurrency,
            rateCurrency,
            date: { $gte: start, $lt: end },
          },
        },
        defaultValue: null,
      });

      const doc = {
        date: start,
        mainCurrency,
        rateCurrency,
        rate: exchangeRate.rate,
      };
      const existingId = existing?._id;
      const action = existingId ? 'update' : 'create';

      if (!dryRun) {
        const saved = await sendTRPCMessage({
          subdomain,
          method: 'mutation',
          pluginName: 'mongolian',
          module: 'exchangeRates',
          action: existingId ? 'update' : 'create',
          input: existingId
            ? {
                selector: { _id: existingId },
                modifier: { $set: { ...doc, modifiedAt: new Date() } },
              }
            : { data: doc },
        });

        if (!existingId && !saved?._id) {
          throw new Error(`Exchange rate was not created: ${code}`);
        }

        rows.push({
          type: 'exchangeRate',
          code,
          action,
          _id: existingId || saved?._id,
        });
        continue;
      }

      rows.push({
        type: 'exchangeRate',
        code,
        action,
        _id: existingId,
      });
    } catch (error) {
      rows.push({
        type: 'exchangeRate',
        code,
        action: 'error',
        error: getErrorMessage(error, 'Exchange rate sync failed'),
      });
    }
  }

  return rows;
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

  rows.push(
    ...(await syncWorkers({
      subdomain,
      dryRun,
      workers: body.workers || [],
    })),
  );

  rows.push(
    ...(await syncExchangeRates({
      subdomain,
      dryRun,
      exchangeRates: body.exchangeRates || [],
    })),
  );

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
