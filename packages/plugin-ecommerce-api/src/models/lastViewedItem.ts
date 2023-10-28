import {
  lastvieweditemSchema,
  ILastViewedItem,
  ILastViewedItemDocument
} from './definitions/lastViewedItem';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface ILastViewedItemModel extends Model<ILastViewedItemDocument> {
  getLastViewedItemById(_id: string): Promise<ILastViewedItemDocument>;
  getLastViewedItem(
    productId: string,
    customerId: string
  ): Promise<ILastViewedItemDocument>;
  getLastViewedItems(customerId: string): Promise<ILastViewedItemDocument>;
  lastViewedItemAdd(doc: ILastViewedItem): Promise<ILastViewedItemDocument>;
  updateLastViewedItem(
    _id: string,
    doc: ILastViewedItem
  ): Promise<ILastViewedItemDocument>;
  removeLastViewedItem(_id: string): Promise<ILastViewedItemDocument>;
}

export const loadLastViewedItemClass = (models: IModels, subdomain: string) => {
  class LastViewedItem {
    public static async getLastViewedItem(
      customerId: string,
      productId: string
    ) {
      return models.LastViewedItem.findOne({ productId, customerId }).lean();
    }

    public static async lastViewedItemAdd(doc: ILastViewedItem) {
      const items = await models.LastViewedItem.find({
        customerId: doc.customerId
      }).sort({ modifiedAt: 1 });

      let current = items.find(i => i.productId === doc.productId);

      if (!current && items.length >= 100) {
        current = items[0];
      }

      if (current) {
        await models.LastViewedItem.updateOne(
          { _id: current._id },
          { $set: { ...doc, modifiedAt: new Date() } }
        );
        return models.LastViewedItem.findOne({ _id: current._id });
      }

      const item = await models.LastViewedItem.create({
        ...doc,
        modifiedAt: new Date()
      });
      return item;
    }
    public static async removeLastViewedItem(_id: string) {
      return models.LastViewedItem.findOneAndRemove({ _id });
    }
  }
  lastvieweditemSchema.loadClass(LastViewedItem);
  return lastvieweditemSchema;
};
