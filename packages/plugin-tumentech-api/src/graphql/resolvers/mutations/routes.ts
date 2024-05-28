import { IContext } from '../../../connectionResolver';
import { IRoute } from '../../../models/definitions/routes';

export interface IRouteEdit extends IRoute {
  _id: string;
}

const routeMutations = {
  routesAdd: async (_root, doc: IRoute, { models }: IContext) => {
    return models.Routes.createRoute(doc);
  },

  routesEdit: async (_root, doc: IRouteEdit, { models }: IContext) => {
    const { _id, ...route } = doc;
    return models.Routes.updateRoute(_id, route);
  },

  routesRemove: (_root, { _id }, { models }: IContext) => {
    return models.Routes.remove({ _id });
  },

  setDealRoute: async (
    _root,
    { dealId, routeId, reversed },
    { models }: IContext
  ) => {
    return models.DealRoutes.createOrUpdateDealRoute({
      dealId,
      routeId,
      reversed
    });
  }
};

export default routeMutations;
