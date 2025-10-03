import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import { IItinerary, IItineraryDocument } from '@/bms/@types/itinerary';
import { itinerarySchema } from '@/bms/db/definitions/itinerary';

export interface IItineraryModel extends Model<IItineraryDocument> {
  createItinerary(doc: IItinerary, user: any): Promise<IItineraryDocument>;
  getItinerary(_id: string): Promise<IItineraryDocument>;
  updateItinerary(_id: string, doc: IItinerary): Promise<IItineraryDocument>;
  removeItinerary(ids: string[]): Promise<IItineraryDocument>;
}

export const loadItineraryClass = (models: IModels) => {
  class Itinerary {
    /**
     * Retrieves element
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
        { $set: { ...doc, modifiedAt: new Date() } },
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
  itinerarySchema.loadClass(Itinerary);
  return itinerarySchema;
};
