import {
  IProductGroup,
  IProductGroupDocument,
} from '@/ebarimt/@types/productGroup';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { productGroupSchema } from '../definitions/productGroup';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

export interface IProductGroupModel extends Model<IProductGroupDocument> {
  createProductGroup(doc: IProductGroup): Promise<IProductGroupDocument>;
  updateProductGroup(
    _id: string,
    doc: IProductGroup,
  ): Promise<IProductGroupDocument>;
  removeProductGroups(ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadProductGroupClass = (
  models: IModels,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class ProductGroup {
    /**
     * Create a product group
     */
    public static async createProductGroup(doc: IProductGroup) {
      if (doc.mainProductId === doc.subProductId) {
        throw new Error('Do not select the same item.');
      }

      const group = await models.ProductGroups.create({
        ...doc,
        createdAt: new Date(),
      });

      sendDbEventLog({
        action: 'create',
        docId: group._id,
        currentDocument: group.toObject(),
      });

      return group;
    }

    /**
     * Update a product group
     */
    public static async updateProductGroup(_id: string, doc: IProductGroup) {
      if (doc.mainProductId === doc.subProductId) {
        throw new Error('Do not select the same item.');
      }

      const oldGroup = await models.ProductGroups.findOne({ _id }).lean();
      if (!oldGroup) {
        throw new Error('Product group not found');
      }

      await models.ProductGroups.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            modifiedAt: new Date(),
          },
        },
      );

      const updatedGroup = await models.ProductGroups.findOne({ _id }).lean();

      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: updatedGroup,
        prevDocument: oldGroup,
      });

      return updatedGroup as IProductGroupDocument;
    }

    public static async removeProductGroups(ids: string[]) {
      const groups = await models.ProductGroups.find({ _id: { $in: ids } }).lean();
      const result = await models.ProductGroups.deleteMany({ _id: { $in: ids } });

      for (const group of groups) {
        sendDbEventLog({
          action: 'delete',
          docId: group._id,
        });
      }

      return result;
    }
  }

  productGroupSchema.loadClass(ProductGroup);
  return productGroupSchema;
};