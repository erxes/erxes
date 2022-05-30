import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { routeSchema, IRoute, IRouteDocument } from './definitions/routes';

export interface IRouteModel extends Model<IRouteDocument> {
  getRoute(doc: any): IRouteDocument;
  createRoute(doc: IRoute): IRouteDocument;
  updateRoute(_id: string, fields: IRoute): IRouteDocument;
  removeRoute(_id: string): IRouteDocument;
}

export const loadRouteClass = (models: IModels) => {
  class Route {
    public static async getRoute(doc: any) {
      const participant = await models.Routes.findOne(doc);

      if (!participant) {
        throw new Error('Participant not found');
      }

      return participant;
    }
  }

  routeSchema.loadClass(Route);

  return routeSchema;
};
