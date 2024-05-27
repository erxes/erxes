import { validSearchText } from '@erxes/api-utils/src';
import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { IRoute, IRouteDocument, routeSchema } from './definitions/routes';

export interface IRouteModel extends Model<IRouteDocument> {
  getRoute(doc: any): IRouteDocument;
  createRoute(doc: IRoute): IRouteDocument;
  updateRoute(_id: string, doc: IRoute): IRouteDocument;
  removeRoute(_id: string): IRouteDocument;
  fillSearchText(doc: IRoute): string;
}

const docModifer = async (models: IModels, doc: IRoute) => {
  const startDir = await models.Directions.getDirection({
    _id: doc.directionIds[0]
  });

  const endDir = await models.Directions.getDirection({
    _id: doc.directionIds[doc.directionIds.length - 1]
  });

  const startPlace = await models.Places.getPlace({
    _id: startDir.placeIds[0]
  });

  const endPlace = await models.Places.getPlace({
    _id: endDir.placeIds[endDir.placeIds.length - 1]
  });

  doc.name = `${startPlace.name} - ${endPlace.name}`;

  const searchText = await models.Routes.fillSearchText(doc);

  return { ...doc, searchText };
};

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
      return models.Routes.create(await docModifer(models, doc));
    }

    public static async updateRoute(_id: string, doc: IRoute) {
      await models.Routes.getRoute({ _id });

      await models.Routes.updateOne({ _id }, await docModifer(models, doc));

      return models.Routes.findOne({ _id });
    }

    public static async removeRoute(doc: IRoute) {
      return models.Routes.remove(doc);
    }

    public static async fillSearchText(doc: IRoute) {
      return validSearchText([doc.code || '', doc.name || '']);
    }
  }

  routeSchema.loadClass(Route);

  return routeSchema;
};
