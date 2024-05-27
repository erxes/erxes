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
import {
  filterDeals,
  filterDealsByCar,
  filterDealsByRoute,
  locationFilter,
  prepareDateFilter
} from './utils';

export interface ITripModel extends Model<ITripDocument> {
  getTrip(doc: any): ITripDocument;
  createTrip(doc: ITrip): ITripDocument;
  updateTrip(doc: ITripEdit): ITripDocument;
  updateTracking(_id: string, trackingData: ITrackingItem[]): ITripDocument;
  removeTrip(_id: string): ITripDocument;
  matchWithDeals(
    subdomain: string,
    carId?: string,
    routeId?: string,
    categoryIds?: string[],
    dateType?: 'createdAt' | 'ShipmentTime',
    date?: string,
    currentLocation?: { lat: number; lng: number },
    searchRadius?: number
  ): any[];
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
        { _id },
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

    public static async matchWithDeals(
      subdomain: string,
      carId?: string,
      routeId?: string,
      categoryIds?: string[],
      dateType: 'createdAt' | 'ShipmentTime' = 'ShipmentTime',
      date?: string,
      currentLocation?: { lat: number; lng: number },
      searchRadius?: number
    ) {
      const stage = await sendCardsMessage({
        subdomain,
        action: 'stages.findOne',
        data: { code: 'newOrder', type: 'deal' },
        isRPC: true,
        defaultValue: null
      });

      if (!stage) {
        throw new Error('stage not found');
      }

      if (carId && routeId) {
        return filterDeals(
          models,
          subdomain,
          stage._id,
          carId,
          routeId,
          date,
          dateType,
          currentLocation,
          searchRadius
        );
      }

      if (routeId) {
        return filterDealsByRoute(
          models,
          subdomain,
          stage._id,
          routeId,
          date,
          dateType,
          currentLocation,
          searchRadius
        );
      }

      if (carId) {
        return filterDealsByCar(
          models,
          subdomain,
          stage._id,
          carId,
          date,
          dateType,
          currentLocation,
          searchRadius
        );
      }

      if (categoryIds) {
        return sendCardsMessage({
          subdomain,
          action: 'deals.find',
          data: {
            'customFieldsData.value': { $in: categoryIds },
            stageId: stage._id
          },
          isRPC: true,
          defaultValue: []
        });
      }

      const data: any = {
        stageId: stage._id,
        ...(await prepareDateFilter(
          subdomain,
          dateType || 'ShipmentTime',
          date
        )),
        ...(await locationFilter(subdomain, currentLocation, searchRadius))
      };

      return sendCardsMessage({
        subdomain,
        action: 'deals.find',
        data,
        isRPC: true,
        defaultValue: []
      });
    }
  }

  tripSchema.loadClass(Trip);

  return tripSchema;
};
