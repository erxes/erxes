import { ICustomField } from "@erxes/api-utils/src/types";
import { Model } from "mongoose";
import * as _ from "lodash";
import { IModels } from "../../connectionResolver";
import { sendSalesMessage } from "../../messageBroker";
import {
  IProduct,
  IProductCategory,
  IProductCategoryDocument,
  IProductDocument,
  productCategorySchema,
  productSchema,
  PRODUCT_STATUSES
} from "./definitions/products";
import {
  checkCodeMask,
  checkSameMaskConfig,
  initCustomField
} from "./maskUtils";
import { escapeRegExp } from "@erxes/api-utils/src/core";
import { nanoid } from 'nanoid';

export interface IProductModel extends Model<IProductDocument> {
  getProduct(selector: any): Promise<IProductDocument>;
  createProduct(doc: IProduct): Promise<IProductDocument>;
  updateProduct(_id: string, doc: IProduct): Promise<IProductDocument>;
  removeProducts(_ids: string[]): Promise<{ n: number; ok: number }>;
  mergeProducts(
    productIds: string[],
    productFields: IProduct
  ): Promise<IProductDocument>;
  duplicateProduct(_id: string): Promise<IProductDocument>;
}

export const loadProductClass = (models: IModels, subdomain: string) => {
  class Product {
    /**
     *
     * Get Product Cagegory
     */

    public static async getProduct(selector: any) {
      const product = await models.Products.findOne(selector).lean();

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    }

    static async checkCodeDuplication(code: string) {
      const product = await models.Products.findOne({
        code,
        status: { $ne: PRODUCT_STATUSES.DELETED }
      });

      if (product) {
        throw new Error("Code must be unique");
      }
    }

    public static async generateCode(maxAttempts: number = 10) {
      let attempts = 0;

      while (attempts < maxAttempts) {
        const code = nanoid(6);
        const foundProduct = await models.Products.findOne({
          code,
          status: { $ne: PRODUCT_STATUSES.DELETED }
        });

        if (!foundProduct) {
          return code;
        }

        attempts++;
      }

      throw new Error('Unable to generate unique product code after multiple attempts');
    }

    static fixBarcodes(barcodes?, variants?) {
      if (barcodes && barcodes.length) {
        barcodes = barcodes
          .filter(bc => bc)
          .map(bc => bc.replace(/\s/g, "").replace(/_/g, ""));

        if (variants) {
          const undefinedVariantCodes = Object.keys(variants).filter(
            key => !(barcodes || []).includes(key)
          );
          if (undefinedVariantCodes.length) {
            for (const unDefCode of undefinedVariantCodes) {
              delete variants[unDefCode];
            }
          }
        }
      }

      return { barcodes, variants };
    }

    /**
     * Create a product
     */
    public static async createProduct(doc: IProduct) {
      doc.code = doc.code
        .replace(/\*/g, "")
        .replace(/_/g, "")
        .replace(/ /g, "");
      await this.checkCodeDuplication(doc.code);

      doc = { ...doc, ...this.fixBarcodes(doc.barcodes, doc.variants) };

      if (doc.categoryCode) {
        const category = await models.ProductCategories.getProductCategory({
          code: doc.categoryCode
        });
        doc.categoryId = category._id;
      }

      if (doc.vendorCode) {
        const vendor = await models.Companies.findOne({
          $or: [
            { code: doc.vendorCode },
            { primaryEmail: doc.vendorCode },
            { primaryPhone: doc.vendorCode },
            { primaryName: doc.vendorCode }
          ]
        });

        doc.vendorId = vendor?._id;
      }

      const category = await models.ProductCategories.getProductCategory({
        _id: doc.categoryId
      });

      if (!(await checkCodeMask(category, doc.code))) {
        throw new Error("Code is not validate of category mask");
      }

      doc.sameMasks = await checkSameMaskConfig(models, doc);

      doc.uom = await models.Uoms.checkUOM(doc);

      doc.customFieldsData = await initCustomField(
        models,
        subdomain,
        category,
        doc.code,
        [],
        doc.customFieldsData
      );

      return models.Products.create({ ...doc, createdAt: new Date() });
    }

    /**
     * Update Product
     */
    public static async updateProduct(_id: string, doc: IProduct) {
      const product = await models.Products.getProduct({ _id });

      const category = await models.ProductCategories.getProductCategory({
        _id: doc.categoryId || product.categoryId
      });

      if (doc.code) {
        doc.code = doc.code.replace(/\*/g, "");
        doc.uom = await models.Uoms.checkUOM(doc);
        doc = { ...doc, ...this.fixBarcodes(doc.barcodes, doc.variants) };

        if (product.code !== doc.code) {
          await this.checkCodeDuplication(doc.code);
        }

        if (!(await checkCodeMask(category, doc.code))) {
          throw new Error("Code is not validate of category mask");
        }
      }

      doc.customFieldsData = await initCustomField(
        models,
        subdomain,
        category,
        doc.code || product.code,
        product.customFieldsData,
        doc.customFieldsData
      );
      doc.sameMasks = await checkSameMaskConfig(models, {
        ...product,
        ...doc
      });

      await models.Products.updateOne({ _id }, { $set: doc });

      return await models.Products.findOne({ _id }).lean();
    }

    /**
     * Remove products
     */
    public static async removeProducts(_ids: string[]) {
      const dealProductIds = await sendSalesMessage({
        subdomain,
        action: "findDealProductIds",
        data: {
          _ids
        },
        isRPC: true,
        defaultValue: []
      });

      const usedIds: string[] = [];
      const unUsedIds: string[] = [];
      let response = "deleted";

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
        response = "updated";
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
      const fields = ["name", "code", "unitPrice", "categoryId", "type"];

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
      const name: string = productFields.name || "";
      const shortName: string = productFields.shortName || "";
      const type: string = productFields.type || "";
      const description: string = productFields.description || "";
      const barcodeDescription: string = productFields.barcodeDescription || "";
      const categoryId: string = productFields.categoryId || "";
      const vendorId: string = productFields.vendorId || "";
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
            code: Math.random().toString().concat("^", productObj.code)
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
        shortName,
        type,
        uom: await models.Uoms.checkUOM({ ...productFields }),
        description,
        categoryId,
        vendorId
      });

      const dealProductIds = await sendSalesMessage({
        subdomain,
        action: "findDealProductIds",
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

      await sendSalesMessage({
        subdomain,
        action: "deals.updateMany",
        data: {
          selector: {
            "productsData.productId": { $in: usedIds }
          },
          modifier: {
            $set: { "productsData.$.productId": product._id }
          }
        },
        isRPC: true
      });

      return product;
    }

    public static async duplicateProduct(productId: string) {
      const product = await models.Products.findOne({ _id: productId }).lean();

      if (!product) throw new Error('Product not found');

      const { _id, code, ...productData } = product;

      const newCode = await this.generateCode();

      const newProduct = await models.Products.createProduct({
        ...productData,
        code: `${code}-${newCode}`,
        name: `${product.name} duplicated`,
      });

      return newProduct;
    }
  }

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
  getChildCategories(categoryIds: string[]): Promise<IProductCategoryDocument[]>;
}

export const loadProductCategoryClass = (models: IModels) => {
  class ProductCategory {
    /**
     *
     * Get Product Cagegory
     */

    public static async getProductCategory(selector: any) {
      const productCategory = await models.ProductCategories.findOne(selector);

      if (!productCategory) {
        throw new Error("Product & service category not found");
      }

      return productCategory;
    }

    static async checkCodeDuplication(code: string) {
      if (code.includes("/")) {
        throw new Error('The "/" character is not allowed in the code');
      }

      const category = await models.ProductCategories.findOne({
        code
      });

      if (category) {
        throw new Error("Code must be unique");
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

      return models.ProductCategories.create({ ...doc, createdAt: new Date() });
    }

    /**
     * Update Product category
     */
    public static async updateProductCategory(
      _id: string,
      doc: IProductCategory
    ) {
      const category = await models.ProductCategories.getProductCategory({
        _id
      });

      if (category.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      const parentCategory = await models.ProductCategories.findOne({
        _id: doc.parentId
      }).lean();

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error("Cannot change category");
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const childCategories = await models.ProductCategories.find({
        $and: [
          { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
          { _id: { $ne: _id } }
        ]
      });

      await models.ProductCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order
      childCategories.forEach(async childCategory => {
        let order = childCategory.order;

        order = order.replace(category.order, doc.order);

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
      await models.ProductCategories.getProductCategory({ _id });

      let count = await models.Products.countDocuments({
        categoryId: _id,
        status: { $ne: PRODUCT_STATUSES.DELETED }
      });
      count += await models.ProductCategories.find({
        parentId: _id
      }).countDocuments();

      if (count > 0) {
        throw new Error("Can't remove a product category");
      }

      return models.ProductCategories.deleteOne({ _id });
    }

    /**
     * Generating order
     */
    public static async generateOrder(
      parentCategory: IProductCategory | null | undefined,
      doc: IProductCategory
    ) {
      const order = parentCategory
        ? `${parentCategory.order}${doc.code}/`
        : `${doc.code}/`;

      return order;
    }

    public static async getChildCategories(categoryIds: string[]) {
      if (!categoryIds.length) {
        return []
      }

      const categories = await models.ProductCategories.find({
        _id: { $in: categoryIds }
      }).lean();

      if (!categories.length) {
        return [];
      }

      const orderQry: any[] = [];
      for (const category of categories) {
        orderQry.push({
          order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) }
        });
      }

      return await models.ProductCategories.find({
        status: { $nin: ["disabled", "archived"] },
        $or: orderQry
      })
        .sort({ order: 1 })
        .lean()
    }
  }

  productCategorySchema.loadClass(ProductCategory);

  return productCategorySchema;
};
