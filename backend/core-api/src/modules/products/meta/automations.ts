import { PRODUCT_STATUSES } from '@/products/constants';
import {
  buildKnowledgeSourceType,
  enqueueAiKnowledgeSourceRefreshJob,
  type TKnowledgeDocument,
} from 'erxes-api-shared/utils';
import type {
  TAiKnowledgeDocumentBatchResult,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import type { IProductDocument } from 'erxes-api-shared/core-types';
import type { FilterQuery } from 'mongoose';
import type { IModels } from '~/connectionResolvers';

export const CORE_PRODUCT_KNOWLEDGE_SOURCE_KEY = 'product.knowledge';

const DEFAULT_BATCH_LIMIT = 500;
const MAX_BATCH_LIMIT = 5000;

type TProductKnowledgeConfig = {
  includeCategoryIds: string[];
  includeProductIds: string[];
  excludeCategoryIds: string[];
  excludeProductIds: string[];
};

type TProductKnowledgeBatchInput = {
  sourceIds?: string[];
  candidateSourceIds?: string[];
  config?: Record<string, unknown>;
  cursor?: string;
  limit?: number;
  skipTotalCount?: boolean;
};

type TProductKnowledgeSelectorResult =
  | {
      hasScope: true;
      selector: FilterQuery<IProductDocument>;
      totalSelector: FilterQuery<IProductDocument>;
    }
  | {
      hasScope: false;
      selector: FilterQuery<IProductDocument>;
      totalSelector: FilterQuery<IProductDocument>;
    };

type TProductKnowledgeRecord = {
  _id: string;
  name?: string;
  shortName?: string;
  code?: string;
  type?: string;
  categoryId?: string;
  status?: string;
  barcodes?: string[];
  description?: string;
  unitPrice?: number;
  currency?: string;
  uom?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const toStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && !!item)
    : [];

const uniqueStrings = (values: string[]) => [...new Set(values.filter(Boolean))];

const normalizeBatchLimit = (limit?: number) => {
  if (!Number.isFinite(limit)) {
    return DEFAULT_BATCH_LIMIT;
  }

  return Math.min(Math.max(Math.floor(limit || DEFAULT_BATCH_LIMIT), 1), MAX_BATCH_LIMIT);
};

const normalizeProductKnowledgeConfig = (
  config?: Record<string, unknown>,
  fallbackProductIds: string[] = [],
): TProductKnowledgeConfig => ({
  includeCategoryIds: uniqueStrings([
    ...toStringArray(config?.includeCategoryIds),
    ...toStringArray(config?.categoryIds),
  ]),
  includeProductIds: uniqueStrings([
    ...toStringArray(config?.includeProductIds),
    ...toStringArray(config?.productIds),
    ...fallbackProductIds,
  ]),
  excludeCategoryIds: uniqueStrings(toStringArray(config?.excludeCategoryIds)),
  excludeProductIds: uniqueStrings(toStringArray(config?.excludeProductIds)),
});

const resolveCategoryTreeIds = async (
  models: IModels,
  categoryIds: string[],
) => {
  if (!categoryIds.length) {
    return [];
  }

  const categories = await models.ProductCategories.getChildCategories(
    categoryIds,
  );

  return uniqueStrings(categories.map((category) => category._id));
};

const buildProductKnowledgeSelector = async ({
  models,
  sourceIds = [],
  candidateSourceIds = [],
  config,
  cursor,
}: TProductKnowledgeBatchInput & {
  models: IModels;
}): Promise<TProductKnowledgeSelectorResult> => {
  const normalizedConfig = normalizeProductKnowledgeConfig(config, sourceIds);
  const includedProductIds = normalizedConfig.includeProductIds;
  const includedCategoryIds = await resolveCategoryTreeIds(
    models,
    normalizedConfig.includeCategoryIds,
  );
  const excludedCategoryIds = await resolveCategoryTreeIds(
    models,
    normalizedConfig.excludeCategoryIds,
  );
  const hasScope = !!includedProductIds.length || !!includedCategoryIds.length;
  const baseSelector: FilterQuery<IProductDocument> = {
    status: { $ne: PRODUCT_STATUSES.DELETED },
  };

  if (!hasScope) {
    return {
      hasScope: false,
      selector: baseSelector,
      totalSelector: baseSelector,
    };
  }

  const includeFilters: FilterQuery<IProductDocument>[] = [];
  const exclusionFilters: FilterQuery<IProductDocument>[] = [];

  if (includedProductIds.length) {
    includeFilters.push({ _id: { $in: includedProductIds } });
  }

  if (includedCategoryIds.length) {
    includeFilters.push({ categoryId: { $in: includedCategoryIds } });
  }

  if (normalizedConfig.excludeProductIds.length) {
    exclusionFilters.push({
      _id: { $nin: normalizedConfig.excludeProductIds },
    });
  }

  if (excludedCategoryIds.length) {
    exclusionFilters.push({
      categoryId: { $nin: excludedCategoryIds },
    });
  }

  if (candidateSourceIds.length) {
    exclusionFilters.push({
      _id: { $in: uniqueStrings(candidateSourceIds) },
    });
  }

  const totalAndFilters: FilterQuery<IProductDocument>[] = [
    { $or: includeFilters },
    ...exclusionFilters,
  ];
  const cursorFilters: FilterQuery<IProductDocument>[] = cursor
    ? [{ _id: { $gt: cursor } }]
    : [];

  return {
    hasScope: true,
    selector: {
      ...baseSelector,
      $and: [...totalAndFilters, ...cursorFilters],
    },
    totalSelector: {
      ...baseSelector,
      $and: totalAndFilters,
    },
  };
};

const getProductUpdatedAt = (
  product: Pick<TProductKnowledgeRecord, 'updatedAt' | 'createdAt'>,
) =>
  (product.updatedAt || product.createdAt || new Date()).toISOString();

const formatProductPrice = ({
  unitPrice,
  currency,
}: Pick<TProductKnowledgeRecord, 'unitPrice' | 'currency'>) => {
  if (typeof unitPrice !== 'number' || !Number.isFinite(unitPrice)) {
    return '';
  }

  return `Price: ${unitPrice}${currency ? ` ${currency}` : ''}`;
};

const formatProductContent = (product: TProductKnowledgeRecord) =>
  [
    'Source: indexed product catalog',
    `Product ID: ${product._id}`,
    product.name && `Name: ${product.name}`,
    product.shortName &&
      product.shortName !== product.name &&
      `Short name: ${product.shortName}`,
    product.code && `Code: ${product.code}`,
    product.type && `Type: ${product.type}`,
    product.categoryId && `Category ID: ${product.categoryId}`,
    formatProductPrice(product),
    product.uom && `UOM: ${product.uom}`,
    product.status && `Status: ${product.status}`,
    product.barcodes?.length && `Barcodes: ${product.barcodes.join(', ')}`,
    product.description,
  ]
    .filter(Boolean)
    .join('\n');

const toKnowledgeDocument = (
  product: TProductKnowledgeRecord,
): TKnowledgeDocument => ({
  source: {
    type: buildKnowledgeSourceType({
      pluginName: 'core',
      moduleName: 'products',
      key: CORE_PRODUCT_KNOWLEDGE_SOURCE_KEY,
    }),
    id: product._id,
    version: getProductUpdatedAt(product),
    updatedAt: getProductUpdatedAt(product),
  },
  title: product.name || product.shortName || product.code || 'Untitled product',
  content: formatProductContent(product),
  contentFormat: 'text',
  metadata: {
    sourceKind: 'indexed-product-catalog',
    visibility: 'public',
    productId: product._id,
    categoryId: product.categoryId,
    unitPrice: product.unitPrice,
    currency: product.currency,
    uom: product.uom,
  },
});

const findProductKnowledgeBatch = async (
  models: IModels,
  input: TProductKnowledgeBatchInput,
): Promise<TAiKnowledgeDocumentBatchResult> => {
  const limit = normalizeBatchLimit(input.limit);
  const { hasScope, selector, totalSelector } =
    await buildProductKnowledgeSelector({
      models,
      sourceIds: input.sourceIds,
      candidateSourceIds: input.candidateSourceIds,
      config: input.config,
      cursor: input.cursor,
    });

  if (!hasScope) {
    return {
      documents: [],
      totalCount: 0,
      hasMore: false,
    };
  }

  const [totalCount, products] = await Promise.all([
    input.skipTotalCount
      ? Promise.resolve(0)
      : models.Products.countDocuments(totalSelector),
    models.Products.find(selector)
      .sort({ _id: 1 })
      .limit(limit)
      .select({
        _id: 1,
        name: 1,
        shortName: 1,
        code: 1,
        type: 1,
        categoryId: 1,
        unitPrice: 1,
        currency: 1,
        uom: 1,
        status: 1,
        barcodes: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .lean<TProductKnowledgeRecord[]>(),
  ]);
  const lastProduct = products[products.length - 1];

  return {
    documents: products
      .map(toKnowledgeDocument)
      .filter((document) => document.content.trim().length > 0),
    totalCount,
    nextCursor: products.length === limit ? lastProduct?._id : undefined,
    hasMore: products.length === limit,
  };
};

export const refreshProductKnowledge = async ({
  subdomain,
  productIds,
}: {
  subdomain: string;
  productIds: string[];
}) => {
  const uniqueIds = uniqueStrings(productIds);

  await Promise.all(
    uniqueIds.map(async (productId) => {
      try {
        await enqueueAiKnowledgeSourceRefreshJob({
          subdomain,
          source: {
            pluginName: 'core',
            moduleName: 'products',
            key: CORE_PRODUCT_KNOWLEDGE_SOURCE_KEY,
            sourceId: productId,
            updatedAt: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error(
          `Failed to queue product knowledge refresh for ${productId}:`,
          error,
        );
      }
    }),
  );
};

export const coreProductAiKnowledgeProvider = {
  async loadAiKnowledgeDocumentBatch(
    models: IModels,
    data: TAutomationProducersInput['loadAiKnowledgeDocumentBatch'],
  ) {
    if (data.sourceKey !== CORE_PRODUCT_KNOWLEDGE_SOURCE_KEY) {
      throw new Error(`Unsupported AI knowledge source: ${data.sourceKey}`);
    }

    return findProductKnowledgeBatch(models, {
      sourceIds: data.sourceIds,
      candidateSourceIds: data.candidateSourceIds,
      config: data.config,
      cursor: data.cursor,
      limit: data.limit,
      skipTotalCount: data.skipTotalCount,
    });
  },
};
