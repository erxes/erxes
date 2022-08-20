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
    return models.Routes.updateRoute(doc);
  },

  routesRemove: (_root, { _id }, { models }: IContext) => {
    return models.Routes.remove({ _id });
  }
};

export default routeMutations;
