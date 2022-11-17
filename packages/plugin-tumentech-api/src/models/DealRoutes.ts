import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  dealRouteSchema,
  IDealRoute,
  IDealRouteDocument
} from './definitions/dealRoutes';

export interface IDealRouteModel extends Model<IDealRouteDocument> {
  getDealRoute(doc: any): IDealRouteDocument;
  createOrUpdateDealRoute(doc: IDealRoute): IDealRouteDocument;
  removeDealRoute(dealId: string): IDealRouteDocument;
}

export const loadDealRouteClass = (models: IModels) => {
  class DealRoute {
    /*
     * Get a DealRoute
     */
    public static async getDealRoute(doc: any) {
      const dealRoute = await models.DealRoutes.findOne(doc);

      if (!dealRoute) {
        throw new Error('DealRoute not found');
      }

      return dealRoute;
    }

    public static async createOrUpdateDealRoute(doc: IDealRoute) {
      const { dealId, routeId } = doc;

      const dealRoute = await models.DealRoutes.findOne({
        dealId
      });

      if (!dealRoute) {
        return models.DealRoutes.create({
          ...doc
        });
      }

      routeId && (dealRoute.routeId = routeId);

      dealRoute.save();

      return dealRoute;
    }

    public static async removeDealRoute(dealId) {
      const dealRoute = await models.DealRoutes.findOne({ dealId });

      if (!dealRoute) {
        throw new Error(`DealRoute not found with deal id ${dealId}`);
      }

      return dealRoute.remove();
    }
  }

  dealRouteSchema.loadClass(DealRoute);

  return dealRouteSchema;
};
