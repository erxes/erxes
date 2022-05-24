import mongoose, { Model, model } from 'mongoose';
import { PRODUCT_STATUSES } from './definitions/constants';
import {
  IProduct,
  IProductCategory,
  IProductCategoryDocument,
  IProductDocument,
  productCategorySchema,
  productSchema
} from './definitions/products';
import { OrderItems } from './OrderItems';

const checkSKU = (doc: IProduct) => {
  if (!doc.sku) {
    doc.sku = 'ш';
  }

  return doc;
};

export interface IProductModel extends Model<IProductDocument> {
  updateProductCategory(productIds: any, productFields: any);
  getProduct(selector: any): Promise<IProductDocument>;
  createProduct(doc: IProduct): Promise<IProductDocument>;
  updateProduct(_id: string, doc: IProduct): Promise<IProductDocument>;
  removeProducts(_ids: string[]): Promise<{ n: number; ok: number }>;
  isUsed(_id: string): Promise<boolean>;
}

export const loadProductClass = () => {
  class Product {
    public static async getProduct(selector: any) {
      const product = await Products.findOne(selector);

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    }

    static async checkCodeDuplication(code: string) {
      const product = await Products.findOne({
        code,
        status: { $ne: PRODUCT_STATUSES.DELETED }
      });

      if (product) {
        throw new Error('Code must be unique');
      }
    }

    /**
     * Create a product
     */
    public static async createProduct(doc: IProduct | IProductDocument) {
      await this.checkCodeDuplication(doc.code);

      return Products.create({ ...checkSKU(doc) });
    }

    /**
     * Update Product
     */
    public static async updateProduct(_id: string, doc: IProduct) {
      const product = await Products.getProduct({ _id });

      if (product.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      await Products.updateOne({ _id }, { $set: { ...checkSKU(doc) } });

      return Products.findOne({ _id });
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
        await Products.updateMany(
          { _id: { $in: usedIds } },
          {
            $set: { status: PRODUCT_STATUSES.DELETED }
          }
        );
        response = 'updated';
      }

      await Products.deleteMany({ _id: { $in: unUsedIds } });

      return response;
    }

    public static async isUsed(_id: string) {
      const count = await OrderItems.countDocuments({ productId: _id });

      return count > 0;
    }
  } // end Product class

  productSchema.loadClass(Product);

  return productSchema;
};

export interface IProductCategoryModel extends Model<IProductCategoryDocument> {
  getProductCategory(selector: any): Promise<IProductCategoryDocument>;
  createProductCategory(
    doc: IProductCategory
  ): Promise<IProductCategoryDocument>;
  updateProductCategory(
    _id: string,
    doc: IProductCategory
  ): Promise<IProductCategoryDocument>;
  removeProductCategory(_id: string): void;
}

export const loadProductCategoryClass = () => {
  class ProductCategory {
    public static async getProductCategory(selector: any) {
      const productCategory = await ProductCategories.findOne(selector);

      if (!productCategory) {
        throw new Error('Product & service category not found');
      }

      return productCategory;
    }

    static async checkCodeDuplication(code: string) {
      const category = await ProductCategories.findOne({
        code
      });

      if (category) {
        throw new Error(`Code must be unique ${code}`);
      }
    }

    public static async createProductCategory(
      doc: IProductCategory | IProductCategoryDocument
    ) {
      await this.checkCodeDuplication(doc.code);

      const parentCategory = await ProductCategories.findOne({
        _id: doc.parentId
      }).lean();

      // Generating order
      doc.order = await this.generateOrder(parentCategory, doc);

      return ProductCategories.create(doc);
    }

    /**
     * Update Product category
     */
    public static async updateProductCategory(
      _id: string,
      doc: IProductCategory
    ) {
      const category = await ProductCategories.getProductCategory({ _id });

      if (category.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      const parentCategory = await ProductCategories.findOne({
        _id: doc.parentId
      }).lean();

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const productCategory = await ProductCategories.getProductCategory({
        _id
      });

      const childCategories = await ProductCategories.find({
        $and: [
          { order: { $regex: new RegExp(productCategory.order, 'i') } },
          { _id: { $ne: _id } }
        ]
      });

      await ProductCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order
      childCategories.forEach(async childCategory => {
        let order = childCategory.order;

        order = order.replace(productCategory.order, doc.order);

        await ProductCategories.updateOne(
          { _id: childCategory._id },
          { $set: { order } }
        );
      });

      return ProductCategories.findOne({ _id });
    }

    /**
     * Remove Product category
     */
    public static async removeProductCategory(_id: string) {
      await ProductCategories.getProductCategory({ _id });

      let count = await Products.countDocuments({
        categoryId: _id,
        status: { $ne: PRODUCT_STATUSES.DELETED }
      });
      count += await ProductCategories.countDocuments({ parentId: _id });

      if (count > 0) {
        throw new Error("Can't remove a product category");
      }

      return ProductCategories.deleteOne({ _id });
    }

    /**
     * Generating order
     */
    public static async generateOrder(
      parentCategory: IProductCategory,
      doc: IProductCategory
    ) {
      const order = parentCategory
        ? `${parentCategory.order}/${doc.name}${doc.code}`
        : `${doc.name}${doc.code}`;

      return order;
    }
  }

  productCategorySchema.loadClass(ProductCategory);

  return productCategorySchema;
};

loadProductClass();
loadProductCategoryClass();

delete mongoose.connection.models['products'];
delete mongoose.connection.models['product_categories'];

// tslint:disable-next-line
export const Products = model<IProductDocument, IProductModel>(
  'products',
  productSchema
);

// tslint:disable-next-line
export const ProductCategories = model<
  IProductCategoryDocument,
  IProductCategoryModel
>('product_categories', productCategorySchema);
