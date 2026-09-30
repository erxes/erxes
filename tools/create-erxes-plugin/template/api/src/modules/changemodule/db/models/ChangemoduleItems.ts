import { Model, Schema } from 'mongoose';
import { IModels } from '../../../../connectionResolvers';
import {
  IChangemoduleItem,
  IChangemoduleItemDocument,
  changemoduleItemSchema,
} from '../definitions/items';

export interface IChangemoduleItemModel extends Model<IChangemoduleItemDocument> {
  getItem(_id: string): Promise<IChangemoduleItemDocument>;
  createItem(doc: IChangemoduleItem): Promise<IChangemoduleItemDocument>;
  updateItem(
    _id: string,
    fields: Partial<IChangemoduleItem>,
  ): Promise<IChangemoduleItemDocument>;
  removeItem(_id: string): Promise<void>;
}

export const loadChangemoduleItemClass = (
  models: IModels,
  _subdomain: string,
) => {
  class ChangemoduleItem {
    public static async getItem(_id: string) {
      const item = await models.ChangemoduleItems.findOne({ _id }).lean();

      if (!item) {
        throw new Error('Changemodule item not found');
      }

      return item;
    }

    public static async createItem(doc: IChangemoduleItem) {
      return await models.ChangemoduleItems.create({
        ...doc,
        createdAt: new Date(),
      });
    }

    public static async updateItem(
      _id: string,
      fields: Partial<IChangemoduleItem>,
    ) {
      await models.ChangemoduleItems.updateOne({ _id }, { $set: fields });
      return await models.ChangemoduleItems.findOne({ _id });
    }

    public static async removeItem(_id: string) {
      const result = await models.ChangemoduleItems.deleteOne({ _id });

      if (!result.deletedCount) {
        throw new Error(`Changemodule item not found with id ${_id}`);
      }
    }
  }

  changemoduleItemSchema.loadClass(ChangemoduleItem);
  return changemoduleItemSchema;
};

export type { Schema };
