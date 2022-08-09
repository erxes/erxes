import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { ITripEdit } from '../graphql/resolvers/mutations/trips';
import { sendCardsMessage } from '../messageBroker';
import {
  ITrackingItem,
  ITrip,
  ITripDocument,
  tripSchema
} from './definitions/trips';

export interface ITripModel extends Model<ITripDocument> {
  getTrip(doc: any): ITripDocument;
  createTrip(doc: ITrip): ITripDocument;
  updateTrip(doc: ITripEdit): ITripDocument;
  updateTracking(_id: string, trackingData: ITrackingItem[]): ITripDocument;
  removeTrip(_id: string): ITripDocument;
  matchWithDeals(_id: string, subdomain: string): any[];
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

    public static async updateTracking(
      _id: string,
      trackingData: ITrackingItem[]
    ) {
      await models.Trips.getTrip({ _id });

      await models.Trips.updateOne(
        { _id: _id },
        {
          $push: {
            trackingData: {
              $each: trackingData.map(e => [
                e.lat,
                e.lng,
                e.trackedDate.getTime() / 1000
              ])
            }
          }
        }
      );

      return models.Trips.findOne({ _id });
    }

    public static async matchWithDeals(_id: string, subdomain: string) {
      const trip = await models.Trips.findOne({ _id });

      if (!trip) {
        throw new Error('trip not found');
      }

      const dirs = await models.Routes.findOne({ _id: trip.routeId }).distinct(
        'directionIds'
      );

      const placeIds = await models.Directions.find({
        _id: { $in: dirs }
      }).distinct('placeIds');

      const dealIds = await models.DealPlaces.find({
        $or: [
          { startPlaceId: { $in: placeIds } },
          { endPlaceId: { $in: placeIds } }
        ]
      }).distinct('dealId');

      const deals = await sendCardsMessage({
        subdomain,
        action: 'deals.find',
        data: {
          _id: { $in: dealIds }
        },
        isRPC: true
      });

      return deals || [];
    }
  }

  tripSchema.loadClass(Trip);

  return tripSchema;
};
