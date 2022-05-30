import { IRoute, IRouteDocument } from '../../../models/definitions/routes';
import { IContext } from '../../../connectionResolver';

export interface IRouteEdit extends IRoute {
  _id: string;
}

const routeMutations = {
  routesAdd: async (_root, doc: IRoute, { models }: IContext) => {
    console.log(doc);
    return models.Routes.create(doc);
  }

  // directionsEdit: async (_root, doc: IRouteEdit, { models }: IContext) => {
  //   console.log(doc)
  //   return models.Directions.updateDirection(doc);
  // },

  // directionsRemove: (_root, { _id }, { models }: IContext) => {
  //   return models.Directions.remove({ _id });
  // }
};

export default routeMutations;
