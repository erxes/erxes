import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IProductGroup, IProductGroupDocument, productGroupSchema } from './definitions/productGroup';

export interface IProductGroupModel extends Model<IProductGroupDocument> {
  createProductGroup(doc: IProductGroup): Promise<IProductGroupDocument>;
  updateProductGroup(
    _id: string,
    doc: IProductGroup
  ): Promise<IProductGroupDocument>;
  removeProductGroups(ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadProductGroupClass = (models: IModels) => {
  class ProductGroup {
    /**
     * Create a product group
     */
    public static async createProductGroup(doc: IProductGroup) {
      if (doc.mainProductId === doc.subProductId) {
        throw new Error('Do not select the same item.')
      }
      return await models.ProductGroups.create({
        ...doc,
        createdAt: new Date()
      });
    }

    /**
     * Update a product group
     */
    public static async updateProductGroup(_id: string, doc: IProductGroup) {
      if (doc.mainProductId === doc.subProductId) {
        throw new Error('Do not select the same item.')
      }
      return await models.ProductGroups.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            modifiedAt: new Date()
          }
        }
      );
    }

    public static async removeProductGroups(ids: string[]) {
      return models.ProductGroups.deleteMany({ _id: { $in: ids } });
    }
  }

  productGroupSchema.loadClass(ProductGroup);

  return productGroupSchema;
};
