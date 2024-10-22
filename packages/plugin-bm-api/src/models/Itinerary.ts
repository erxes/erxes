// import { sendCoreMessage, sendInternalNotesMessage } from '../messageBroker';

import { Model } from 'mongoose';
import { validSearchText } from '@erxes/api-utils/src';
import {
  IItinerary,
  IItineraryDocument,
  initnarySchema,
} from './definitions/itinerary';
import { IContext, IModels } from '../connectionResolver';

export interface IItineraryModel extends Model<IItineraryDocument> {
  createItinerary(doc: IItinerary, user: any): Promise<IItineraryDocument>;
  getItinerary(_id: string): Promise<IItineraryDocument>;
  updateItinerary(_id: string, doc: IItinerary): Promise<IItineraryDocument>;
  removeItinerary(ids: string[]): Promise<IItineraryDocument>;
}

export const loadItineraryClass = (models: IModels, subdomain: string) => {
  class Itinerary {
    /**
     * Retreives element
     */
    public static async getItinerary(_id: string) {
      const element = await models.Itineraries.findOne({ _id });
      if (!element) {
        throw new Error('Itinerary not found');
      }
      return element;
    }
    /**
     * Create a element
     */
    public static async createItinerary(doc, user) {
      const element = await models.Itineraries.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });
      return element;
    }

    /**
     * Update element
     */
    public static async updateItinerary(_id, doc) {
      await models.Itineraries.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } }
      );

      return await models.Itineraries.findOne({ _id });
    }

    /**
     * Remove elements
     */
    public static async removeItinerary(ids) {
      return models.Itineraries.deleteMany({ _id: { $in: ids } });
    }
  }
  initnarySchema.loadClass(Itinerary);
  return initnarySchema;
};
