import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  dealPlaceSchema,
  IDealPlace,
  IDealPlaceDocument
} from './definitions/dealPlaces';
import { sendRequest } from '@erxes/api-utils/src';

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

      const place1 = await models.Places.findOne({ _id: startPlaceId });
      const place2 = await models.Places.findOne({ _id: endPlaceId });

      let path: any = null;

      if (place1 && place2) {
        const coordinates = `${place1.center.lng},${place1.center.lat};${place2.center.lng},${place2.center.lat}`;

        const response = await sendRequest({
          url: `https://router.project-osrm.org/route/v1/driving/${coordinates}`,
          method: 'GET'
        });

        const { code, routes } = response;

        if (code === 'Ok' && routes.length > 0) {
          path = routes[0].geometry;
        }
      }

      const dealPlace = await models.DealPlaces.findOne({
        dealId
      });

      if (!dealPlace) {
        return models.DealPlaces.create({
          ...doc,
          path
        });
      }

      dealPlace.path = path;

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
