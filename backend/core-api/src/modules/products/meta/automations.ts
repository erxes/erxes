import {
  buildKnowledgeSourceType,
  enqueueAiKnowledgeSourceRefreshJob,
  type TKnowledgeDocument,
} from 'erxes-api-shared/utils';
import type { TAutomationProducersInput } from 'erxes-api-shared/core-modules';
import type { IModels } from '~/connectionResolvers';

export const CORE_PRODUCT_KNOWLEDGE_SOURCE_KEY = 'product.knowledge';

const getProductUpdatedAt = (product: { updatedAt?: Date; createdAt?: Date }) =>
  (product.updatedAt || product.createdAt || new Date()).toISOString();

const toKnowledgeDocument = (product: {
  _id: string;
  name?: string;
  shortName?: string;
  code?: string;
  type?: string;
  categoryId?: string;
  unitPrice?: number;
  currency?: string;
  status?: string;
  barcodes?: string[];
  description?: string;
  updatedAt?: Date;
  createdAt?: Date;
}): TKnowledgeDocument => ({
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
  title: product.name || product.shortName || 'Untitled product',
  content: [
    'Source: live product catalog',
    product.name && `Name: ${product.name}`,
    product.shortName &&
      product.shortName !== product.name &&
      `Short name: ${product.shortName}`,
    product.code && `Code: ${product.code}`,
    product.type && `Type: ${product.type}`,
    product.categoryId && `Category ID: ${product.categoryId}`,
    typeof product.unitPrice === 'number' && `Price: ${product.unitPrice}`,
    product.currency && `Currency: ${product.currency}`,
    product.status && `Status: ${product.status}`,
    product.barcodes?.length && `Barcodes: ${product.barcodes.join(', ')}`,
    product.description,
  ]
    .filter(Boolean)
    .join('\n'),
  contentFormat: 'text',
  metadata: {
    sourceKind: 'live-product-catalog',
    visibility: 'public',
  },
});

export const refreshProductKnowledge = async ({
  subdomain,
  productIds,
}: {
  subdomain: string;
  productIds: string[];
}) => {
  const uniqueIds = [...new Set(productIds.filter(Boolean))];

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
  async loadAiKnowledgeDocuments(
    models: IModels,
    {
      sourceKey,
      sourceIds,
    }: TAutomationProducersInput['loadAiKnowledgeDocuments'],
  ) {
    if (sourceKey !== CORE_PRODUCT_KNOWLEDGE_SOURCE_KEY) {
      throw new Error(`Unsupported AI knowledge source: ${sourceKey}`);
    }

    const products = await models.Products.find({
      _id: { $in: sourceIds },
      status: { $ne: 'deleted' },
    })
      .select({
        name: 1,
        shortName: 1,
        code: 1,
        type: 1,
        categoryId: 1,
        unitPrice: 1,
        currency: 1,
        status: 1,
        barcodes: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .lean();

    return products
      .map(toKnowledgeDocument)
      .filter((document) => document.content.trim().length > 0);
  },
};
