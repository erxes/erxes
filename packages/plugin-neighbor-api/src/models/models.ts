import {
  NeighborSchema,
  INeighborDocument,
  INeighborItemDocument,
  NeighborItemSchema,
  INeighborItem,
  INeighbor
} from './definitions/neighbor';
import { Model } from 'mongoose';

export interface INeighborModel extends Model<INeighborDocument> {
  createNeighbor(doc: INeighbor): INeighborDocument;
  updateNeighbor(doc: INeighbor): INeighborDocument;
  removeNeighbor(doc: INeighbor): INeighborDocument;
}

export const loadNeighborClass = models => {
  class Neighbor {
    public static async createNeighbor(doc) {
      const cb = await models.Neighbor.create({
        ...doc
      });
      return cb;
    }

    public static async updateNeighbor(doc) {
      const { productCategoryId } = doc;

      delete doc.productCategoryId;

      return models.Neighbor.updateOne({ productCategoryId }, { $set: doc });
    }

    public static async removeNeighbor(doc) {
      await models.Neighbor.remove({
        productCategoryId: doc.productCategoryId
      });
    }
  }
  NeighborSchema.loadClass(Neighbor);

  return NeighborSchema;
};

export interface INeighborItemModel extends Model<INeighborItemDocument> {
  createNeighborItem(doc: INeighborItem, user: any): JSON;
  updateNeighborItem(doc: INeighborItem): JSON;
  removeNeighborItem(doc: any): JSON;
}

export const loadNeighborItemClass = models => {
  class NeighborItem {
    public static async createNeighborItem(doc, user) {
      const cb = await models.NeighborItem.create({
        ...doc,
        createdBy: user._id,
        createdAt: new Date()
      });

      return cb;
    }

    public static async updateNeighborItem(doc) {
      const { _id } = doc;

      return models.NeighborItem.updateOne({ _id: _id }, { $set: doc });
    }

    public static async removeNeighborItem(doc) {
      const { _id } = doc;

      return models.NeighborItem.deleteOne({ _id });
    }
  }

  NeighborItemSchema.loadClass(NeighborItem);
  return NeighborItemSchema;
};
