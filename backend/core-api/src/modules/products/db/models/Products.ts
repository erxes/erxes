import {
  ICustomField,
  IProduct,
  IProductDocument,
} from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';

import { PRODUCT_STATUSES } from '@/products/constants';
import { productSchema } from '@/products/db/definitions/products';
import {
  checkCodeMask,
  checkSameMaskConfig,
  initCustomField,
} from '@/products/utils';
import { IModels } from '~/connectionResolvers';

export interface IProductModel extends Model<IProductDocument> {
  getProduct(selector: any): Promise<IProductDocument>;
  createProduct(doc: IProduct): Promise<IProductDocument>;
  updateProduct(_id: string, doc: IProduct): Promise<IProductDocument>;
  removeProducts(_ids: string[]): Promise<{ n: number; ok: number }>;
  mergeProducts(
    productIds: string[],
    productFields: IProduct,
  ): Promise<IProductDocument>;
  duplicateProduct(_id: string): Promise<IProductDocument>;
}

export const loadProductClass = (models: IModels) => {
  class Product {
    /**
     * Get Product
     */
    public static async getProduct(selector: any) {
      const product = await models.Products.findOne(selector).lean();

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    }

    /**
     * Create a product
     */
    public static async createProduct(doc: IProduct) {
      doc.code = doc.code
        .replace(/\*/g, '')
        .replace(/_/g, '')
        .replace(/ /g, '');
      await this.checkCodeDuplication(doc.code);

      doc = { ...doc, ...this.fixBarcodes(doc.barcodes, doc.variants) };

      if (doc.categoryCode) {
        const category = await models.ProductCategories.getProductCategory({
          code: doc.categoryCode,
        });
        doc.categoryId = category._id;
      }

      if (doc.vendorCode) {
        const vendor = await models.Companies.findOne({
          $or: [
            { code: doc.vendorCode },
            { primaryEmail: doc.vendorCode },
            { primaryPhone: doc.vendorCode },
            { primaryName: doc.vendorCode },
          ],
        });

        doc.vendorId = vendor?._id;
      }

      const category = await models.ProductCategories.getProductCategory({
        _id: doc.categoryId,
      });

      if (!checkCodeMask(category, doc.code)) {
        throw new Error('Code does not match the category mask');
      }

      doc.sameMasks = await checkSameMaskConfig(models, doc);

      doc.uom = await models.Uoms.checkUOM(doc);

      doc.customFieldsData = await initCustomField(
        models,
        category,
        doc.code,
        [],
        doc.customFieldsData,
      );

      return models.Products.create({ ...doc, createdAt: new Date() });
    }

    /**
     * Update Product
     */
    public static async updateProduct(_id: string, doc: IProduct) {
      const product = await models.Products.getProduct({ _id });

      const category = await models.ProductCategories.getProductCategory({
        _id: doc.categoryId || product.categoryId,
      });

      if (doc.code) {
        doc.code = doc.code.replace(/\*/g, '');
        doc.uom = await models.Uoms.checkUOM(doc);
        doc = { ...doc, ...this.fixBarcodes(doc.barcodes, doc.variants) };

        if (product.code !== doc.code) {
          await this.checkCodeDuplication(doc.code);
        }

        if (!checkCodeMask(category, doc.code)) {
          throw new Error('Code does not match the category mask');
        }
      }

      doc.customFieldsData = await initCustomField(
        models,
        category,
        doc.code || product.code,
        product.customFieldsData,
        doc.customFieldsData,
      );

      doc.sameMasks = await checkSameMaskConfig(models, {
        ...product,
        ...doc,
      });

      await models.Products.updateOne({ _id }, { $set: doc });

      return await models.Products.findOne({ _id }).lean();
    }

    /**
     * Remove products
     */
    public static async removeProducts(_ids: string[]) {
      const usedIds: string[] = [];
      const unUsedIds: string[] = [];
      let response = 'deleted';

      // Fetch existing product IDs
      const existingProducts = await models.Products.find(
        { _id: { $in: _ids } },
        { _id: 1 },
      );

      const existingIds = new Set(
        existingProducts.map((product) => product._id.toString()),
      );

      for (const id of _ids) {
        if (existingIds.has(id)) {
          usedIds.push(id);
        } else {
          unUsedIds.push(id);
        }
      }

      if (usedIds.length > 0) {
        await models.Products.updateMany(
          { _id: { $in: usedIds } },
          { $set: { status: PRODUCT_STATUSES.DELETED } },
        );
        response = 'updated';
      }

      if (unUsedIds.length > 0) {
        await models.Products.deleteMany({ _id: { $in: unUsedIds } });
      }

      return response;
    }

    /**
     * Merge products
     */
    public static async mergeProducts(
      productIds: string[],
      productFields: IProduct,
    ) {
      const fields = ['name', 'code', 'unitPrice', 'categoryId', 'type'];

      for (const field of fields) {
        if (!productFields[field]) {
          throw new Error(
            `Can not merge products. Must choose ${field} field.`,
          );
        }
      }

      let customFieldsData: ICustomField[] = [];
      let tagIds: string[] = [];
      let barcodes: string[] = [];
      const name: string = productFields.name || '';
      const shortName: string = productFields.shortName || '';
      const type: string = productFields.type || '';
      const description: string = productFields.description || '';
      const barcodeDescription: string = productFields.barcodeDescription || '';
      const categoryId: string = productFields.categoryId || '';
      const vendorId: string = productFields.vendorId || '';

      for (const productId of productIds) {
        const productObj = await models.Products.getProduct({ _id: productId });

        const productTags = productObj.tagIds || [];

        const productBarcodes = productObj.barcodes || [];

        // merge custom fields data
        customFieldsData = [
          ...customFieldsData,
          ...(productObj.customFieldsData || []),
        ];

        // Merging products tagIds
        tagIds = tagIds.concat(productTags);

        // Merging products barcodes
        barcodes = barcodes.concat(productBarcodes);

        await models.Products.findByIdAndUpdate(productId, {
          $set: {
            status: PRODUCT_STATUSES.DELETED,
            code: Math.random().toString().concat('^', productObj.code),
          },
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
        vendorId,
      });

      return product;
    }

    /**
     * Duplicate product
     */
    public static async duplicateProduct(productId: string) {
      const product = await models.Products.findOne({ _id: productId }).lean();

      if (!product) throw new Error('Product not found');

      const { code, ...productData } = product;

      const newCode = await this.generateCode();

      const newProduct = await models.Products.createProduct({
        ...productData,
        code: `${code}-${newCode}`,
        name: `${product.name} duplicated`,
      });

      return newProduct;
    }

    /**
     * Check product duplication
     */
    static async checkCodeDuplication(code: string) {
      const product = await models.Products.findOne({
        code,
        status: { $ne: PRODUCT_STATUSES.DELETED },
      });

      if (product) {
        throw new Error('Code must be unique');
      }
    }

    /**
     * Generate product code
     */
    public static async generateCode(maxAttempts = 10) {
      let attempts = 0;

      while (attempts < maxAttempts) {
        const code = nanoid(6);
        const foundProduct = await models.Products.findOne({
          code,
          status: { $ne: PRODUCT_STATUSES.DELETED },
        });

        if (!foundProduct) {
          return code;
        }

        attempts++;
      }

      throw new Error(
        'Unable to generate unique product code after multiple attempts',
      );
    }

    /**
     * Check product barcode
     */
    static fixBarcodes(barcodes?, variants?) {
      if (barcodes && barcodes.length) {
        barcodes = barcodes
          .filter((bc) => bc)
          .map((bc) => bc.replace(/\s/g, '').replace(/_/g, ''));

        if (variants) {
          const undefinedVariantCodes = Object.keys(variants).filter(
            (key) => !(barcodes || []).includes(key),
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
  }

  productSchema.loadClass(Product);

  return productSchema;
};
