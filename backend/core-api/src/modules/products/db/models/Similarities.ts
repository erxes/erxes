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
import { IUserDocument } from 'erxes-api-shared/core-types';

export interface IProductSimilarityModel extends Model<IProductSimilarityDocument> {
  getSimilarity(_id: string): Promise<IProductSimilarityDocument>;
  addSimilarity(
    doc: IProductSimilarityBulkInput,
    user?: IUserDocument,
  ): Promise<IProductSimilarityDocument>;
  editSimilarity(
    _id: string,
    doc: IProductSimilarityBulkInput,
    user?: IUserDocument,
  ): Promise<IProductSimilarityDocument>;
  removeSimilarity(_id: string): Promise<string>;
}

export const loadProductSimilarityClass = (
  models: IModels,
  _subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  const saveSimilarity = async (
    _id: string | undefined,
    doc: IProductSimilarityBulkInput,
  ) => {
    const { info, propertiesData = {}, rows = [] } = doc;

    if (!info?.code) {
      throw new Error('Code is required');
    }

    const activeRows = rows.filter((r) => !r.isExcluded);

    if (!activeRows.length) {
      throw new Error('At least one product is required');
    }

    const seenCodes = new Set<string>();

    for (const row of rows) {
      if (row.isExcluded) {
        continue;
      }

      if (!row.code) {
        throw new Error('Code is required for included products');
      }

      if (seenCodes.has(row.code)) {
        throw new Error(`Duplicate code in bulk: ${row.code}`);
      }

      seenCodes.add(row.code);
    }

    let similarity: IProductSimilarityDocument;

    if (_id) {
      await models.ProductSimilarities.updateOne(
        { _id },
        { $set: { info, propertiesData } },
      );
      similarity = await models.ProductSimilarities.getSimilarity(_id);
    } else {
      similarity = await models.ProductSimilarities.create({
        info,
        propertiesData,
        status: PRODUCT_SIMILARITY_STATUSES.ACTIVE,
      });
    }

    const linkedIds = activeRows
      .map((r) => r.productId)
      .filter((id): id is string => !!id);

    if (linkedIds.length) {
      const linked = await models.Products.find({ _id: { $in: linkedIds } })
        .select({ _id: 1, code: 1, similarityId: 1 })
        .lean();

      const owned = linked.filter(
        (p) => p.similarityId && p.similarityId !== similarity._id,
      );

      if (owned.length) {
        const codes = [...new Set(owned.map((p) => p.code))].join(', ');
        throw new Error(
          `Cannot save: these products already belong to another similarity group: ${codes}. Remove them from that group first.`,
        );
      }
    }

    const newRowCodes = activeRows
      .filter((r) => !r.productId)
      .map((r) => r.code);

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

    for (const row of rows) {
      if (row.isExcluded) {
        if (row.productId) {
          await models.Products.removeProducts([row.productId]);
        }
        continue;
      }

      const reviveId = !row.productId
        ? reviveIdByCode.get(row.code)
        : undefined;

      const productDoc = {
        ...info,
        code: row.code,
        unitPrice: row.unitPrice ?? info.unitPrice,
        propertiesData: row.propertiesData,
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

      if (row.isDefault) {
        starProductId = productId;
      }
    }

    // keep the previous star when the client didn't (re)pick one
    if (
      !starProductId &&
      similarity.starProductId &&
      productIds.includes(similarity.starProductId)
    ) {
      starProductId = similarity.starProductId;
    }

    if (!starProductId) {
      starProductId = productIds[0];
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
  };

  class ProductSimilarity {
    public static async getSimilarity(_id: string) {
      const similarity = await models.ProductSimilarities.findOne({
        _id,
      }).lean();

      if (!similarity) {
        throw new Error('Similarity not found');
      }

      return similarity;
    }

    public static async addSimilarity(
      doc: IProductSimilarityBulkInput,
      user?: IUserDocument,
    ) {
      return saveSimilarity(undefined, doc);
    }

    public static async editSimilarity(
      _id: string,
      doc: IProductSimilarityBulkInput,
      user?: IUserDocument,
    ) {
      return saveSimilarity(_id, doc);
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
  }

  productSimilaritySchema.loadClass(ProductSimilarity);

  return productSimilaritySchema;
};
