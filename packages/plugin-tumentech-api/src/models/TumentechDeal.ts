import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { ITumentechDealEdit } from '../graphql/resolvers/mutations/tumentechDeal';
import {
  ITumentechDeal,
  ITumentechDealDocument,
  tumentechDealSchema
} from './definitions/tumentechDeal';

export interface ITumentechDealModel extends Model<ITumentechDealDocument> {
  getTumentechDeal(doc: any): ITumentechDealDocument;
  createTumentechDeal(doc: ITumentechDeal): ITumentechDealDocument;
  updateTumentechDeal(doc: ITumentechDealEdit): ITumentechDealDocument;
  removeTumentechDeal(_id: string): ITumentechDealDocument;
}

export const loadTumentechDealClass = (models: IModels) => {
  class TumentechDeal {
    public static async getTumentechDeal(doc: any) {
      const tumentechDeal = await models.TumentechDeals.findOne(doc);

      if (!tumentechDeal) {
        throw new Error('Deal not found');
      }

      return tumentechDeal;
    }

    public static async createTumentechDeal(doc: ITumentechDeal) {
      return models.TumentechDeals.create(doc);
    }

    public static async updateTumentechDeal(doc: ITumentechDealEdit) {
      const route = await models.TumentechDeals.getTumentechDeal({
        _id: doc._id
      });

      await models.TumentechDeals.updateOne(
        { _id: doc._id },
        { $set: { ...doc } }
      );

      return models.TumentechDeals.findOne({ _id: doc._id });
    }
  }

  tumentechDealSchema.loadClass(TumentechDeal);
  return tumentechDealSchema;
};
