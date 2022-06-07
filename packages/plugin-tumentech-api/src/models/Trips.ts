import { ITripEdit } from './../graphql/resolvers/mutations/Trips';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { tripSchema, ITrip, ITripDocument } from './definitions/trips';

export interface ITripModel extends Model<ITripDocument> {
  getTrip(doc: any): ITripDocument;
  createTrip(doc: ITrip): ITripDocument;
  updateTrip(doc: ITripEdit): ITripDocument;
  removeTrip(_id: string): ITripDocument;
}

export const loadTripClass = (models: IModels) => {
  class Trip {
    public static async getTrip(doc: any) {
      const trip = await models.Trips.findOne(doc);

      if (!trip) {
        throw new Error('trip not found');
      }

      return trip;
    }

    public static async createTrip(doc: ITrip) {
      return models.Trips.create(doc);
    }

    public static async updateTrip(doc: ITripEdit) {
      const route = await models.Trips.getTrip({ _id: doc._id });

      // const searchText = models.Trips.fillSearchText(
      //   Object.assign(route, doc)
      // );

      await models.Trips.updateOne({ _id: doc._id }, { $set: { ...doc } });

      return models.Trips.findOne({ _id: doc._id });
    }

    public static async removeTrip(doc: ITrip) {
      return models.Trips.remove(doc);
    }
  }

  tripSchema.loadClass(Trip);

  return tripSchema;
};
