import { IDirectionDocument } from './definitions/directions';
import { IRouteEdit } from './../graphql/resolvers/mutations/routes';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { routeSchema, IRoute, IRouteDocument } from './definitions/routes';
import { validSearchText } from '@erxes/api-utils/src';

export interface IRouteModel extends Model<IRouteDocument> {
  getRoute(doc: any): IRouteDocument;
  createRoute(doc: IRoute): IRouteDocument;
  updateRoute(doc: IRouteEdit): IRouteDocument;
  removeRoute(_id: string): IRouteDocument;
  fillSearchText(doc: IRoute): string;
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
      return models.Routes.create({
        ...doc,
        searchText: await models.Routes.fillSearchText(doc)
      });
    }

    public static async updateRoute(doc: IRouteEdit) {
      const route = await models.Routes.getRoute({ _id: doc._id });

      const searchText = await models.Routes.fillSearchText(
        Object.assign(route, doc)
      );

      await models.Routes.updateOne(
        { _id: doc._id },
        { $set: { ...doc, searchText } }
      );

      return models.Routes.findOne({ _id: doc._id });
    }

    public static async removeRoute(doc: IRoute) {
      return models.Routes.remove(doc);
    }

    public static async fillSearchText(doc: IRoute) {
      const directions: IDirectionDocument[] = await models.Directions.find({
        _id: { $in: doc.directionIds }
      }).lean();

      if (!directions.length) {
        return;
      }

      let relatedPlaces: string[] = [];

      for (const dir of directions) {
        const places = await models.Places.find({
          _id: { $in: dir.placeIds }
        }).distinct('province');
        relatedPlaces = relatedPlaces.concat(places);
      }

      return validSearchText([
        doc.code || '',
        doc.name || '',
        ...Array.from(new Set([...relatedPlaces]))
      ]);
    }
  }

  routeSchema.loadClass(Route);

  return routeSchema;
};
