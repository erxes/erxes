import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';

import {
  IProductSimilarityBulkInput,
  IProductSimilarityDocument,
} from '@/products/@types/similarity';
import {
  PRODUCT_SIMILARITY_STATUSES,
  PRODUCT_STATUSES,
} from '@/products/constants';
import { productSimilaritySchema } from '@/products/db/definitions/similarities';
import { IModels } from '~/connectionResolvers';

export interface IProductSimilarityModel
  extends Model<IProductSimilarityDocument> {
  getSimilarity(_id: string): Promise<IProductSimilarityDocument>;
  bulkSaveSimilarity(
    doc: IProductSimilarityBulkInput,
    _user?: any,
  ): Promise<IProductSimilarityDocument>;
  removeSimilarity(_id: string): Promise<string>;
  setStar(_id: string, productId: string): Promise<IProductSimilarityDocument>;
  buildCombinations(
    propertiesData: Record<string, string[]>,
  ): Record<string, string>[];
}

const cartesian = (
  propertiesData: Record<string, string[]>,
): Record<string, string>[] => {
  const fieldIds = Object.keys(propertiesData || {});

  let combos: Record<string, string>[] = [{}];

  for (const fieldId of fieldIds) {
    const values = propertiesData[fieldId] || [];
    const next: Record<string, string>[] = [];

    for (const combo of combos) {
      for (const value of values) {
        next.push({ ...combo, [fieldId]: value });
      }
    }

    combos = next;
  }

  return combos;
};

export const loadProductSimilarityClass = (
  models: IModels,
  _subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class ProductSimilarity {
    public static buildCombinations(propertiesData: Record<string, string[]>) {
      return cartesian(propertiesData);
    }

    public static async getSimilarity(_id: string) {
      const similarity = await models.ProductSimilarities.findOne({
        _id,
      }).lean();

      if (!similarity) {
        throw new Error('Similarity not found');
      }

      return similarity;
    }

    public static async bulkSaveSimilarity(
      doc: IProductSimilarityBulkInput,
      _user?: any,
    ) {
      const { _id, title, info, propertiesData, rows = [], starRowKey } = doc;

      if (!info?.baseCode) {
        throw new Error('Base code is required');
      }

      const activeRows = rows.filter((r) => !r.isExcluded);

      if (!activeRows.length) {
        throw new Error('At least one product is required');
      }

      const combinations = cartesian(propertiesData || {});

      if (combinations.length !== rows.length) {
        throw new Error(
          'Row count does not match the selected property combinations',
        );
      }

      const seenCodes = new Set<string>();
      for (const row of activeRows) {
        const cleanCode = (row.code || '').replace(/\*/g, '').replace(/ /g, '');
        if (seenCodes.has(cleanCode)) {
          throw new Error(`Duplicate code in bulk: ${cleanCode}`);
        }
        seenCodes.add(cleanCode);
      }

      let similarity: IProductSimilarityDocument;
      if (_id) {
        await models.ProductSimilarities.updateOne(
          { _id },
          { $set: { title, info, propertiesData } },
        );
        similarity = await models.ProductSimilarities.getSimilarity(_id);
      } else {
        similarity = await models.ProductSimilarities.create({
          title,
          info,
          propertiesData,
          status: PRODUCT_SIMILARITY_STATUSES.ACTIVE,
        });
      }

      const newRowCodes = activeRows
        .filter((r) => !r.productId)
        .map((r) => (r.code || '').replace(/\*/g, '').replace(/ /g, ''));

      const reviveIdByCode = new Map<string, string>();
      if (newRowCodes.length) {
        const existing = await models.Products.find({
          code: { $in: newRowCodes },
        })
          .select({ _id: 1, code: 1, status: 1, similarityId: 1 })
          .lean();

        const conflicts: string[] = [];
        for (const product of existing) {
          const isOwnDeleted =
            product.status === PRODUCT_STATUSES.DELETED &&
            product.similarityId === similarity._id;

          if (isOwnDeleted) {
            reviveIdByCode.set(product.code, product._id);
          } else {
            conflicts.push(product.code);
          }
        }

        if (conflicts.length) {
          const codes = [...new Set(conflicts)].join(', ');
          throw new Error(
            `Cannot save: these codes are already used by other products: ${codes}. Change the code(s) and try again.`,
          );
        }
      }

      const productIds: string[] = [];
      let starProductId: string | undefined;

      const starCode = activeRows.some((r) => r.code === starRowKey)
        ? starRowKey
        : activeRows[0].code;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const combination = combinations[i];

        if (row.isExcluded) {
          if (row.productId) {
            await models.Products.removeProducts([row.productId]);
          }
          continue;
        }

        const cleanCode = (row.code || '').replace(/\*/g, '').replace(/ /g, '');
        const reviveId = !row.productId
          ? reviveIdByCode.get(cleanCode)
          : undefined;

        const productDoc = {
          ...info,
          code: row.code,
          unitPrice: row.unitPrice ?? info.unitPrice,
          propertiesData: combination,
          similarityId: similarity._id,
          ...(reviveId ? { status: PRODUCT_STATUSES.ACTIVE } : {}),
        } as any;

        let productId = row.productId || reviveId;

        if (productId) {
          await models.Products.updateProductFromBulk(productId, productDoc);
        } else {
          const product = await models.Products.createProduct(productDoc);
          productId = product._id;
        }

        productIds.push(productId);

        if (row.code === starCode) {
          starProductId = productId;
        }
      }

      await models.ProductSimilarities.updateOne(
        { _id: similarity._id },
        { $set: { productIds, starProductId } },
      );

      sendDbEventLog({
        action: _id ? 'update' : 'create',
        docId: similarity._id,
      });

      return models.ProductSimilarities.getSimilarity(similarity._id);
    }

    public static async removeSimilarity(_id: string) {
      const similarity = await models.ProductSimilarities.getSimilarity(_id);

      if (similarity.productIds?.length) {
        await models.Products.removeProducts(similarity.productIds);
      }

      await models.ProductSimilarities.updateOne(
        { _id },
        { $set: { status: PRODUCT_SIMILARITY_STATUSES.DELETED } },
      );

      sendDbEventLog({ action: 'update', docId: _id });

      return 'deleted';
    }

    public static async setStar(_id: string, productId: string) {
      const similarity = await models.ProductSimilarities.getSimilarity(_id);

      if (!(similarity.productIds || []).includes(productId)) {
        throw new Error('Product is not a member of this similarity group');
      }

      await models.ProductSimilarities.updateOne(
        { _id },
        { $set: { starProductId: productId } },
      );

      return models.ProductSimilarities.getSimilarity(_id);
    }
  }

  productSimilaritySchema.loadClass(ProductSimilarity);

  return productSimilaritySchema;
};
