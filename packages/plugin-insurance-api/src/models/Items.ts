import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IInsuranceItem,
  IInsuranceItemDocument,
  itemSchema
} from './definitions/item';

export interface IInsuranceItemModel extends Model<IInsuranceItemDocument> {
  getInsuranceItem(doc: any): IInsuranceItemDocument;
  createInsuranceItem(
    doc: IInsuranceItem,
    userId?: string
  ): IInsuranceItemDocument;
  updateInsuranceItem(
    doc: IInsuranceItemDocument,
    userId?: string
  ): IInsuranceItemDocument;
}

export const loadItemClass = (models: IModels) => {
  class InsuranceItem {
    public static async getInsuranceItem(doc: any) {
      const item = await models.Items.findOne(doc);

      if (!item) {
        throw new Error('item not found');
      }

      return item;
    }

    public static async createInsuranceItem(
      doc: IInsuranceItem,
      userId?: string
    ) {
      return models.Items.create({
        ...doc,
        lastModifiedBy: userId
      });
    }

    public static async updateInsuranceItem(
      doc: IInsuranceItemDocument,
      userId?: string
    ) {
      await models.Items.getInsuranceItem({ _id: doc._id });

      const updatedDoc: any = {
        ...doc
      };

      if (userId) {
        updatedDoc.lastModifiedBy = userId;
      }

      await models.Items.updateOne({ _id: doc._id }, { $set: updatedDoc });

      return models.Items.findOne({ _id: doc._id });
    }
  }

  itemSchema.loadClass(InsuranceItem);

  return itemSchema;
};
