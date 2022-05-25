import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  routeOptionsSchema,
  IRouteOption,
  IRouteOptionDocument
} from './definitions/routeOptions';

export interface IRouteOptionModel extends Model<IRouteOptionDocument> {
  getStaticRoute(doc: any): IRouteOptionDocument;
  createStaticRoute(doc: IRouteOption): IRouteOptionDocument;
  updateStaticRoute(_id: string, fields: IRouteOption): IRouteOptionDocument;
  removeStaticRoute(_id: string): IRouteOptionDocument;
}

export const loadParticipantClass = (models: IModels) => {
  class RouteOption {
    public static async getStaticRoute(doc: any) {
      const participant = await models.RouteOptions.findOne(doc);

      if (!participant) {
        throw new Error('Participant not found');
      }

      return participant;
    }
  }

  routeOptionsSchema.loadClass(RouteOption);

  return routeOptionsSchema;
};
