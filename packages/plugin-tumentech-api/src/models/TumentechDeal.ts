import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { ITumentechDealEdit } from '../graphql/resolvers/mutations/tumentechDeal';
import {
  ITumentechDeal,
  ITumentechDealDocument,
  tumentechDealSchema
} from './definitions/tumentechDeal';
import { trackingSchema } from './definitions/trips';

export interface ITumentechDealModel extends Model<ITumentechDealDocument> {
  getTumentechDeal(
    _id: string,
    dealId?: string,
    userId?: string
  ): ITumentechDealDocument;
  createTumentechDeal(doc: ITumentechDeal): ITumentechDealDocument;
  updateTumentechDeal(doc: ITumentechDealEdit): ITumentechDealDocument;
  removeTumentechDeal(_id: string): ITumentechDealDocument;
}

export const loadTumentechDealClass = (models: IModels) => {
  class TumentechDeal {
    public static async getTumentechDeal(
      _id: string,
      dealId: string,
      userId: string
    ) {
      if (!_id && !dealId) {
        throw new Error('Please provide _id or dealId ');
      }

      let qry: any = { _id };

      if (dealId && dealId !== '') {
        qry = { dealId };
      }

      if (userId) {
        qry.createdBy = userId;
      }

      const tumentechDeal = await models.TumentechDeals.findOne(qry);

      if (!tumentechDeal) {
        throw new Error('Deal not found');
      }

      return tumentechDeal;
    }

    public static async createTumentechDeal(doc: ITumentechDeal) {
      return models.TumentechDeals.create(doc);
    }

    public static async updateTumentechDeal(doc: ITumentechDealEdit) {
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

export const loadTrackingClass = (models: IModels) => {
  class Tracking {
    public static async getTracking(doc: any) {
      const tracking = await models.Tracking.findOne(doc);

      if (!tracking) {
        throw new Error('tracking not found');
      }

      return tracking;
    }
  }

  trackingSchema.loadClass(Tracking);

  return trackingSchema;
};
