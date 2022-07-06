import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  dealPlaceSchema,
  IDealPlace,
  IDealPlaceDocument
} from './definitions/dealPlaces';

export interface IDealPlaceModel extends Model<IDealPlaceDocument> {
  getDealPlace(doc: any): IDealPlaceDocument;
  createOrUpdateDealPlace(doc: IDealPlace): IDealPlaceDocument;
  removeDealPlace(dealId: string): IDealPlaceDocument;
}

export const loadDealPlaceClass = (models: IModels) => {
  class DealPlace {
    /*
     * Get a DealPlace
     */
    public static async getDealPlace(doc: any) {
      const dealPlace = await models.DealPlaces.findOne(doc);

      if (!dealPlace) {
        throw new Error('DealPlace not found');
      }

      return dealPlace;
    }

    public static async createOrUpdateDealPlace(doc: IDealPlace) {
      const { dealId, startPlaceId, endPlaceId } = doc;

      const dealPlace = await models.DealPlaces.findOne({
        dealId
      });

      if (!dealPlace) {
        return models.DealPlaces.create({
          ...doc
        });
      }

      startPlaceId && (dealPlace.startPlaceId = startPlaceId);
      endPlaceId && (dealPlace.endPlaceId = endPlaceId);

      dealPlace.save();

      return dealPlace;
    }

    public static async removeDealPlace(dealId) {
      const dealPlace = await models.DealPlaces.findOne({ dealId });

      if (!dealPlace) {
        throw new Error(`DealPlace not found with deal id ${dealId}`);
      }

      return dealPlace.remove();
    }
  }

  dealPlaceSchema.loadClass(DealPlace);

  return dealPlaceSchema;
};
