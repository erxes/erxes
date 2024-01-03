import { Model } from 'mongoose';
import { PRODUCT_STATUSES } from './definitions/constants';
import {
  IProductCategoryDocument,
  IProductDocument,
  productCategorySchema,
  productSchema
} from './definitions/products';

export interface IProductModel extends Model<IProductDocument> {
  getProduct(selector: any): Promise<IProductDocument>;
  removeProducts(_ids: string[]): Promise<{ n: number; ok: number }>;
  isUsed(_id: string): Promise<boolean>;
}

export const loadProductClass = models => {
  class Product {
    public static async getProduct(selector: any) {
      const product = await models.Products.findOne(selector).lean();

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    }

    /**
     * Remove products
     */
    public static async removeProducts(_ids: string[]) {
      const usedIds: string[] = [];
      const unUsedIds: string[] = [];
      let response = 'deleted';

      for (const id of _ids) {
        if (await this.isUsed(id)) {
          usedIds.push(id);
        } else {
          unUsedIds.push(id);
        }
      }

      if (usedIds.length > 0) {
        await models.Products.updateMany(
          { _id: { $in: usedIds } },
          {
            $set: { status: PRODUCT_STATUSES.DELETED }
          }
        );
        response = 'updated';
      }

      await models.Products.deleteMany({ _id: { $in: unUsedIds } });

      return response;
    }

    public static async isUsed(_id: string) {
      const count = await models.OrderItems.countDocuments({ productId: _id });

      return count > 0;
    }
  } // end Product class

  productSchema.loadClass(Product);

  return productSchema;
};

export interface IProductCategoryModel extends Model<IProductCategoryDocument> {
  getProductCategory(selector: any): Promise<IProductCategoryDocument>;
  removeProductCategory(_id: string): void;
}

export const loadProductCategoryClass = models => {
  class ProductCategory {
    public static async getProductCategory(selector: any) {
      const productCategory = await models.ProductCategories.findOne(
        selector
      ).lean();

      if (!productCategory) {
        throw new Error('Product & service category not found');
      }

      return productCategory;
    }

    /**
     * Remove Product category
     */
    public static async removeProductCategory(_id: string) {
      await models.ProductCategories.getProductCategory({ _id });

      let count = await models.Products.countDocuments({
        categoryId: _id,
        status: { $ne: PRODUCT_STATUSES.DELETED }
      });
      count += await models.ProductCategories.countDocuments({ parentId: _id });

      if (count > 0) {
        throw new Error("Can't remove a product category");
      }

      return models.ProductCategories.deleteOne({ _id });
    }
  }

  productCategorySchema.loadClass(ProductCategory);

  return productCategorySchema;
};
