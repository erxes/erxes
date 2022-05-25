import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  staticRouteSchema,
  IStaticRoute,
  IStaticRouteDocument
} from './definitions/staticRoutes';

export interface IStaticRouteModel extends Model<IStaticRouteDocument> {
  getStaticRoute(doc: any): IStaticRouteDocument;
  createStaticRoute(doc: IStaticRoute): IStaticRouteDocument;
  updateStaticRoute(_id: string, fields: IStaticRoute): IStaticRouteDocument;
  removeStaticRoute(_id: string): IStaticRouteDocument;
}

export const loadStaticRouteClass = (models: IModels) => {
  class StaticRoute {
    public static async getStaticRoute(doc: any) {
      const participant = await models.StaticRoutes.findOne(doc);

      if (!participant) {
        throw new Error('Participant not found');
      }

      return participant;
    }

    public static async createStaticRoute(doc: IStaticRoute) {
      return models.StaticRoutes.create(doc);
    }
  }

  staticRouteSchema.loadClass(StaticRoute);

  return staticRouteSchema;
};
