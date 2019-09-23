import { Model, model } from 'mongoose';
import { Deals, Fields } from '.';
import {
  IProduct,
  IProductCategory,
  IProductCategoryDocument,
  IProductDocument,
  productCategorySchema,
  productSchema,
} from './definitions/deals';

export interface IProductModel extends Model<IProductDocument> {
  createProduct(doc: IProduct): Promise<IProductDocument>;
  updateProduct(_id: string, doc: IProduct): Promise<IProductDocument>;
  removeProduct(_id: string): void;
}

export const loadProductClass = () => {
  class Product {
    /**
     * Create a product
     */
    public static async createProduct(doc: IProduct) {
      if (doc.categoryCode) {
        const category = await ProductCategories.getProductCatogery({ code: doc.categoryCode });
        doc.categoryId = category._id;
      }

      doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});

      return Products.create(doc);
    }

    /**
     * Update Product
     */
    public static async updateProduct(_id: string, doc: IProduct) {
      if (doc.customFieldsData) {
        // clean custom field values
        doc.customFieldsData = await Fields.cleanMulti(doc.customFieldsData || {});
      }

      await Products.updateOne({ _id }, { $set: doc });

      return Products.findOne({ _id });
    }

    /**
     * Remove Product
     */
    public static async removeProduct(_id: string) {
      const product = await Products.findOne({ _id });

      if (!product) {
        throw new Error('Product not found');
      }

      const count = await Deals.find({
        'productsData.productId': { $in: [_id] },
      }).countDocuments();

      if (count > 0) {
        throw new Error("Can't remove a product");
      }

      return Products.deleteOne({ _id });
    }
  }

  productSchema.loadClass(Product);

  return productSchema;
};

export interface IProductCategoryModel extends Model<IProductCategoryDocument> {
  getProductCatogery(selector: any): Promise<IProductCategoryDocument>;
  createProductCategory(doc: IProductCategory): Promise<IProductCategoryDocument>;
  updateProductCategory(_id: string, doc: IProduct): Promise<IProductCategoryDocument>;
  removeProductCategory(_id: string): void;
}

export const loadProductCategoryClass = () => {
  class ProductCategory {
    /**
     *
     * Get Product Cagegory
     */

    public static async getProductCatogery(selector: any) {
      const productCategory = await ProductCategories.findOne(selector);

      if (!productCategory) {
        throw new Error('Product & service category not found');
      }

      return productCategory;
    }

    /**
     * Create a product categorys
     */
    public static async createProductCategory(doc: IProductCategory) {
      const parentCategory = await ProductCategories.findOne({ _id: doc.parentId }).lean();

      // Generatingg order
      doc.order = await this.generateOrder(parentCategory, doc);

      return ProductCategories.create(doc);
    }

    /**
     * Update Product category
     */
    public static async updateProductCategory(_id: string, doc: IProductCategory) {
      const parentCategory = await ProductCategories.findOne({ _id: doc.parentId }).lean();

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const productCategory = await ProductCategories.getProductCatogery({ _id });

      const childCategories = await ProductCategories.find({
        $and: [{ order: { $regex: new RegExp(productCategory.order, 'i') } }, { _id: { $ne: _id } }],
      });

      await ProductCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order
      childCategories.forEach(async category => {
        let order = category.order;

        order = order.replace(productCategory.order, doc.order);

        await ProductCategories.updateOne({ _id: category._id }, { $set: { order } });
      });

      return ProductCategories.findOne({ _id });
    }

    /**
     * Remove Product category
     */
    public static async removeProductCategory(_id: string) {
      await ProductCategories.getProductCatogery({ _id });

      let count = await Products.countDocuments({ categoryId: _id });
      count += await ProductCategories.countDocuments({ parentId: _id });

      if (count > 0) {
        throw new Error("Can't remove a product category");
      }

      return ProductCategories.deleteOne({ _id });
    }

    /**
     * Generating order
     */
    public static async generateOrder(parentCategory: IProductCategory, doc: IProductCategory) {
      const order = parentCategory ? `${parentCategory.order}/${doc.name}${doc.code}` : `${doc.name}${doc.code}`;

      return order;
    }
  }

  productCategorySchema.loadClass(ProductCategory);

  return productCategorySchema;
};

loadProductClass();
loadProductCategoryClass();

// tslint:disable-next-line
export const Products = model<IProductDocument, IProductModel>('products', productSchema);

// tslint:disable-next-line
export const ProductCategories = model<IProductCategoryDocument, IProductCategoryModel>(
  'product_categories',
  productCategorySchema,
);
