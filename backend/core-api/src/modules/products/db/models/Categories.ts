import {
  PRODUCT_CATEGORY_STATUSES,
  PRODUCT_STATUSES,
} from '@/products/constants';
import { productCategorySchema } from '@/products/db/definitions/categories';
import {
  IProductCategory,
  IProductCategoryDocument,
} from 'erxes-api-shared/core-types';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { DeleteResult } from 'mongodb';

export interface IProductCategoryModel extends Model<IProductCategoryDocument> {
  getProductCategory(selector: any): Promise<IProductCategoryDocument>;
  createProductCategory(
    doc: IProductCategory,
  ): Promise<IProductCategoryDocument>;
  updateProductCategory(
    _id: string,
    doc: IProductCategory,
  ): Promise<IProductCategoryDocument>;
  removeProductCategory(_id: string): Promise<DeleteResult>;
  getChildCategories(
    categoryIds: string[],
  ): Promise<IProductCategoryDocument[]>;
}

export const loadProductCategoryClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class ProductCategory {
    /**
     * Get Product Category
     */
    public static async getProductCategory(selector: any) {
      const productCategory = await models.ProductCategories.findOne(selector);

      if (!productCategory) {
        throw new Error('Product & service category not found');
      }

      return productCategory;
    }

    /**
     * Get child cagegories
     */
    public static async getChildCategories(categoryIds: string[]) {
      if (!categoryIds.length) {
        return [];
      }

      const categories = await models.ProductCategories.find({
        _id: { $in: categoryIds },
      }).lean();

      if (!categories.length) {
        return [];
      }

      const orderQry: any[] = [];
      for (const category of categories) {
        orderQry.push({
          order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
        });
      }

      return await models.ProductCategories.find({
        status: { $nin: ['disabled', 'archived'] },
        $or: orderQry,
      })
        .sort({ order: 1 })
        .lean();
    }

    /**
     * Create a product categorys
     */
    public static async createProductCategory(doc: IProductCategory) {
      await this.checkCodeDuplication(doc.code);

      const parentCategory = doc.parentId
        ? await models.ProductCategories.findOne({ _id: doc.parentId }).lean()
        : null;

      doc.parentId = parentCategory?._id || '';

      // Generating order
      doc.order = await this.generateOrder(parentCategory, doc);

      const category = await models.ProductCategories.create({
        ...doc,
        createdAt: new Date(),
      });
      sendDbEventLog({
        action: 'create',
        docId: category._id,
        currentDocument: category.toObject(),
      });
      return category;
    }

    /**
     * Update Product category
     */
    public static async updateProductCategory(
      _id: string,
      doc: IProductCategory,
    ) {
      const category = await models.ProductCategories.getProductCategory({
        _id,
      });

      if (category.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      let parentId = doc.parentId ?? category.parentId;

      if (parentId === _id) {
        parentId = '';
      }

      const parentCategory = parentId
        ? await models.ProductCategories.findOne({ _id: parentId }).lean()
        : null;

      doc.parentId = parentCategory?._id || '';

      if (
        parentCategory &&
        category.order &&
        parentCategory.order?.startsWith(category.order)
      ) {
        throw new Error('Cannot move a category under its own descendant');
      }

      // Generating order
      doc.order = await this.generateOrder(parentCategory, doc);

      const orderChanged = !!category.order && category.order !== doc.order;

      const childCategories = orderChanged
        ? await models.ProductCategories.find({
            $and: [
              {
                order: {
                  $regex: new RegExp(`^${escapeRegExp(category.order)}`),
                },
              },
              { _id: { $ne: _id } },
            ],
          })
        : [];

      await models.ProductCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order by swapping the old order prefix
      for (const childCategory of childCategories) {
        const order =
          doc.order + childCategory.order.slice(category.order.length);

        await models.ProductCategories.updateOne(
          { _id: childCategory._id },
          { $set: { order } },
        );
      }

      const updatedCategory = await models.ProductCategories.findOne({ _id });
      if (updatedCategory) {
        sendDbEventLog({
          action: 'update',
          docId: updatedCategory._id,
          currentDocument: updatedCategory.toObject(),
          prevDocument: category.toObject(),
        });
      }
      return updatedCategory;
    }

    /**
     * Remove Product category
     */
    public static async removeProductCategory(_id: string) {
      const session = await models.ProductCategories.db.startSession();
      let deletion:
        | {
            category: IProductCategoryDocument;
            result: DeleteResult;
          }
        | undefined;

      try {
        deletion = await session.withTransaction(async () => {
          const category = await models.ProductCategories.findOne({
            _id,
          }).session(session);

          if (!category) {
            throw new Error('Product & service category not found');
          }

          const [productCount, childCount] = await Promise.all([
            models.Products.countDocuments({
              categoryId: _id,
              status: { $ne: PRODUCT_STATUSES.DELETED },
            }).session(session),
            models.ProductCategories.countDocuments({
              parentId: _id,
              status: {
                $nin: [
                  PRODUCT_CATEGORY_STATUSES.DISABLED,
                  PRODUCT_CATEGORY_STATUSES.ARCHIVED,
                ],
              },
            }).session(session),
          ]);

          if (productCount > 0 || childCount > 0) {
            const blockers: string[] = [];

            if (productCount > 0) {
              blockers.push(
                `${productCount} ${
                  productCount === 1 ? 'product' : 'products'
                }`,
              );
            }

            if (childCount > 0) {
              blockers.push(
                `${childCount} ${
                  childCount === 1 ? 'sub-category' : 'sub-categories'
                }`,
              );
            }

            throw new Error(
              `Can't remove category "${category.name}": it has ${blockers.join(
                ' and ',
              )}. Move or delete them first.`,
            );
          }

          const result = await models.ProductCategories.deleteOne({
            _id,
          }).session(session);

          return {
            category,
            result,
          };
        });
      } finally {
        await session.endSession();
      }

      if (!deletion) {
        throw new Error('Failed to remove product category');
      }

      const { category, result } = deletion;

      if (!result.acknowledged || result.deletedCount !== 1) {
        throw new Error('Failed to remove product category');
      }

      sendDbEventLog({
        action: 'delete',
        docId: category._id,
        prevDocument: category.toObject(),
      });

      return result;
    }

    /**
     * Check category duplication
     */
    static async checkCodeDuplication(code: string) {
      if (code.includes('/')) {
        throw new Error('The "/" character is not allowed in the code');
      }

      const category = await models.ProductCategories.findOne({
        code,
      });

      if (category) {
        throw new Error('Code must be unique');
      }
    }

    /**
     * Generating order
     */
    public static async generateOrder(
      parentCategory: IProductCategory | null | undefined,
      doc: IProductCategory,
    ) {
      const order = parentCategory
        ? `${parentCategory.order}${doc.code}/`
        : `${doc.code}/`;

      return order;
    }
  }

  productCategorySchema.loadClass(ProductCategory);

  return productCategorySchema;
};
