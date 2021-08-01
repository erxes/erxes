import { Model, model } from 'mongoose';
import { Deals, Fields } from '.';
import Companies from './Companies';
import { ICustomField } from './definitions/common';
import { PRODUCT_STATUSES } from './definitions/constants';
import {
  IProduct,
  IProductCategory,
  IProductCategoryDocument,
  IProductDocument,
  productCategorySchema,
  productSchema
} from './definitions/deals';
import { IUserDocument } from './definitions/users';

export interface IProductModel extends Model<IProductDocument> {
  updateProductCategory(
    productIds: any,
    productFields: any,
    user: IUserDocument
  );
  getProduct(selector: any): Promise<IProductDocument>;
  createProduct(doc: IProduct): Promise<IProductDocument>;
  updateProduct(_id: string, doc: IProduct): Promise<IProductDocument>;
  removeProducts(_ids: string[]): Promise<{ n: number; ok: number }>;
  mergeProducts(
    productIds: string[],
    productFields: IProduct
  ): Promise<IProductDocument>;
}

export const loadProductClass = () => {
  class Product {
    /**
     *
     * Get Product Cagegory
     */

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
    public static async createProduct(doc: IProduct) {
      await this.checkCodeDuplication(doc.code);

      if (doc.categoryCode) {
        const category = await ProductCategories.getProductCatogery({
          code: doc.categoryCode
        });
        doc.categoryId = category._id;
      }

      if (doc.vendorCode) {
        const vendor = await Companies.findOne({
          $or: [
            { code: doc.vendorCode },
            { primaryEmail: doc.vendorCode },
            { primaryPhone: doc.vendorCode },
            { primaryName: doc.vendorCode }
          ]
        });

        doc.vendorId = vendor?._id;
      }

      doc.customFieldsData = await Fields.prepareCustomFieldsData(
        doc.customFieldsData
      );

      return Products.create(doc);
    }

    /**
     * Update Product
     */
    public static async updateProduct(_id: string, doc: IProduct) {
      const product = await Products.getProduct({ _id });

      if (product.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      if (doc.customFieldsData) {
        // clean custom field values
        doc.customFieldsData = await Fields.prepareCustomFieldsData(
          doc.customFieldsData
        );
      }

      await Products.updateOne({ _id }, { $set: doc });

      return Products.findOne({ _id });
    }

    /**
     * Remove products
     */
    public static async removeProducts(_ids: string[]) {
      const dealProductIds = await Deals.find({
        'productsData.productId': { $in: _ids }
      }).distinct('productsData.productId');

      const usedIds: string[] = [];
      const unUsedIds: string[] = [];
      let response = 'deleted';

      for (const id of _ids) {
        if (!dealProductIds.includes(id)) {
          unUsedIds.push(id);
        } else {
          usedIds.push(id);
        }
      }

      if (usedIds.length > 0) {
        await Products.findByIdAndUpdate(usedIds, {
          $set: { status: PRODUCT_STATUSES.DELETED }
        });
        response = 'updated';
      }

      await Products.deleteMany({ _id: { $in: unUsedIds } });

      return response;
    }

    /**
     * Merge products
     */

    public static async mergeProducts(
      productIds: string[],
      productFields: IProduct
    ) {
      const fields = ['name', 'code', 'unitPrice', 'categoryId', 'type'];

      for (const field of fields) {
        if (!productFields[field]) {
          throw new Error(
            `Can not merge products. Must choose ${field} field.`
          );
        }
      }

      let customFieldsData: ICustomField[] = [];
      let tagIds: string[] = [];
      const name: string = productFields.name || '';
      const type: string = productFields.type || '';
      const description: string = productFields.description || '';
      const categoryId: string = productFields.categoryId || '';
      const vendorId: string = productFields.vendorId || '';
      const usedIds: string[] = [];

      for (const productId of productIds) {
        const productObj = await Products.getProduct({ _id: productId });

        const productTags = productObj.tagIds || [];

        // merge custom fields data
        customFieldsData = [
          ...customFieldsData,
          ...(productObj.customFieldsData || [])
        ];

        // Merging products tagIds
        tagIds = tagIds.concat(productTags);

        await Products.findByIdAndUpdate(productId, {
          $set: {
            status: PRODUCT_STATUSES.DELETED,
            code: Math.random()
              .toString()
              .concat('^', productObj.code)
          }
        });
      }

      // Removing Duplicates
      tagIds = Array.from(new Set(tagIds));

      // Creating product with properties
      const product = await Products.createProduct({
        ...productFields,
        customFieldsData,
        tagIds,
        mergedIds: productIds,
        name,
        type,
        description,
        categoryId,
        vendorId
      });

      const dealProductIds = await Deals.find({
        'productsData.productId': { $in: productIds }
      }).distinct('productsData.productId');

      for (const deal of dealProductIds) {
        if (productIds.includes(deal)) {
          usedIds.push(deal);
        }
      }

      await Deals.updateMany(
        { 'productsData.productId': { $in: usedIds } },
        { $set: { 'productsData.$.productId': product._id } }
      );

      return product;
    }
  }

  productSchema.loadClass(Product);

  return productSchema;
};

export interface IProductCategoryModel extends Model<IProductCategoryDocument> {
  getProductCatogery(selector: any): Promise<IProductCategoryDocument>;
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

    static async checkCodeDuplication(code: string) {
      const category = await ProductCategories.findOne({
        code
      });

      if (category) {
        throw new Error('Code must be unique');
      }
    }

    /**
     * Create a product categorys
     */
    public static async createProductCategory(doc: IProductCategory) {
      await this.checkCodeDuplication(doc.code);

      const parentCategory = await ProductCategories.findOne({
        _id: doc.parentId
      }).lean();

      // Generatingg order
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
      const category = await ProductCategories.getProductCatogery({ _id });

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

      const productCategory = await ProductCategories.getProductCatogery({
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
      await ProductCategories.getProductCatogery({ _id });

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
