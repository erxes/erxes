import { ICustomField, IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { IModels } from '../connectionResolver';
import {
  sendCardsMessage,
  sendContactsMessage,
  sendFormsMessage
} from '../messageBroker';
import {
  IProduct,
  IProductCategory,
  IProductCategoryDocument,
  IProductDocument,
  productCategorySchema,
  productSchema,
  PRODUCT_STATUSES
} from './definitions/products';

export interface IProductModel extends Model<IProductDocument> {
  getProduct(selector: any): Promise<IProductDocument>;
  createProduct(doc: IProduct): Promise<IProductDocument>;
  updateProduct(_id: string, doc: IProduct): Promise<IProductDocument>;
  removeProducts(_ids: string[]): Promise<{ n: number; ok: number }>;
  mergeProducts(
    productIds: string[],
    productFields: IProduct
  ): Promise<IProductDocument>;
}

export const loadProductClass = (models: IModels, subdomain: string) => {
  class Product {
    /**
     *
     * Get Product Cagegory
     */

    public static async getProduct(selector: any) {
      const product = await models.Products.findOne(selector);

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    }

    static async checkCodeDuplication(code: string) {
      const product = await models.Products.findOne({
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

      if (doc.barcodes) {
        doc.barcodes = doc.barcodes
          .filter(bc => bc)
          .map(bc => bc.replace(/\s/g, ''));
      }

      if (doc.categoryCode) {
        const category = await models.ProductCategories.getProductCatogery({
          code: doc.categoryCode
        });
        doc.categoryId = category._id;
      }

      if (doc.vendorCode) {
        const vendor = await sendContactsMessage({
          subdomain,
          action: 'companies.findOne',
          data: {
            $or: [
              { code: doc.vendorCode },
              { primaryEmail: doc.vendorCode },
              { primaryPhone: doc.vendorCode },
              { primaryName: doc.vendorCode }
            ]
          },
          isRPC: true
        });

        doc.vendorId = vendor?._id;
      }

      doc.customFieldsData = await sendFormsMessage({
        subdomain,
        action: 'fields.prepareCustomFieldsData',
        data: doc.customFieldsData,
        isRPC: true
      });

      doc.uom = await models.Uoms.checkUOM(doc);

      return models.Products.create(doc);
    }

    /**
     * Update Product
     */
    public static async updateProduct(_id: string, doc: IProduct) {
      const product = await models.Products.getProduct({ _id });

      if (product.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      if (doc.barcodes) {
        doc.barcodes = doc.barcodes
          .filter(bc => bc)
          .map(bc => bc.replace(/\s/g, ''));
      }

      if (doc.customFieldsData) {
        // clean custom field values
        doc.customFieldsData = await sendFormsMessage({
          subdomain,
          action: 'fields.prepareCustomFieldsData',
          data: doc.customFieldsData,
          isRPC: true
        });
      }
      doc.uom = await models.Uoms.checkUOM(doc);
      await models.Products.updateOne({ _id }, { $set: doc });

      return await models.Products.findOne({ _id }).lean();
    }

    /**
     * Remove products
     */
    public static async removeProducts(_ids: string[]) {
      const dealProductIds = await sendCardsMessage({
        subdomain,
        action: 'findDealProductIds',
        data: {
          _ids
        },
        isRPC: true,
        defaultValue: []
      });

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
      let barcodes: string[] = [];
      const name: string = productFields.name || '';
      const type: string = productFields.type || '';
      const description: string = productFields.description || '';
      const barcodeDescription: string = productFields.barcodeDescription || '';
      const categoryId: string = productFields.categoryId || '';
      const vendorId: string = productFields.vendorId || '';
      const usedIds: string[] = [];

      for (const productId of productIds) {
        const productObj = await models.Products.getProduct({ _id: productId });

        const productTags = productObj.tagIds || [];

        const productBarcodes = productObj.barcodes || [];

        // merge custom fields data
        customFieldsData = [
          ...customFieldsData,
          ...(productObj.customFieldsData || [])
        ];

        // Merging products tagIds
        tagIds = tagIds.concat(productTags);

        // Merging products barcodes
        barcodes = barcodes.concat(productBarcodes);

        await models.Products.findByIdAndUpdate(productId, {
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

      // Removing Duplicates
      barcodes = Array.from(new Set(barcodes));

      // Creating product with properties
      const product = await models.Products.createProduct({
        ...productFields,
        customFieldsData,
        tagIds,
        barcodes,
        barcodeDescription,
        mergedIds: productIds,
        name,
        type,
        uom: await models.Uoms.checkUOM({ ...productFields }),
        description,
        categoryId,
        vendorId
      });

      const dealProductIds = await sendCardsMessage({
        subdomain,
        action: 'findDealProductIds',
        data: {
          _ids: productIds
        },
        isRPC: true
      });

      for (const deal of dealProductIds) {
        if (productIds.includes(deal)) {
          usedIds.push(deal);
        }
      }

      await sendCardsMessage({
        subdomain,
        action: 'deals.updateMany',
        data: {
          selector: {
            'productsData.productId': { $in: usedIds }
          },
          modifier: {
            $set: { 'productsData.$.productId': product._id }
          }
        },
        isRPC: true
      });

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

export const loadProductCategoryClass = (models: IModels) => {
  class ProductCategory {
    /**
     *
     * Get Product Cagegory
     */

    public static async getProductCatogery(selector: any) {
      const productCategory = await models.ProductCategories.findOne(selector);

      if (!productCategory) {
        throw new Error('Product & service category not found');
      }

      return productCategory;
    }

    static async checkCodeDuplication(code: string) {
      if (code.includes('/')) {
        throw new Error('The "/" character is not allowed in the code');
      }

      const category = await models.ProductCategories.findOne({
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

      const parentCategory = await models.ProductCategories.findOne({
        _id: doc.parentId
      }).lean();

      // Generatingg order
      doc.order = await this.generateOrder(parentCategory, doc);

      return models.ProductCategories.create(doc);
    }

    /**
     * Update Product category
     */
    public static async updateProductCategory(
      _id: string,
      doc: IProductCategory
    ) {
      const category = await models.ProductCategories.getProductCatogery({
        _id
      });

      if (category.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      const parentCategory = await models.ProductCategories.findOne({
        _id: doc.parentId
      }).lean();

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const productCategory = await models.ProductCategories.getProductCatogery(
        {
          _id
        }
      );

      const childCategories = await models.ProductCategories.find({
        $and: [
          { order: { $regex: new RegExp(productCategory.order, 'i') } },
          { _id: { $ne: _id } }
        ]
      });

      await models.ProductCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order
      childCategories.forEach(async childCategory => {
        let order = childCategory.order;

        order = order.replace(productCategory.order, doc.order);

        await models.ProductCategories.updateOne(
          { _id: childCategory._id },
          { $set: { order } }
        );
      });

      return models.ProductCategories.findOne({ _id });
    }

    /**
     * Remove Product category
     */
    public static async removeProductCategory(_id: string) {
      await models.ProductCategories.getProductCatogery({ _id });

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

    /**
     * Generating order
     */
    public static async generateOrder(
      parentCategory: IProductCategory,
      doc: IProductCategory
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
