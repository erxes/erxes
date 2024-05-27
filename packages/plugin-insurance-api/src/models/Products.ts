import { validSearchText } from '@erxes/api-utils/src';
import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IInsuranceProduct,
  IInsuranceProductDocument,
  productSchema
} from './definitions/products';

export interface IInsuranceProductModel
  extends Model<IInsuranceProductDocument> {
  getProduct(doc: any): IInsuranceProductDocument;
  createProduct(
    doc: IInsuranceProduct,
    userId?: string
  ): IInsuranceProductDocument;
  updateProduct(
    doc: IInsuranceProductDocument,
    userId?: string
  ): IInsuranceProductDocument;
  fillSearchText(doc: IInsuranceProduct): string;
}

export const loadProductClass = (models: IModels) => {
  class Product {
    public static async getProduct(doc: any) {
      const product = await models.Products.findOne(doc);

      if (!product) {
        throw new Error('product not found');
      }

      return product;
    }

    public static async createProduct(doc: IInsuranceProduct, userId?: string) {
      return models.Products.create({
        ...doc,
        lastModifiedBy: userId,
        searchText: models.Products.fillSearchText(doc)
      });
    }

    public static async updateProduct(
      doc: IInsuranceProductDocument,
      userId?: string
    ) {
      const product = await models.Products.getProduct({ _id: doc._id });

      const searchText = models.Products.fillSearchText(
        Object.assign(product, doc)
      );

      const updatedDoc: any = {
        ...doc,
        searchText
      };

      if (userId) {
        updatedDoc.lastModifiedBy = userId;
      }

      await models.Products.updateOne({ _id: doc._id }, { $set: updatedDoc });

      return models.Products.findOne({ _id: doc._id });
    }

    public static fillSearchText(doc: IInsuranceProduct) {
      return validSearchText([doc.code || '', doc.name || '']);
    }
  }

  productSchema.loadClass(Product);

  return productSchema;
};
