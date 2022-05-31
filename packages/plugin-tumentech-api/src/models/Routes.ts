import { IRouteEdit } from './../graphql/resolvers/mutations/routes';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { routeSchema, IRoute, IRouteDocument } from './definitions/routes';

export interface IRouteModel extends Model<IRouteDocument> {
  getRoute(doc: any): IRouteDocument;
  createRoute(doc: IRoute): IRouteDocument;
  updateRoute(doc: IRouteEdit): IRouteDocument;
  removeRoute(_id: string): IRouteDocument;
}

export const loadRouteClass = (models: IModels) => {
  class Route {
    public static async getRoute(doc: any) {
      const route = await models.Routes.findOne(doc);

      if (!route) {
        throw new Error('route not found');
      }

      return route;
    }

    public static async createRoute(doc: IRoute) {
      return models.Routes.create(doc);
    }

    public static async updateRoute(doc: IRouteEdit) {
      const route = await models.Routes.getRoute({ _id: doc._id });

      // const searchText = models.Routes.fillSearchText(
      //   Object.assign(route, doc)
      // );

      await models.Routes.updateOne({ _id: doc._id }, { $set: { ...doc } });

      return models.Routes.findOne({ _id: doc._id });
    }

    public static async removeRoute(doc: IRoute) {
      return models.Routes.remove(doc);
    }
  }

  routeSchema.loadClass(Route);

  return routeSchema;
};
